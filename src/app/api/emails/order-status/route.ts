import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { OrderStatusUpdate } from '@/emails/OrderStatusUpdate';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { orderId, customerEmail, customerName, status } = await req.json();

    if (!orderId || !customerEmail || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only send for specific statuses we have templates for
    if (!['Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return NextResponse.json({ success: true, message: "Status ignored for email" });
    }

    const { data, error } = await resend.emails.send({
      from: 'KhUShKhUSh <orders@khushkhush.com>',
      to: [customerEmail],
      subject: `Order #${orderId} - ${status.toUpperCase()}!`,
      react: OrderStatusUpdate({ orderId, customerName, status }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Status email error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
