import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return { ok: false as const, status: 401, error: "Invalid token" };

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("is_admin, role")
      .eq("id", user.id)
      .single();

    if (profile?.is_admin !== true && profile?.role !== "admin") {
      return { ok: false as const, status: 403, error: "Admins only" };
    }
    return { ok: true as const, uid: user.id };
  } catch (error) {
    console.error("Admin token verify failed", error);
    return { ok: false as const, status: 401, error: "Invalid token" };
  }
}

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [usersRes, referralsRes] = await Promise.all([
      supabaseAdmin.from("users").select("*"),
      supabaseAdmin.from("referral_ledger").select("*")
    ]);

    return NextResponse.json({ users: usersRes.data || [], referrals: referralsRes.data || [] });
  } catch (error: unknown) {
    console.error("Admin ambassadors fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load ambassadors", detail: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const userId = typeof body.userId === "string" ? body.userId : "";
    const status = body.status === "active" || body.status === "rejected" ? body.status : null;
    const referralCode = typeof body.referralCode === "string" ? body.referralCode : undefined;

    if (!userId || !status) {
      return NextResponse.json({ error: "Missing userId or status" }, { status: 400 });
    }

    const payload =
      status === "active"
        ? {
            ambassador_status: "active",
            role: "ambassador",
            referral_code: referralCode,
          }
        : {
            ambassador_status: "rejected",
            role: "user",
          };

    const { error } = await supabaseAdmin
      .from("users")
      .update(payload)
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Admin ambassadors decide error:", error);
    return NextResponse.json(
      { error: "Failed to update", detail: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
