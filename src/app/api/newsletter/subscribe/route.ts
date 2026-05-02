import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(req: Request) {
  try {
    // Rate Limiting: 5 requests per hour per IP
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`newsletter-${ip}`, 5, 3600000);
    
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const docId = email.toLowerCase();
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      console.error("Missing Firebase environment variables");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // Use Firestore REST API to avoid GRPC issues on server
    // Added updateMask.fieldPaths for each field to satisfy REST API requirements for PATCH
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/newsletter/${docId}?key=${apiKey}&updateMask.fieldPaths=email&updateMask.fieldPaths=createdAt`;
    
    const res = await fetch(url,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            email: { stringValue: docId },
            createdAt: { timestampValue: new Date().toISOString() },
          },
        }),
      }
    );

    if (!res.ok) {
      const errData = await res.json();
      console.error("Firestore REST Error:", errData);
      throw new Error("Failed to save to Firestore");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
