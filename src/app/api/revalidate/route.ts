import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
    const { paths } = await req.json();

    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json({ error: "Invalid paths array" }, { status: 400 });
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({ 
      revalidated: true, 
      paths, 
      now: Date.now() 
    });
  } catch (err) {
    return NextResponse.json({ error: "Error revalidating" }, { status: 500 });
  }
}
