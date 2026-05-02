import { NextResponse } from "next/server";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
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
