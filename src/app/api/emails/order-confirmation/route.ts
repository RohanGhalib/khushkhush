import { NextResponse } from 'next/server';
import { rateLimit } from "@/lib/rateLimit";
import { Resend } from 'resend';
import { OrderReceipt } from '@/emails/OrderReceipt';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Rate Limiting: 5 requests per 10 mins per IP
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`email-order-${ip}`, 5, 600000);
    
    if (!success) {
      return NextResponse.json({ error: "Too many email requests. Try again later." }, { status: 429 });
    }

    const { orderId, customerEmail, customerName, total, items } = await req.json();

    if (!orderId || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'KhUShKhUSh <orders@khushkhush.com>',
      to: [customerEmail],
      subject: `Order Confirmed #${orderId} - KhUShKhUSh`,
      react: OrderReceipt({ orderId, customerName, total, items }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
