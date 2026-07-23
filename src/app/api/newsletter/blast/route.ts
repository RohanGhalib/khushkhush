import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);

async function verifyAdmin(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return false;

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return false;

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("is_admin, role")
      .eq("id", user.id)
      .single();

    return profile?.is_admin === true || profile?.role === "admin";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, content } = await req.json();

    if (!subject || !content) {
      return NextResponse.json({ error: "Missing subject or content" }, { status: 400 });
    }

    const { data: subsData, error: dbError } = await supabaseAdmin
      .from("newsletter")
      .select("email");

    if (dbError) {
      throw new Error("Failed to fetch subscribers from Supabase");
    }

    const subscribers = (subsData || []).map((sub: any) => sub.email);

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No subscribers to blast" });
    }

    const batchSize = 100;
    const results = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const chunk = subscribers.slice(i, i + batchSize);
      
      const batchData = chunk.map((email: string) => ({
        from: "KhUShKhUSh <newsletter@khushkhush.com>",
        to: email,
        subject: subject,
        html: content,
      }));

      const { data: resendData, error } = await resend.batch.send(batchData);
      
      if (error) {
        console.error("Resend Batch Error:", error);
        results.push({ success: false, error });
      } else {
        results.push({ success: true, resendData });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({ 
      success: true, 
      totalSubscribers: subscribers.length,
      batchesSent: results.length,
      successBatches: successCount
    });

  } catch (error: any) {
    console.error("Email blast error:", error);
    return NextResponse.json({ error: "Internal server error", detail: error.message }, { status: 500 });
  }
}
