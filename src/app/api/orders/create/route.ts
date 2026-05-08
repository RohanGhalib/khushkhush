import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

const REFERRAL_DISCOUNT_RATE = 0.1;
const AMBASSADOR_EARNINGS_PER_SHIRT = 100;
const VAULT_EARNINGS_PER_SHIRT = 300;
const VAULT_DOC_ID = "global";

const getNumberField = (field: any) => {
  if (field?.integerValue) return parseInt(field.integerValue, 10);
  if (typeof field?.doubleValue === "number") return field.doubleValue;
  return 0;
};

const normalizeCode = (code: string) => code.trim().toUpperCase();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`order-create-${ip}`, 3, 600000);

    if (!success) {
      return NextResponse.json({ error: "Too many order attempts. Please wait." }, { status: 429 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1];

    const body = await req.json();
    const { userId, customerInfo, items, subtotal, shipping, couponCode, referralCode } = body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }
    if (typeof subtotal !== "number" || typeof shipping !== "number") {
      return NextResponse.json({ error: "Invalid totals" }, { status: 400 });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    let verifiedDiscount = 0;
    let finalCouponCode: string | null = null;

    if (typeof couponCode === "string" && couponCode.trim()) {
      const couponUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/coupons/${encodeURIComponent(normalizeCode(couponCode))}?key=${apiKey}`;
      const couponRes = await fetch(couponUrl, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (couponRes.ok) {
        const couponData = await couponRes.json();
        const fields = couponData.fields;
        if (fields && fields.status?.stringValue === "Active") {
          const type = fields.type?.stringValue;
          const amount = getNumberField(fields.discountAmount);
          if (type === "percent") {
            verifiedDiscount = Math.round((subtotal * amount) / 100);
          } else {
            verifiedDiscount = amount;
          }
          finalCouponCode = normalizeCode(couponCode);
        }
      }
    }

    const normalizedReferralCode = typeof referralCode === "string" && referralCode.trim()
      ? normalizeCode(referralCode)
      : null;

    let ambassadorId: string | null = null;
    let ambassadorCollege = "";
    let referralDiscount = 0;

    if (normalizedReferralCode) {
      const referralQueryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
      const referralQueryRes = await fetch(referralQueryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "users" }],
            where: {
              compositeFilter: {
                op: "AND",
                filters: [
                  {
                    fieldFilter: {
                      field: { fieldPath: "referralCode" },
                      op: "EQUAL",
                      value: { stringValue: normalizedReferralCode },
                    },
                  },
                  {
                    fieldFilter: {
                      field: { fieldPath: "ambassadorStatus" },
                      op: "EQUAL",
                      value: { stringValue: "active" },
                    },
                  },
                ],
              },
            },
            limit: 1,
          },
        }),
      });

      if (referralQueryRes.ok) {
        const results = await referralQueryRes.json();
        const document = results?.find((result: any) => result.document)?.document;
        if (document?.name) {
          ambassadorId = document.name.split("/").pop() || null;
          ambassadorCollege = document.fields?.college?.stringValue || "";
          referralDiscount = Math.min(
            Math.round(subtotal * REFERRAL_DISCOUNT_RATE),
            subtotal
          );
        }
      }
    }

    const totalDiscount = Math.min(subtotal, verifiedDiscount + referralDiscount);
    const verifiedTotal = Math.max(0, subtotal + shipping - totalDiscount);
    const shirtCount = items.reduce((sum: number, item: any) => sum + Math.max(0, Number(item.qty) || 0), 0);

    const orderId = crypto.randomUUID();
    const orderDocName = `projects/${projectId}/databases/(default)/documents/orders/${orderId}`;

    const orderFields = {
      userId: { stringValue: userId },
      customerInfo: {
        mapValue: {
          fields: {
            fullName: { stringValue: customerInfo?.fullName || "" },
            email: { stringValue: customerInfo?.email || "" },
            phone: { stringValue: customerInfo?.phone || "" },
            address: { stringValue: customerInfo?.address || "" },
            city: { stringValue: customerInfo?.city || "" },
            postalCode: { stringValue: customerInfo?.postalCode || "" },
          },
        },
      },
      items: {
        arrayValue: {
          values: items.map((item: any) => ({
            mapValue: {
              fields: {
                id: { stringValue: String(item.id) },
                slug: { stringValue: item.slug },
                name_en: { stringValue: item.name_en },
                size: { stringValue: item.size },
                price: { integerValue: String(Math.round(item.price)) },
                qty: { integerValue: String(Math.round(item.qty)) },
                image: { stringValue: item.image || "" },
              },
            },
          })),
        },
      },
      subtotal: { integerValue: String(Math.round(subtotal)) },
      shipping: { integerValue: String(Math.round(shipping)) },
      discount: { integerValue: String(Math.round(totalDiscount)) },
      couponDiscount: { integerValue: String(Math.round(verifiedDiscount)) },
      referralDiscount: { integerValue: String(Math.round(referralDiscount)) },
      appliedCoupon: finalCouponCode ? { stringValue: finalCouponCode } : { nullValue: "NULL_VALUE" },
      referralCode: normalizedReferralCode ? { stringValue: normalizedReferralCode } : { nullValue: "NULL_VALUE" },
      ambassadorId: ambassadorId ? { stringValue: ambassadorId } : { nullValue: "NULL_VALUE" },
      total: { integerValue: String(Math.round(verifiedTotal)) },
      status: { stringValue: "Pending" },
      paymentMethod: { stringValue: "COD" },
      createdAt: { timestampValue: new Date().toISOString() },
    };

    const writes: any[] = [
      {
        update: {
          name: orderDocName,
          fields: orderFields,
        },
        currentDocument: { exists: false },
      },
    ];

    if (ambassadorId && normalizedReferralCode && shirtCount > 0) {
      const vaultDocPath = `projects/${projectId}/databases/(default)/documents/vault/${VAULT_DOC_ID}`;
      const vaultDocUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/vault/${VAULT_DOC_ID}?key=${apiKey}`;
      const vaultCheckRes = await fetch(vaultDocUrl, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (vaultCheckRes.status === 404) {
        await fetch(`${vaultDocUrl}&updateMask.fieldPaths=balance&updateMask.fieldPaths=createdAt`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({
            fields: {
              balance: { integerValue: "0" },
              createdAt: { timestampValue: new Date().toISOString() },
            },
          }),
        });
      }

      const ambassadorEarnings = shirtCount * AMBASSADOR_EARNINGS_PER_SHIRT;
      const vaultEarnings = shirtCount * VAULT_EARNINGS_PER_SHIRT;

      const referralDocName = `projects/${projectId}/databases/(default)/documents/referrals/${orderId}`;
      writes.push({
        update: {
          name: referralDocName,
          fields: {
            orderId: { stringValue: orderId },
            ambassadorId: { stringValue: ambassadorId },
            referralCode: { stringValue: normalizedReferralCode },
            amountAddedToVault: { integerValue: String(vaultEarnings) },
            amountEarnedByAmbassador: { integerValue: String(ambassadorEarnings) },
            shirtCount: { integerValue: String(shirtCount) },
            college: ambassadorCollege ? { stringValue: ambassadorCollege } : { nullValue: "NULL_VALUE" },
            createdAt: { timestampValue: new Date().toISOString() },
          },
        },
        currentDocument: { exists: false },
      });

      writes.push({
        transform: {
          document: `projects/${projectId}/databases/(default)/documents/users/${ambassadorId}`,
          fieldTransforms: [
            {
              fieldPath: "ambassadorEarnings",
              increment: { integerValue: String(ambassadorEarnings) },
            },
            {
              fieldPath: "updatedAt",
              setToServerValue: "REQUEST_TIME",
            },
          ],
        },
      });

      writes.push({
        transform: {
          document: vaultDocPath,
          fieldTransforms: [
            {
              fieldPath: "balance",
              increment: { integerValue: String(vaultEarnings) },
            },
            {
              fieldPath: "updatedAt",
              setToServerValue: "REQUEST_TIME",
            },
          ],
        },
      });
    }

    const commitUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit?key=${apiKey}`;
    const commitRes = await fetch(commitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ writes }),
    });

    if (!commitRes.ok) {
      const err = await commitRes.json();
      console.error("Firestore Order Commit Error Detail:", JSON.stringify(err, null, 2));
      return NextResponse.json(
        {
          error: "Failed to create order",
          detail: err.error?.message || "Unknown Firestore error",
        },
        { status: commitRes.status === 403 ? 403 : 500 }
      );
    }

    return NextResponse.json({ success: true, orderId, total: verifiedTotal });
  } catch (error: any) {
    console.error("Order creation internal error:", error);
    return NextResponse.json({ error: "Internal server error", detail: error.message }, { status: 500 });
  }
}
