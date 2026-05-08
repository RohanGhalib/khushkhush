import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

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
    const { userId, customerInfo, items, subtotal, shipping, couponCode } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    // 3. Server-side Coupon Validation
    let verifiedDiscount = 0;
    let finalCouponCode = null;

    if (couponCode) {
      const couponUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/coupons/${encodeURIComponent(couponCode.toUpperCase().trim())}?key=${apiKey}`;
      const couponRes = await fetch(couponUrl, {
        headers: { "Authorization": `Bearer ${idToken}` }
      });
      if (couponRes.ok) {
        const couponData = await couponRes.json();
        const fields = couponData.fields;
        if (fields && fields.status?.stringValue === "Active") {
          const type = fields.type?.stringValue;
          const amount = fields.discountAmount?.integerValue 
            ? parseInt(fields.discountAmount.integerValue, 10) 
            : (fields.discountAmount?.doubleValue ?? 0);
          
          if (type === "percent") {
            verifiedDiscount = Math.round((subtotal * amount) / 100);
          } else {
            verifiedDiscount = amount;
          }
          finalCouponCode = couponCode.toUpperCase().trim();
        }
      }
    }

    const verifiedTotal = Math.max(0, subtotal + shipping - verifiedDiscount);

    // 4. Create Order document via REST API
    const orderUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders?key=${apiKey}`;
    
    // Prepare Firestore REST JSON structure
    const orderDoc = {
      fields: {
        userId: { stringValue: userId },
        customerInfo: {
          mapValue: {
            fields: {
              fullName: { stringValue: customerInfo.fullName || "" },
              email: { stringValue: customerInfo.email || "" },
              phone: { stringValue: customerInfo.phone || "" },
              address: { stringValue: customerInfo.address || "" },
              city: { stringValue: customerInfo.city || "" },
              postalCode: { stringValue: customerInfo.postalCode || "" },
            }
          }
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
                  image: { stringValue: item.image || "" }
                }
              }
            }))
          }
        },
        subtotal: { integerValue: String(Math.round(subtotal)) },
        shipping: { integerValue: String(Math.round(shipping)) },
        discount: { integerValue: String(Math.round(verifiedDiscount)) },
        appliedCoupon: finalCouponCode 
          ? { stringValue: finalCouponCode } 
          : { nullValue: "NULL_VALUE" }, // Correct Firestore REST null syntax
        total: { integerValue: String(Math.round(verifiedTotal)) },
        status: { stringValue: "Pending" },
        paymentMethod: { stringValue: "COD" },
        createdAt: { timestampValue: new Date().toISOString() }
      }
    };

    const createRes = await fetch(orderUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}` // Critical for security rules
      },
      body: JSON.stringify(orderDoc)
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      console.error("Firestore Order Create Error Detail:", JSON.stringify(err, null, 2));
      // Return the error detail to the client so we can diagnose it if it fails again
      return NextResponse.json({ 
        error: "Failed to create order", 
        detail: err.error?.message || "Unknown Firestore error" 
      }, { status: createRes.status === 403 ? 403 : 500 });
    }

    const createdOrder = await createRes.json();
    const orderId = createdOrder.name.split("/").pop();

    return NextResponse.json({ success: true, orderId, total: verifiedTotal });
  } catch (error: any) {
    console.error("Order creation internal error:", error);
    return NextResponse.json({ error: "Internal server error", detail: error.message }, { status: 500 });
  }
}
