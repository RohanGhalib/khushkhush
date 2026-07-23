"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Loader2, Mail, Users, Send } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  created_at?: string;
}

const TEMPLATES = {
  drop: `
    <div style="background-color: #050505; color: #FFFFFF; padding: 40px; font-family: sans-serif; text-align: center; border: 4px solid #C8FF00;">
      <h1 style="color: #C8FF00; font-size: 48px; margin-bottom: 10px;">NEW DROP ALERT.</h1>
      <p style="font-size: 18px; color: #AAAAAA; margin-bottom: 30px;">THE MOST AWAITED COLLECTION IS FINALLY LIVE.</p>
      <div style="margin: 40px 0;">
        <a href="https://khushkhush.com/shop" style="background-color: #C8FF00; color: #050505; padding: 18px 45px; text-decoration: none; font-weight: 900; text-transform: uppercase; border-radius: 0px;">SHOP THE DROP &rarr;</a>
      </div>
      <p style="font-size: 12px; color: #444444; margin-top: 60px;">You are receiving this because you joined the KK gang.</p>
    </div>
  `,
  sale: `
    <div style="background-color: #C8FF00; color: #050505; padding: 40px; font-family: sans-serif; text-align: center;">
      <h1 style="font-size: 72px; margin: 0; font-weight: 900; letter-spacing: -2px;">SALE.</h1>
      <h2 style="font-size: 32px; margin: 0; text-transform: uppercase;">UP TO 50% OFF EVERYTHING</h2>
      <div style="background: #050505; color: #C8FF00; padding: 20px; margin: 30px auto; width: fit-content; font-size: 24px; font-weight: 900;">
        USE CODE: FLASH50
      </div>
      <div style="margin: 40px 0;">
        <a href="https://khushkhush.com/shop" style="background-color: #050505; color: #C8FF00; padding: 15px 40px; text-decoration: none; font-weight: bold; text-transform: uppercase;">GO GO GO!</a>
      </div>
    </div>
  `,
  general: `
    <div style="background-color: #050505; color: #FFFFFF; padding: 40px; font-family: sans-serif; border-left: 10px solid #C8FF00;">
      <h1 style="color: #FFFFFF; font-size: 32px; margin-bottom: 20px;">WHATS UP GANG.</h1>
      <p style="font-size: 16px; line-height: 1.6; color: #CCCCCC;">
        Just wanted to check in and let you know what we've been working on. 
        Lots of new designs in the pipeline. Stay tuned.
      </p>
      <p style="font-size: 16px; font-weight: bold; color: #C8FF00; margin-top: 30px;">Stay Weird.<br/>KhushKhush Team</p>
    </div>
  `
};

export default function AdminNewsletterPage() {
  const [activeTab, setActiveTab] = useState<"subscribers" | "blast">("subscribers");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  // Blast State
  const [blastSubject, setBlastSubject] = useState("");
  const [blastContent, setBlastContent] = useState("");
  const [sending, setSending] = useState(false);
  const [blastResult, setBlastResult] = useState<any>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("newsletter").select("*");
      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error("Error fetching subscribers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    try {
      const { error } = await supabase.from("newsletter").delete().eq("id", id);
      if (error) throw error;
      setSubscribers(subscribers.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting subscriber", error);
      alert("Failed to delete subscriber.");
    }
  };

  const handleSendBlast = async () => {
    if (!blastSubject || !blastContent) return alert("Please fill in subject and content");
    if (!confirm(`Are you sure you want to blast this email to ${subscribers.length} subscribers?`)) return;

    setSending(true);
    setBlastResult(null);

    try {
      const res = await fetch("/api/newsletter/blast", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: blastSubject,
          content: blastContent
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send blast");

      setBlastResult(data);
      alert("Email blast sent successfully!");
    } catch (error: any) {
      console.error("Blast error:", error);
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b-2 border-gray-800 pb-6">
        <div>
          <h1 className="font-twenly text-5xl text-pure-white tracking-wide uppercase leading-none">Newsletter.</h1>
          <p className="text-gray-500 font-sans font-bold uppercase text-xs mt-2 tracking-widest">
            {subscribers.length} Signups across the gang
          </p>
        </div>
        
        <div className="flex bg-void-black border-2 border-gray-800 p-1">
          <button 
            onClick={() => setActiveTab("subscribers")}
            className={`px-6 py-2 flex items-center gap-2 font-sans font-bold uppercase text-xs transition-all ${
              activeTab === 'subscribers' ? 'bg-acid-green text-void-black' : 'text-gray-400 hover:text-pure-white'
            }`}
          >
            <Users size={14} /> Subscribers
          </button>
          <button 
            onClick={() => setActiveTab("blast")}
            className={`px-6 py-2 flex items-center gap-2 font-sans font-bold uppercase text-xs transition-all ${
              activeTab === 'blast' ? 'bg-acid-green text-void-black' : 'text-gray-400 hover:text-pure-white'
            }`}
          >
            <Mail size={14} /> Email Blast
          </button>
        </div>
      </div>

      {activeTab === "subscribers" ? (
        <div className="bg-void-black border-2 border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="text-gray-400 uppercase text-sm font-bold border-b-2 border-gray-800 bg-gray-900/50">
                <tr>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-pure-white divide-y divide-gray-800">
                {loading ? (
                  <tr><td colSpan={2} className="p-8 text-center text-acid-green animate-pulse">LOADING...</td></tr>
                ) : subscribers.length === 0 ? (
                  <tr><td colSpan={2} className="p-8 text-center text-gray-500">No subscribers found.</td></tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-300">{sub.email}</td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="outline" className="text-xs py-1 h-auto px-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-pure-white" onClick={() => handleDelete(sub.id)}>
                          DELETE
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-void-black border-2 border-gray-800 p-6 space-y-4">
              <h2 className="font-sans font-bold uppercase text-acid-green mb-4 flex items-center gap-2">
                <Send size={18} /> Compose Blast
              </h2>
              
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Subject Line</label>
                <Input 
                  value={blastSubject} 
                  onChange={(e) => setBlastSubject(e.target.value)} 
                  placeholder="e.g. 🔥 NEW DROP: THE GEN-Z COLLECTION IS HERE!"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Email Content (HTML Supported)</label>
                <RichTextEditor 
                  content={blastContent} 
                  onChange={setBlastContent} 
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500 font-bold uppercase">
                  Sending to {subscribers.length} subscribers
                </div>
                <Button 
                  onClick={handleSendBlast} 
                  disabled={sending || subscribers.length === 0}
                  variant="primary"
                  className="px-12 h-14"
                >
                  {sending ? <><Loader2 className="animate-spin mr-2" /> SENDING...</> : "BLAST EMAILS &rarr;"}
                </Button>
              </div>

              {blastResult && (
                <div className="mt-4 p-4 bg-acid-green/10 border border-acid-green text-acid-green text-xs font-bold uppercase">
                  Blast Complete: Sent {blastResult.totalSubscribers} emails in {blastResult.batchesSent} batches.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-void-black border-2 border-gray-800 p-6">
              <h2 className="font-sans font-bold uppercase text-pure-white mb-6 border-b border-gray-800 pb-2">
                Templates
              </h2>
              <div className="space-y-4">
                <button 
                  onClick={() => { setBlastSubject("🔥 NEW DROP IS LIVE!"); setBlastContent(TEMPLATES.drop); }}
                  className="w-full text-left p-4 border-2 border-gray-800 hover:border-acid-green transition-colors group"
                >
                  <p className="font-bold uppercase text-sm group-hover:text-acid-green">New Drop Alert</p>
                  <p className="text-[10px] text-gray-500 uppercase mt-1">Hero image + Shop button</p>
                </button>
                <button 
                  onClick={() => { setBlastSubject("🚨 FLASH SALE: 50% OFF!"); setBlastContent(TEMPLATES.sale); }}
                  className="w-full text-left p-4 border-2 border-gray-800 hover:border-acid-green transition-colors group"
                >
                  <p className="font-bold uppercase text-sm group-hover:text-acid-green">Flash Sale</p>
                  <p className="text-[10px] text-gray-500 uppercase mt-1">Acid Green theme + Coupon focus</p>
                </button>
                <button 
                  onClick={() => { setBlastSubject("Whassup gang!"); setBlastContent(TEMPLATES.general); }}
                  className="w-full text-left p-4 border-2 border-gray-800 hover:border-acid-green transition-colors group"
                >
                  <p className="font-bold uppercase text-sm group-hover:text-acid-green">General Update</p>
                  <p className="text-[10px] text-gray-500 uppercase mt-1">Clean text-focused layout</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
