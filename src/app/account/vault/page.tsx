"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/lib/authStore";
import { Button } from "@/components/ui/Button";

const VAULT_GOAL = 50000;

export default function VaultPage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileSnap, vaultSnap, referralsSnap] = await Promise.all([
          getDoc(doc(db, "users", user.uid)),
          getDoc(doc(db, "vault", "global")),
          getDocs(query(collection(db, "referrals"), where("ambassadorId", "==", user.uid))),
        ]);

        setProfile(profileSnap.exists() ? profileSnap.data() : null);
        setVaultBalance(vaultSnap.exists() ? vaultSnap.data().balance || 0 : 0);
        setReferrals(referralsSnap.docs.map((refDoc) => ({ id: refDoc.id, ...refDoc.data() })));
      } catch (error) {
        console.error("Vault fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totals = useMemo(() => {
    const totalUses = referrals.length;
    const totalEarnings = referrals.reduce((sum, ref) => sum + (ref.amountEarnedByAmbassador || 0), 0);
    const totalSales = referrals.reduce((sum, ref) => sum + (ref.shirtCount || 0), 0);
    return { totalUses, totalEarnings, totalSales };
  }, [referrals]);

  const currentTier = useMemo(() => {
    if (totals.totalSales >= 25) return "BVIBE LEGEND";
    if (totals.totalSales >= 10) return "ICON";
    return "SCOUT";
  }, [totals.totalSales]);

  const vaultProgress = Math.min(100, Math.round((vaultBalance / VAULT_GOAL) * 100));

  const handleCopy = async () => {
    if (!profile?.referralCode) return;
    await navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return <div className="text-acid-green animate-pulse font-twenly text-3xl">LOADING...</div>;
  }

  if (!profile || profile.ambassadorStatus !== "active") {
    return (
      <div className="text-center py-20">
        <h2 className="font-urdu text-4xl text-acid-green mb-4">یہاں نہیں آ سکتے</h2>
        <p className="font-twenly text-xl uppercase text-gray-500 tracking-widest">
          ACCESS DENIED. APPLY FIRST.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="border-b-2 border-gray-800 pb-6">
        <h1 className="font-urdu text-5xl md:text-6xl text-acid-green mb-2">خزانہ</h1>
        <p className="font-twenly text-3xl md:text-4xl uppercase tracking-wide text-pure-white">
          THE VAULT
        </p>
      </div>

      <div className="bg-void-black border-2 border-gray-800 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 brutalist-border">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Code</p>
          <p className="font-twenly text-3xl text-acid-green tracking-widest">
            {profile.referralCode || "NO-CODE"}
          </p>
        </div>
        <Button variant="outline" className="text-sm px-6" onClick={handleCopy} disabled={!profile.referralCode}>
          {copied ? "COPIED" : "COPY KARO"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-void-black border-2 border-gray-800 p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Uses</p>
          <p className="font-twenly text-4xl text-pure-white mt-3">{totals.totalUses}</p>
        </div>
        <div className="bg-void-black border-2 border-gray-800 p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Personal Earned</p>
          <p className="font-twenly text-4xl text-acid-green mt-3">Rs. {totals.totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-void-black border-2 border-gray-800 p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tier</p>
          <p className="font-twenly text-4xl text-pure-white mt-3">{currentTier}</p>
          <p className="text-[10px] uppercase text-gray-500 tracking-widest mt-2">Sales: {totals.totalSales}</p>
        </div>
      </div>

      <div className="bg-void-black border-4 border-acid-green p-6 shadow-[8px_8px_0px_#C8FF00]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p className="font-urdu text-3xl text-acid-green">Khush Fund</p>
            <p className="font-twenly text-xl uppercase text-gray-400 tracking-widest">
              Khushfiesta unlock at Rs. {VAULT_GOAL.toLocaleString()}
            </p>
          </div>
          <p className="font-twenly text-3xl text-pure-white">
            Rs. {vaultBalance.toLocaleString()}
          </p>
        </div>

        <div className="w-full h-8 border-2 border-acid-green bg-void-black overflow-hidden">
          <div
            className="h-full bg-acid-green transition-all"
            style={{ width: `${vaultProgress}%` }}
          />
        </div>
        <p className="text-xs font-bold uppercase text-gray-500 tracking-widest mt-3">
          {vaultProgress}% TO KHUSHFIESTA
        </p>
      </div>
    </div>
  );
}
