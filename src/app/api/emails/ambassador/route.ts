import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rateLimit";
import { AmbassadorApplicationReceived } from "@/emails/AmbassadorApplicationReceived";
import { AmbassadorApproved } from "@/emails/AmbassadorApproved";
import { AmbassadorRejected } from "@/emails/AmbassadorRejected";
import { getKhusbassadorConfig } from "@/lib/khusbassadorConfig.server";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

type Event = "received" | "approved" | "rejected";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`email-ambassador-${ip}`, 10, 600000);
    if (!success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const { event, customerEmail, customerName, college, referralCode } = (await req.json()) as {
      event: Event;
      customerEmail?: string;
      customerName?: string;
      college?: string;
      referralCode?: string;
    };

    if (!event || !customerEmail) {
      return NextResponse.json({ error: "Missing event or email" }, { status: 400 });
    }

    const name = (customerName || "Khusbassador").trim();

    let subject: string;
    let react: React.ReactElement;

    switch (event) {
      case "received":
        subject = "Form mil gaya. — KhUShKhUSh.";
        react = AmbassadorApplicationReceived({ customerName: name, college });
        break;
      case "approved": {
        if (!referralCode) {
          return NextResponse.json({ error: "Missing referralCode" }, { status: 400 });
        }
        const config = await getKhusbassadorConfig();
        subject = `You are IN, ${name}. Your code is live. — KhUShKhUSh.`;
        react = AmbassadorApproved({
          customerName: name,
          referralCode,
          coinsPerShirt: config.ambassadorCoinsPerShirt,
          customerDiscountPerShirt: config.customerDiscountPerShirt,
        });
        break;
      }
      case "rejected":
        subject = "Not this time. — KhUShKhUSh.";
        react = AmbassadorRejected({ customerName: name });
        break;
      default:
        return NextResponse.json({ error: "Unknown event" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "KhUShKhUSh <ambassadors@khushkhush.com>",
      to: [customerEmail],
      subject,
      react,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Ambassador email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
