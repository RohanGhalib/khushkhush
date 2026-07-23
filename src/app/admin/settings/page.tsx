"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  KHUSBASSADOR_CONFIG,
  mergeKhusbassadorConfig,
  type KhusbassadorConfig,
} from "@/lib/firestore";

type KhusbassadorField = {
  key: keyof KhusbassadorConfig;
  label: string;
  hint: string;
  step?: number;
  min?: number;
  max?: number;
};

const khusbassadorFields: KhusbassadorField[] = [
  {
    key: "ambassadorCoinsPerShirt",
    label: "Coins per shirt (ambassador)",
    hint: "KhushCoins dropped into the ambassador's vault for each shirt sold via their code.",
    step: 1,
    min: 0,
  },
  {
    key: "customerDiscountPerShirt",
    label: "Customer discount per shirt (PKR)",
    hint: "Rupees off the buyer's order for each shirt when a referral code is applied.",
    step: 1,
    min: 0,
  },
  {
    key: "vaultContributionPerShirt",
    label: "Vault contribution per shirt (PKR)",
    hint: "Rupees added to the campus Khush Fund per shirt sold via referral.",
    step: 1,
    min: 0,
  },
  {
    key: "vaultGoal",
    label: "Khush Fund goal (PKR)",
    hint: "Target balance shown on the vault progress bar.",
    step: 100,
    min: 0,
  },
  {
    key: "coinValuePkr",
    label: "Coin value (PKR per coin)",
    hint: "How many rupees one KhushCoin is worth at checkout.",
    step: 0.5,
    min: 0,
  },
  {
    key: "maxCoinRedemptionPercent",
    label: "Max coin redemption per order (%)",
    hint: "Hard cap on how much of an order's subtotal can be paid with coins.",
    step: 1,
    min: 0,
    max: 100,
  },
  {
    key: "retailShirtPrice",
    label: "Retail shirt price (PKR)",
    hint: "Reference price used for program math.",
    step: 1,
    min: 0,
  },
  {
    key: "baseShirtCost",
    label: "Base shirt cost (PKR)",
    hint: "Internal cost for margin reference.",
    step: 1,
    min: 0,
  },
  {
    key: "iconTierSales",
    label: "Icon tier — sales threshold",
    hint: "Shirts an ambassador must sell to unlock the Icon tier.",
    step: 1,
    min: 1,
  },
  {
    key: "legendTierSales",
    label: "BVIBE Legend tier — sales threshold",
    hint: "Shirts an ambassador must sell to unlock the top tier.",
    step: 1,
    min: 1,
  },
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingKhus, setSavingKhus] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "KhUShKhUSh.",
    contactEmail: "hello@khushkhush.com",
    shippingFee: 200,
    announcementText: "دنیا گول ہے منافق ماحول ہے • بڑے لوگ • درمیانے افراد • نوجوان • موٹے افراد"
  });
  const [khusConfig, setKhusConfig] = useState<KhusbassadorConfig>(KHUSBASSADOR_CONFIG);

  const fetchSettings = async () => {
    try {
      const [storeRes, khusRes] = await Promise.all([
        supabase.from("settings").select("data").eq("id", "store").single(),
        supabase.from("settings").select("data").eq("id", "khusbassador").single(),
      ]);

      if (storeRes.data?.data) {
        setSettings(prev => ({ ...prev, ...storeRes.data.data }));
      }
      setKhusConfig(mergeKhusbassadorConfig(khusRes.data?.data || null));
    } catch (error) {
      console.error("Error fetching settings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("settings").upsert({
        id: "store",
        data: {
          ...settings,
          shippingFee: Number(settings.shippingFee),
        }
      });
      if (error) throw error;
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveKhus = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKhus(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const field of khusbassadorFields) {
        payload[field.key] = Number(khusConfig[field.key]);
      }
      payload.vaultDocumentId = khusConfig.vaultDocumentId;

      const { error } = await supabase.from("settings").upsert({
        id: "khusbassador",
        data: payload
      });

      if (error) throw error;
      alert("Khusbassador config saved.");
    } catch (error) {
      console.error("Error saving Khusbassador config", error);
      alert("Failed to save Khusbassador config.");
    } finally {
      setSavingKhus(false);
    }
  };

  const handleResetKhus = () => {
    if (!confirm("Reset all Khusbassador values to defaults? You still need to save.")) return;
    setKhusConfig({ ...KHUSBASSADOR_CONFIG });
  };

  if (loading) {
    return <div className="p-8 text-acid-green font-twenly text-4xl animate-pulse">LOADING...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">Store Settings.</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-void-black border-2 border-gray-800 p-6 space-y-6">
          <h2 className="font-sans font-bold uppercase text-acid-green border-b border-gray-800 pb-2">General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Store Name</label>
              <Input 
                value={settings.storeName} 
                onChange={(e) => setSettings(prev => ({...prev, storeName: e.target.value}))} 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Contact Email</label>
              <Input 
                type="email"
                value={settings.contactEmail} 
                onChange={(e) => setSettings(prev => ({...prev, contactEmail: e.target.value}))} 
                required 
              />
            </div>
          </div>
        </div>

        <div className="bg-void-black border-2 border-gray-800 p-6 space-y-6">
          <h2 className="font-sans font-bold uppercase text-acid-green border-b border-gray-800 pb-2">Checkout</h2>
          
          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Flat Shipping Fee (PKR)</label>
            <Input 
              type="number"
              value={settings.shippingFee} 
              onChange={(e) => setSettings(prev => ({...prev, shippingFee: Number(e.target.value)}))} 
              required 
            />
          </div>
        </div>

        <div className="bg-void-black border-2 border-gray-800 p-6 space-y-6">
          <h2 className="font-sans font-bold uppercase text-acid-green border-b border-gray-800 pb-2">Marketing</h2>
          
          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Announcement Bar / Marquee Text</label>
            <Input 
              value={settings.announcementText} 
              onChange={(e) => setSettings(prev => ({...prev, announcementText: e.target.value}))} 
              required 
              dir="auto"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full md:w-auto md:px-16 h-16 text-xl" disabled={saving}>
          {saving ? "SAVING..." : "SAVE SETTINGS"}
        </Button>
      </form>

      <form onSubmit={handleSaveKhus} className="mt-12 space-y-8">
        <div className="bg-void-black border-2 border-acid-green p-6 space-y-6">
          <div className="flex flex-col gap-2 border-b border-gray-800 pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-twenly text-3xl uppercase text-acid-green">Khusbassador Program</h2>
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-gray-500">
                Discounts, coin rewards, vault goal. Live across the site.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetKhus}
              className="border-2 border-gray-700 px-4 py-2 font-sans text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-pure-white hover:text-pure-white"
            >
              Reset to defaults
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {khusbassadorFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">
                  {field.label}
                </label>
                <Input
                  type="number"
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  value={khusConfig[field.key] as number}
                  onChange={(e) =>
                    setKhusConfig((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))
                  }
                  required
                />
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {field.hint}
                </p>
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">
                Vault document ID
              </label>
              <Input
                value={khusConfig.vaultDocumentId}
                onChange={(e) =>
                  setKhusConfig((prev) => ({ ...prev, vaultDocumentId: e.target.value }))
                }
                required
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full md:w-auto md:px-16 h-16 text-xl"
          disabled={savingKhus}
        >
          {savingKhus ? "SAVING..." : "SAVE KHUSBASSADOR CONFIG"}
        </Button>
      </form>
    </div>
  );
}
