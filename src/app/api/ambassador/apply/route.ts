import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`ambassador-apply-${ip}`, 5, 3600000);

    if (!success) {
      return NextResponse.json({ error: "Zyada attempts. Baad mein aana." }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, instagram, college, reason, userId } = body || {};

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Naam likho." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Email theek nahi." }, { status: 400 });
    }
    if (!instagram || typeof instagram !== "string") {
      return NextResponse.json({ error: "Instagram handle chahiye." }, { status: 400 });
    }
    if (!college || typeof college !== "string") {
      return NextResponse.json({ error: "College ka naam chahiye." }, { status: 400 });
    }
    if (!reason || typeof reason !== "string") {
      return NextResponse.json({ error: "Reason likho." }, { status: 400 });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      console.error("Missing Firebase environment variables");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const docId = crypto.randomUUID();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedInstagram = instagram.trim().replace(/^@/, "");

    const createUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/ambassadorApplications?documentId=${docId}&key=${apiKey}`;

    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          name: { stringValue: name.trim() },
          email: { stringValue: normalizedEmail },
          instagram: { stringValue: normalizedInstagram },
          college: { stringValue: college.trim() },
          reason: { stringValue: reason.trim() },
          status: { stringValue: "pending" },
          userId: userId ? { stringValue: String(userId) } : { nullValue: "NULL_VALUE" },
          createdAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json();
      console.error("Ambassador apply error:", errData);
      return NextResponse.json({ error: "Application failed." }, { status: 500 });
    }

    if (userId) {
      const updateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${encodeURIComponent(String(userId))}?key=${apiKey}&updateMask.fieldPaths=college&updateMask.fieldPaths=ambassadorStatus&updateMask.fieldPaths=updatedAt`;
      await fetch(updateUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            college: { stringValue: college.trim() },
            ambassadorStatus: { stringValue: "pending" },
            updatedAt: { timestampValue: new Date().toISOString() },
          },
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ambassador apply error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
