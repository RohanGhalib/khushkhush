import { NextResponse } from 'next/server';
import { rateLimit } from "@/lib/rateLimit";
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`email-welcome-${ip}`, 3, 3600000);
    
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const { customerEmail, customerName } = await req.json();

    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const { data: productsData } = await supabaseAdmin
      .from("products")
      .select("slug, title, price, images")
      .eq("status", "Active")
      .order("created_at", { ascending: false })
      .limit(3);

    const recentProducts = (productsData || []).map(p => ({
      slug: p.slug,
      name_en: p.title,
      price: p.price,
      image: p.images?.[0] || "",
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
