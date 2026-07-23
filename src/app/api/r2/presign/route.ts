import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function verifySupabaseAdminToken(accessToken: string): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
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

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(`r2-${ip}`, 50, 3600000);
    
    if (!success) {
      return NextResponse.json({ error: "Too many upload requests. Try again later." }, { status: 429 });
    }

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

    const adminOk = await verifySupabaseAdminToken(idToken);
    if (!adminOk) {
      return NextResponse.json(
        { error: "Forbidden — admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Missing filename or contentType" },
        { status: 400 }
      );
    }

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
