"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import type { AmbassadorStatus, KhushUser } from "@/lib/firestore";

type Referral = { ambassadorCollege?: string; amountAddedToVault?: number };

function makeReferralCode(user: KhushUser) {
  const source = `${user.name || "KHUSH"} ${user.college || ""}`;
  const base = source
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8);
  return `${base || "KHUSH"}${Math.floor(100 + Math.random() * 900)}`;
}

export default function AdminAmbassadorsPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<KhushUser[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AmbassadorStatus | "all">("pending");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/ambassadors", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Admin ambassadors load failed", res.status, text);
        return;
      }
      const data = await res.json();
      setUsers((data.users || []) as KhushUser[]);
      setReferrals((data.referrals || []) as Referral[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredUsers = users.filter((u) => filter === "all" || u.ambassadorStatus === filter);

  const leaderboard = useMemo(() => {
    const byCollege = new Map<string, number>();
    referrals.forEach((referral) => {
      const college = referral.ambassadorCollege || "Unknown Campus";
      byCollege.set(college, (byCollege.get(college) || 0) + (referral.amountAddedToVault || 0));
    });
    return Array.from(byCollege.entries())
      .map(([college, vaultFunds]) => ({ college, vaultFunds }))
      .sort((a, b) => b.vaultFunds - a.vaultFunds)
      .slice(0, 8);
  }, [referrals]);

  const decide = async (target: KhushUser, status: AmbassadorStatus) => {
    if (!target.id || !user) return;

    const referralCode =
      status === "active" ? target.referralCode || makeReferralCode(target) : undefined;

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/ambassadors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userId: target.id, status, referralCode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Decide failed", err);
        alert(err.error || "Failed to update ambassador");
        return;
      }
    } catch (err) {
      console.error("Decide error", err);
      return;
    }

    if (target.email) {
      fetch("/api/emails/ambassador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: status === "active" ? "approved" : "rejected",
          customerEmail: target.email,
          customerName: target.name,
          referralCode,
        }),
      }).catch((err) => console.error("Failed to send decision email:", err));
    }

    await fetchData();
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8 border-b-2 border-gray-800 pb-6">
        <p className="font-urdu text-5xl leading-relaxed text-acid-green">ویٹنگ لسٹ</p>
        <h1 className="font-twenly text-5xl uppercase tracking-wide text-pure-white">KHUSBASSADORS.</h1>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["pending", "active", "rejected", "all"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`border-2 px-4 py-2 font-sans text-xs font-black uppercase tracking-widest ${
              filter === item
                ? "border-acid-green bg-acid-green text-void-black"
                : "border-gray-700 text-gray-400 hover:border-pure-white hover:text-pure-white"
            }`}
          >
            {item === "pending" ? "Pending" : item}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="border-2 border-gray-800 bg-void-black">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="border-b-2 border-gray-800 bg-gray-900/50 text-xs font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Campus</th>
                  <th className="p-4">Pitch</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-pure-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center font-twenly text-2xl text-acid-green">
                      LOADING...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((entry) => (
                    <tr key={entry.id} className="align-top hover:bg-gray-900/50">
                      <td className="p-4">
                        <p className="font-black uppercase">{entry.name}</p>
                        <p className="text-xs text-gray-500">{entry.email}</p>
                        <p className="mt-1 text-xs font-bold text-acid-green">{entry.instagramHandle || "No Instagram"}</p>
                      </td>
                      <td className="p-4 font-bold uppercase text-gray-300">{entry.college || "-"}</td>
                      <td className="max-w-md p-4 text-sm text-gray-400">{entry.ambassadorPitch || "-"}</td>
                      <td className="p-4">
                        <span className="border border-acid-green px-2 py-1 text-xs font-black uppercase text-acid-green">
                          {entry.ambassadorStatus}
                        </span>
                        {entry.referralCode && <p className="mt-2 font-mono text-xs text-gray-500">{entry.referralCode}</p>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => decide(entry, "active")}
                            className="inline-flex items-center gap-1 border-2 border-acid-green px-3 py-2 font-twenly text-lg text-acid-green hover:bg-acid-green hover:text-void-black"
                          >
                            <Check size={16} />
                            IN
                          </button>
                          <button
                            onClick={() => decide(entry, "rejected")}
                            className="inline-flex items-center gap-1 border-2 border-red-500 px-3 py-2 font-twenly text-lg text-red-500 hover:bg-red-500 hover:text-pure-white"
                          >
                            <X size={16} />
                            OUT
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="h-fit border-[3px] border-acid-green bg-void-black p-5 shadow-[6px_6px_0px_#C8FF00]">
          <p className="font-urdu text-4xl leading-relaxed text-acid-green">کالج لیڈر بورڈ</p>
          <h2 className="mb-5 font-twenly text-4xl uppercase text-pure-white">CAMPUS HEAT</h2>
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <p className="font-sans text-sm font-bold uppercase text-gray-500">No vault funds yet.</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={entry.college} className="border-2 border-gray-800 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-sans text-sm font-black uppercase text-pure-white">
                      {index + 1}. {entry.college}
                    </p>
                    <p className="font-twenly text-2xl text-acid-green">Rs. {entry.vaultFunds.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
