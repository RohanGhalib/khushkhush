import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

interface CouponValidateBody {
  code: string;
  subtotal: number;
}

export async function POST(req: Request) {
  try {
    // Rate Limiting: 10 requests per 15 mins per IP
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`coupon-${ip}`, 10, 900000);
    
    if (!success) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    const body: CouponValidateBody = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing coupon code" }, { status: 400 });
    }
    if (typeof subtotal !== "number" || subtotal < 0) {
      return NextResponse.json({ error: "Invalid subtotal" }, { status: 400 });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // Fetch coupon from Firestore via REST API (server-side — cannot be spoofed by client)
    const docId = code.toUpperCase().trim();
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/coupons/${encodeURIComponent(docId)}?key=${apiKey}`;

    const res = await fetch(url);

    if (res.status === 404) {
      return NextResponse.json({ valid: false, error: "INVALID COUPON" }, { status: 200 });
    }
    if (!res.ok) {
      console.error("Firestore coupon fetch failed:", res.status);
      return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
    }

    const data = await res.json();
    const fields = data.fields;

    if (!fields) {
      return NextResponse.json({ valid: false, error: "INVALID COUPON" }, { status: 200 });
    }

    const status = fields.status?.stringValue;
    if (status !== "Active") {
      return NextResponse.json({ valid: false, error: "COUPON EXPIRED" }, { status: 200 });
    }

    const type = fields.type?.stringValue as "percent" | "fixed";
    const discountAmount = fields.discountAmount?.integerValue
      ? parseInt(fields.discountAmount.integerValue, 10)
      : fields.discountAmount?.doubleValue ?? 0;

    let finalDiscount = 0;
    if (type === "percent") {
      finalDiscount = Math.round((subtotal * discountAmount) / 100);
    } else {
      finalDiscount = discountAmount;
    }
    // Never allow discount to exceed the subtotal
    finalDiscount = Math.min(finalDiscount, subtotal);

    return NextResponse.json({
      valid: true,
      code: docId,
      type,
      discountAmount,
      finalDiscount,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
