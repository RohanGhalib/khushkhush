"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "KhUShKhUSh.",
    contactEmail: "hello@khushkhush.com",
    shippingFee: 200,
    announcementText: "دنیا گول ہے منافق ماحول ہے • بڑے لوگ • درمیانے افراد • نوجوان • موٹے افراد"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "store"));
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    } catch (error) {
      console.error("Error fetching settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "store"), {
        ...settings,
        shippingFee: Number(settings.shippingFee),
        updatedAt: serverTimestamp()
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
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
    </div>
  );
}
