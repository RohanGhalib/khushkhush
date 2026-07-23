import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface CouponValidateBody {
  code: string;
  subtotal: number;
}

export async function POST(req: Request) {
  try {
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

    const docId = code.toUpperCase().trim();

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", docId)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: "INVALID COUPON" }, { status: 200 });
    }

    if (!coupon.active) {
      return NextResponse.json({ valid: false, error: "COUPON EXPIRED" }, { status: 200 });
    }

    const discountType = coupon.discount_type === "percentage" ? "percent" : "fixed";
    const discountAmount = Number(coupon.discount_value) || 0;

    let finalDiscount = 0;
    if (discountType === "percent") {
      finalDiscount = Math.round((subtotal * discountAmount) / 100);
    } else {
      finalDiscount = discountAmount;
    }

    finalDiscount = Math.min(finalDiscount, subtotal);

    return NextResponse.json({
      valid: true,
      code: docId,
      type: discountType,
      discountAmount,
      finalDiscount,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
