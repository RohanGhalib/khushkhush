import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { OrderReceipt } from '@/emails/OrderReceipt';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
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
