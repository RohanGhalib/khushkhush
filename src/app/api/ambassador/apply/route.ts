import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function clean(value: unknown, limit = 240) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`ambassador-apply-${ip}`, 4, 600000);

    if (!success) {
      return NextResponse.json({ error: "Thora sa sabr. Too many applications." }, { status: 429 });
    }

    const body = await req.json();
    const name = clean(body.name, 120);
    const email = clean(body.email, 160).toLowerCase();
    const instagramHandle = clean(body.instagramHandle, 80);
    const college = clean(body.college, 160);
    const ambassadorPitch = clean(body.ambassadorPitch, 1200);

    if (!name || !email || !college || !ambassadorPitch || !email.includes("@")) {
      return NextResponse.json({ error: "Form ka homework complete karo." }, { status: 400 });
    }

    const existingSnap = await adminDb.collection("users").where("email", "==", email).limit(1).get();
    const userRef = existingSnap.empty ? adminDb.collection("users").doc() : existingSnap.docs[0].ref;

    await userRef.set(
      {
        name,
        email,
        instagramHandle,
        college,
        ambassadorPitch,
        role: "user",
        ambassadorStatus: "pending",
        khushCoins: 0,
        khushCoinsEarned: 0,
        khushCoinsSpent: 0,
        ambassadorSales: 0,
        ambassadorReferralUses: 0,
        applicationSource: "khusbassador-form",
        updatedAt: Timestamp.now(),
        ...(existingSnap.empty ? { createdAt: Timestamp.now(), wishlist: [] } : {}),
      },
      { merge: true }
    );

    const origin = req.headers.get("origin") || new URL(req.url).origin;
    fetch(`${origin}/api/emails/ambassador`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "received",
        customerEmail: email,
        customerName: name,
        college,
      }),
    }).catch((err) => console.error("Failed to send ambassador received email:", err));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Ambassador application error:", error);
    return NextResponse.json(
      { error: "Application phisal gayi.", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
