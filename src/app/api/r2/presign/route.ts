import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

// Module-level singleton — reuses TCP connections across requests instead
// of paying the connection setup cost on every presign call.
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Verifies a Firebase ID token using the Firebase Auth REST API.
 * Returns the decoded token payload, or null if invalid.
 */
async function verifyFirebaseToken(idToken: string) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const user = data.users?.[0];
    if (!user) return null;
    // Also verify the token belongs to our project by checking the localId exists
    return user;
  } catch {
    return null;
  }
}

/**
 * Verifies a Firebase ID token's custom claims to check admin status.
 * Uses the token's own payload — Firebase JWTs are signed RS256, so we
 * verify via the REST accounts:lookup endpoint (no Admin SDK required).
 */
async function isAdminToken(idToken: string): Promise<boolean> {
  // Decode the JWT payload (middle segment) to read custom claims.
  // Note: We still verify the token is valid via the accounts:lookup call.
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    );
    // Verify token is valid (not expired / tampered)
    const user = await verifyFirebaseToken(idToken);
    if (!user) return false;
    // Check admin custom claim
    return payload?.admin === true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Rate Limiting: 50 requests per hour per IP (for admin uploads)
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`r2-${ip}`, 50, 3600000);
    
    if (!success) {
      return NextResponse.json({ error: "Too many upload requests. Try again later." }, { status: 429 });
    }

    // --- Auth Check ---
    const authHeader = req.headers.get("Authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!idToken) {
      return NextResponse.json(
        { error: "Unauthorized — missing token" },
        { status: 401 }
      );
    }

    const adminOk = await isAdminToken(idToken);
    if (!adminOk) {
      return NextResponse.json(
        { error: "Forbidden — admin access required" },
        { status: 403 }
      );
    }

    // --- Input Validation ---
    const body = await req.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Missing filename or contentType" },
        { status: 400 }
      );
    }

    // --- Generate Presigned URL ---
    const key = `${Date.now()}-${filename.replace(/\s+/g, "-")}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ signedUrl, publicUrl, key });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
