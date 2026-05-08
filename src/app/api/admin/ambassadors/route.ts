import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  const idToken = authHeader.split(" ")[1];
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (decoded.admin !== true) {
      return { ok: false as const, status: 403, error: "Admins only" };
    }
    return { ok: true as const, uid: decoded.uid };
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

    const [usersSnap, referralsSnap] = await Promise.all([
      adminDb
        .collection("users")
        .where("ambassadorStatus", "in", ["pending", "active", "rejected"])
        .get(),
      adminDb.collection("referrals").get(),
    ]);

    const users = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const referrals = referralsSnap.docs.map((doc) => doc.data());

    return NextResponse.json({ users, referrals });
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

    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userData = userSnap.data() || {};

    const payload =
      status === "active"
        ? {
            ambassadorStatus: "active",
            role: "ambassador",
            referralCode: referralCode || userData.referralCode || "",
          }
        : {
            ambassadorStatus: "rejected",
            role: userData.role === "ambassador" ? "user" : userData.role || "user",
          };

    await userRef.set(payload, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Admin ambassadors decide error:", error);
    return NextResponse.json(
      { error: "Failed to update", detail: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
