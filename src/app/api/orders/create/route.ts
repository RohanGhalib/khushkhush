import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getKhusbassadorConfig } from "@/lib/khusbassadorConfig.server";

export const runtime = "nodejs";

type OrderItem = {
  id: string;
  slug?: string;
  name_en?: string;
  size?: string;
  price: number;
  qty: number;
  image?: string;
};

function normalizeCode(code: unknown) {
  return typeof code === "string" ? code.trim().toUpperCase() : "";
}

function numeric(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting: 3 orders per 10 mins per IP
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`order-create-${ip}`, 3, 600000);
    
    if (!success) {
      return NextResponse.json({ error: "Too many order attempts. Please wait." }, { status: 429 });
    }

    // 2. Auth Check: Pass the user's ID token to Firestore REST
    // This ensures Firestore rules (like "allow create: if request.auth != null") pass.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1];

    const body = await req.json();
    const { userId, customerInfo, items, subtotal, shipping, couponCode, referralCode, coinsToRedeem } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Token user mismatch. Nice try." }, { status: 403 });
    }

    const normalizedItems = (items as OrderItem[]).map((item) => ({
      id: String(item.id),
      slug: item.slug || "",
      name_en: item.name_en || "",
      size: item.size || "",
      price: Math.round(numeric(item.price)),
      qty: Math.max(1, Math.round(numeric(item.qty))),
      image: item.image || "",
    }));

    const verifiedSubtotal = Math.round(numeric(subtotal));
    const verifiedShipping = Math.round(numeric(shipping));
    const shirtCount = normalizedItems.reduce((sum, item) => sum + item.qty, 0);

    // 3. Server-side Coupon Validation
    let verifiedDiscount = 0;
    let finalCouponCode: string | null = null;

    if (couponCode) {
      const normalizedCoupon = normalizeCode(couponCode);
      const couponSnap = await adminDb.collection("coupons").doc(normalizedCoupon).get();

      if (couponSnap.exists) {
        const couponData = couponSnap.data();
        if (couponData?.status === "Active") {
          const amount = numeric(couponData.discountAmount);
          verifiedDiscount = couponData.type === "percent" ? Math.round((verifiedSubtotal * amount) / 100) : Math.round(amount);
          finalCouponCode = normalizedCoupon;
        }
      }
    }

    const config = await getKhusbassadorConfig();
    const normalizedReferralCode = normalizeCode(referralCode);
    const requestedCoins = Math.max(0, Math.floor(numeric(coinsToRedeem)));
    const buyerRef = adminDb.collection("users").doc(userId);
    const orderRef = adminDb.collection("orders").doc();
    const vaultRef = adminDb.collection("vault").doc(config.vaultDocumentId);

    const result = await adminDb.runTransaction(async (transaction) => {
      let referral:
        | {
            ambassadorId: string;
            ambassadorEmail: string;
            ambassadorCollege: string;
            code: string;
            referralDiscount: number;
            ambassadorCoins: number;
            vaultContribution: number;
          }
        | null = null;

      if (normalizedReferralCode) {
        const ambassadorQuery = adminDb
          .collection("users")
          .where("referralCode", "==", normalizedReferralCode)
          .where("ambassadorStatus", "==", "active")
          .limit(1);
        const ambassadorSnap = await transaction.get(ambassadorQuery);

        if (!ambassadorSnap.empty) {
          const ambassadorDoc = ambassadorSnap.docs[0];
          const ambassadorData = ambassadorDoc.data();
          if (ambassadorDoc.id !== userId) {
            const referralDiscount = Math.min(
              verifiedSubtotal,
              config.customerDiscountPerShirt * shirtCount
            );

            referral = {
              ambassadorId: ambassadorDoc.id,
              ambassadorEmail: ambassadorData.email || "",
              ambassadorCollege: ambassadorData.college || "",
              code: normalizedReferralCode,
              referralDiscount,
              ambassadorCoins: config.ambassadorCoinsPerShirt * shirtCount,
              vaultContribution: config.vaultContributionPerShirt * shirtCount,
            };
          }
        }
      }

      const referralDiscount = referral?.referralDiscount || 0;

      let coinsRedeemed = 0;
      let buyerBalanceAfter = 0;
      if (requestedCoins > 0) {
        const buyerSnap = await transaction.get(buyerRef);
        const currentCoins = numeric(buyerSnap.data()?.khushCoins);
        const subtotalAfterOtherDiscounts = Math.max(
          0,
          verifiedSubtotal - verifiedDiscount - referralDiscount
        );
        const cap = Math.floor(
          (verifiedSubtotal * config.maxCoinRedemptionPercent) / 100
        );
        coinsRedeemed = Math.min(requestedCoins, currentCoins, cap, subtotalAfterOtherDiscounts);
        buyerBalanceAfter = currentCoins - coinsRedeemed;
      }

      const totalDiscount = Math.min(
        verifiedSubtotal,
        verifiedDiscount + referralDiscount + coinsRedeemed
      );
      const verifiedTotal = Math.max(0, verifiedSubtotal + verifiedShipping - totalDiscount);

      transaction.set(orderRef, {
        userId,
        customerInfo: {
          fullName: customerInfo?.fullName || "",
          email: customerInfo?.email || "",
          phone: customerInfo?.phone || "",
          address: customerInfo?.address || "",
          city: customerInfo?.city || "",
          postalCode: customerInfo?.postalCode || "",
        },
        items: normalizedItems,
        subtotal: verifiedSubtotal,
        shipping: verifiedShipping,
        discount: totalDiscount,
        couponDiscount: verifiedDiscount,
        referralDiscount,
        coinsRedeemed,
        coinsDiscount: coinsRedeemed,
        appliedCoupon: finalCouponCode,
        referralCode: referral?.code || null,
        total: verifiedTotal,
        status: "Pending",
        paymentMethod: "COD",
        createdAt: Timestamp.now(),
      });

      if (referral) {
        const referralRef = adminDb.collection("referrals").doc();
        const ambassadorRef = adminDb.collection("users").doc(referral.ambassadorId);
        const earnLedgerRef = adminDb.collection("coinLedger").doc();

        transaction.set(referralRef, {
          orderId: orderRef.id,
          ambassadorId: referral.ambassadorId,
          ambassadorEmail: referral.ambassadorEmail,
          ambassadorCollege: referral.ambassadorCollege,
          referralCode: referral.code,
          shirtCount,
          orderSubtotal: verifiedSubtotal,
          amountAddedToVault: referral.vaultContribution,
          coinsEarnedByAmbassador: referral.ambassadorCoins,
          createdAt: Timestamp.now(),
        });

        transaction.set(
          ambassadorRef,
          {
            khushCoins: FieldValue.increment(referral.ambassadorCoins),
            khushCoinsEarned: FieldValue.increment(referral.ambassadorCoins),
            ambassadorSales: FieldValue.increment(shirtCount),
            ambassadorReferralUses: FieldValue.increment(1),
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );

        transaction.set(earnLedgerRef, {
          userId: referral.ambassadorId,
          kind: "earn",
          amount: referral.ambassadorCoins,
          orderId: orderRef.id,
          referralCode: referral.code,
          note: `Referral sale x${shirtCount}`,
          shirtCount,
          createdAt: Timestamp.now(),
        });

        transaction.set(
          vaultRef,
          {
            balance: FieldValue.increment(referral.vaultContribution),
            goal: config.vaultGoal,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }

      if (coinsRedeemed > 0) {
        const redeemLedgerRef = adminDb.collection("coinLedger").doc();
        transaction.set(
          buyerRef,
          {
            khushCoins: buyerBalanceAfter,
            khushCoinsSpent: FieldValue.increment(coinsRedeemed),
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
        transaction.set(redeemLedgerRef, {
          userId,
          kind: "redeem",
          amount: -coinsRedeemed,
          balanceAfter: buyerBalanceAfter,
          orderId: orderRef.id,
          note: "Redeemed at checkout",
          createdAt: Timestamp.now(),
        });
      }

      return {
        orderId: orderRef.id,
        total: verifiedTotal,
        referralApplied: !!referral,
        referralDiscount,
        coinsRedeemed,
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    console.error("Order creation internal error:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
