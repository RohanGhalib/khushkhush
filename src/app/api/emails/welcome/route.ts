import { NextResponse } from 'next/server';
import { rateLimit } from "@/lib/rateLimit";
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Rate Limiting: 3 requests per hour per IP
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`email-welcome-${ip}`, 3, 3600000);
    
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const { customerEmail, customerName } = await req.json();

    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // Fetch 3 most recent products
    const q = query(
      collection(db, "products"),
      where("status", "==", "Active"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const snapshot = await getDocs(q);
    const recentProducts = snapshot.docs.map(doc => ({
      slug: doc.id,
      name_en: doc.data().name_en,
      price: doc.data().price,
      image: doc.data().images?.[0] || "",
    }));

    const { data, error } = await resend.emails.send({
      from: 'KhUShKhUSh <welcome@khushkhush.com>',
      to: [customerEmail],
      subject: `Welcome to the Gang, ${customerName}! - KhUShKhUSh.`,
      react: WelcomeEmail({ customerName, recentProducts }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Welcome email error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
