"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, LockKeyhole } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/authStore";
import {
  KHUSBASSADOR_CONFIG,
  fetchKhusbassadorConfig,
  type KhusbassadorConfig,
  KhushUser,
} from "@/lib/firestore";
import { KhushCoinIcon } from "@/components/ambassador/KhushCoinIcon";

type Vault = { balance?: number; goal?: number };
type Referral = { coinsEarnedByAmbassador?: number; shirtCount?: number };
type LedgerEntry = {
  id: string;
  kind: string;
  amount: number;
  note?: string;
  created_at?: string;
};

function tierForSales(sales: number, config: KhusbassadorConfig) {
  if (sales >= config.legendTierSales) return { name: "BVIBE Legend", next: null as number | null };
  if (sales >= config.iconTierSales) return { name: "Icon", next: config.legendTierSales };
  return { name: "Scout", next: config.iconTierSales };
}

export default function CollegeVaultPage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<KhushUser | null>(null);
  const [vault, setVault] = useState<Vault>({});
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [config, setConfig] = useState<KhusbassadorConfig>(KHUSBASSADOR_CONFIG);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchVault() {
      setLoading(true);
      try {
        const liveConfig = await fetchKhusbassadorConfig();
        setConfig(liveConfig);

        const [profileRes, vaultRes, ledgerRes] = await Promise.all([
          supabase.from("users").select("*").eq("id", user!.id).single(),
          supabase.from("vault").select("*").eq("id", liveConfig.vaultDocumentId).single(),
          supabase.from("coin_ledger").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(15)
        ]);

        if (profileRes.data) {
          setProfile({
            id: profileRes.data.id,
            email: profileRes.data.email,
            name: profileRes.data.name,
            phone: profileRes.data.phone,
            role: profileRes.data.role,
            is_admin: profileRes.data.is_admin,
            college: profileRes.data.college,
            referralCode: profileRes.data.referral_code,
            ambassadorStatus: profileRes.data.ambassador_status,
            khushCoins: profileRes.data.khush_coins,
            khushCoinsEarned: profileRes.data.khush_coins_earned,
            khushCoinsSpent: profileRes.data.khush_coins_spent,
            ambassadorSales: profileRes.data.ambassador_sales,
            ambassadorReferralUses: profileRes.data.ambassador_referral_uses,
          } as KhushUser);
        }

        if (vaultRes.data) {
          setVault(vaultRes.data);
        }

        if (ledgerRes.data) {
          setLedger(ledgerRes.data as LedgerEntry[]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVault();
  }, [user]);

  const stats = useMemo(() => {
    const totalUses = profile?.ambassadorReferralUses || 0;
    const totalCoinsEarned = profile?.khushCoinsEarned || 0;
    const totalSales = profile?.ambassadorSales || 0;
    return { totalUses, totalCoinsEarned, totalSales };
  }, [profile]);

  const balance = vault.balance || 0;
  const goal = vault.goal || config.vaultGoal;
  const progress = Math.min(100, Math.round((balance / goal) * 100));
  const tier = tierForSales(stats.totalSales, config);
  const coinBalance = profile?.khushCoins || 0;

  if (loading) {
    return <div className="font-twenly text-3xl text-acid-green animate-pulse">LOADING VAULT...</div>;
  }

  if (profile?.ambassadorStatus !== "active") {
    return (
      <div className="grid min-h-[50vh] place-items-center text-center">
        <LockKeyhole className="mb-5 text-acid-green" size={56} />
        <h2 className="font-urdu text-5xl leading-relaxed text-acid-green">ابھی اندر نہیں آئے</h2>
        <p className="mx-auto mt-3 max-w-xl font-sans text-sm font-bold uppercase tracking-widest text-gray-400">
          The vault is only visible to active Khusbassadors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b-2 border-gray-800 pb-6">
        <p className="font-urdu text-5xl leading-relaxed text-acid-green">خزانہ</p>
        <h2 className="font-twenly text-5xl uppercase text-pure-white md:text-7xl">THE VAULT</h2>
      </div>

      <section className="border-4 border-acid-green bg-void-black p-6 shadow-[8px_8px_0px_#C8FF00]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <KhushCoinIcon size={84} />
            <div>
              <p className="font-sans text-xs font-black uppercase tracking-[0.3em] text-gray-500">
                KhushCoin Balance
              </p>
              <p className="font-twenly text-6xl uppercase text-acid-green md:text-7xl">
                {coinBalance.toLocaleString()}
              </p>
              <p className="mt-1 font-sans text-[11px] font-bold uppercase tracking-widest text-gray-400">
                1 coin = Rs. {config.coinValuePkr}. Spend at checkout. No cashout.
              </p>
            </div>
          </div>
          <a
            href="/shop"
            className="inline-flex items-center justify-center border-2 border-pure-white px-5 py-3 font-twenly text-xl uppercase text-pure-white hover:bg-pure-white hover:text-void-black"
          >
            SPEND THEM
          </a>
        </div>
      </section>

      <section className="border-2 border-gray-800 bg-void-black p-5">
        <p className="mb-2 font-sans text-xs font-black uppercase tracking-[0.3em] text-gray-500">Referral code</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="break-all font-twenly text-5xl uppercase text-acid-green md:text-6xl">{profile.referralCode}</p>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(profile.referralCode || "");
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="inline-flex items-center justify-center gap-2 border-2 border-pure-white px-5 py-3 font-twenly text-xl uppercase text-pure-white hover:bg-pure-white hover:text-void-black"
          >
            <Copy size={18} />
            {copied ? "HO GAYA" : "COPY KARO"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Total Uses", stats.totalUses.toLocaleString()],
          ["Coins Earned (lifetime)", stats.totalCoinsEarned.toLocaleString()],
          ["Tier", tier.name],
        ].map(([label, value]) => (
          <div key={label} className="border-2 border-gray-800 bg-void-black p-5">
            <p className="font-sans text-xs font-black uppercase tracking-widest text-gray-500">{label}</p>
            <p className="mt-2 font-twenly text-4xl uppercase text-pure-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="border-[3px] border-pure-white bg-void-black p-5">
        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <p className="font-sans text-xs font-black uppercase tracking-[0.3em] text-acid-green">The Khata</p>
            <h3 className="font-twenly text-5xl uppercase text-pure-white">KHUSH FUND</h3>
          </div>
          <p className="font-twenly text-4xl text-acid-green">
            Rs. {balance.toLocaleString()} / {goal.toLocaleString()}
          </p>
        </div>
        <div className="h-12 border-[3px] border-pure-white bg-card-bg p-1">
          <div className="h-full bg-acid-green transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 font-sans text-xs font-black uppercase tracking-widest text-gray-400">
          {progress}% to Khushfiesta. Event unlocks through sales volume.
        </p>
      </section>

      <section className="border-2 border-gray-800 bg-void-black p-5">
        <h3 className="font-twenly text-3xl uppercase text-pure-white">COIN LEDGER</h3>
        <p className="mb-4 font-sans text-[11px] font-bold uppercase tracking-widest text-gray-500">
          Last 15 entries. The receipts don&apos;t lie.
        </p>
        {ledger.length === 0 ? (
          <p className="font-sans text-sm font-bold uppercase text-gray-500">No coin activity yet.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {ledger.map((entry) => {
              const isPositive = entry.amount > 0;
              return (
                <div key={entry.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-sans text-xs font-black uppercase tracking-widest text-pure-white">
                      {entry.kind}
                    </p>
                    <p className="font-sans text-[11px] uppercase text-gray-500">
                      {entry.note || "—"}
                    </p>
                  </div>
                  <p
                    className={`font-twenly text-2xl uppercase ${
                      isPositive ? "text-acid-green" : "text-red-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {entry.amount.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
