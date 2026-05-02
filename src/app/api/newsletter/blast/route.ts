import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Securely verify if the request comes from an authenticated Admin.
 */
async function verifyAdmin(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) return false;

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return false;

    const parts = idToken.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    return payload?.admin === true;
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
    const { subject, content, templateType } = await req.json();

    if (!subject || !content) {
      return NextResponse.json({ error: "Missing subject or content" }, { status: 400 });
    }

    // 1. Fetch all subscribers from Firestore REST API
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/newsletter?key=${apiKey}&pageSize=1000`;
    const firestoreRes = await fetch(url);
    
    if (!firestoreRes.ok) {
      throw new Error("Failed to fetch subscribers");
    }

    const data = await firestoreRes.json();
    const subscribers = (data.documents || []).map((doc: any) => doc.fields.email.stringValue);

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No subscribers to blast" });
    }

    // 2. Prepare Batch Send via Resend
    // Resend batch limit is 100 emails per request. We need to chunk if larger.
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const chunk = subscribers.slice(i, i + batchSize);
      
      const batchData = chunk.map((email: string) => ({
        from: "KhUShKhUSh <newsletter@khushkhush.com>",
        to: email,
        subject: subject,
        html: content, // The editor provides HTML
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
