import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
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
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`order-create-${ip}`, 3, 600000);
    
    if (!success) {
      return NextResponse.json({ error: "Too many order attempts. Please wait." }, { status: 429 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    const body = await req.json();
    const { userId, customerInfo, items, subtotal, shipping, couponCode, referralCode, coinsToRedeem } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user || user.id !== userId) {
      return NextResponse.json({ error: "Token user mismatch" }, { status: 403 });
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

    let verifiedDiscount = 0;
    let finalCouponCode: string | null = null;

    if (couponCode) {
      const normalizedCoupon = normalizeCode(couponCode);
      const { data: couponData } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", normalizedCoupon)
        .single();

      if (couponData && couponData.active) {
        const amount = numeric(couponData.discount_value);
        verifiedDiscount = couponData.discount_type === "percentage" ? Math.round((verifiedSubtotal * amount) / 100) : Math.round(amount);
        finalCouponCode = normalizedCoupon;
      }
    }

    const verifiedTotal = Math.max(0, verifiedSubtotal + verifiedShipping - verifiedDiscount);
    const orderNumber = `KK-${Date.now().toString().slice(-6)}`;

    const { data: newOrder, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        customer_email: customerInfo?.email || user.email || "",
        customer_name: customerInfo?.fullName || "Valued Customer",
        customer_phone: customerInfo?.phone || "",
        shipping_address: customerInfo || {},
        items: normalizedItems,
        subtotal: verifiedSubtotal,
        discount: verifiedDiscount,
        shipping: verifiedShipping,
        total: verifiedTotal,
        payment_method: "COD",
        payment_status: "Pending",
        order_status: "Pending",
        applied_coupon: finalCouponCode,
      })
      .select()
      .single();

    if (orderErr) {
      console.error("Supabase Order Insert Error:", orderErr);
      return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
      total: verifiedTotal,
    });
  } catch (error: unknown) {
    console.error("Order creation internal error:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
