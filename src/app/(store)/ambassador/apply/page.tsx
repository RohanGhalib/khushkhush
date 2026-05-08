"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/authStore";

export default function AmbassadorApplyPage() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instagram: "",
    college: "",
    reason: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const res = await fetch("/api/ambassador/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: user?.uid || null }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "TRY AGAIN.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setFormData({ name: "", email: "", instagram: "", college: "", reason: "" });
    } catch {
      setError("TRY AGAIN.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-acid-green text-void-black px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="bg-void-black text-acid-green border-4 border-void-black shadow-[8px_8px_0px_#111111] px-6 py-5 mb-10">
          <h1 className="font-urdu text-4xl sm:text-5xl md:text-6xl leading-relaxed">
            مفت کی شرٹ چاہیے؟
          </h1>
          <p className="font-twenly text-xl sm:text-2xl md:text-3xl uppercase tracking-wide mt-3">
            Prove you are BVIBE material.
          </p>
        </div>

        <div className="bg-void-black text-pure-white border-4 border-void-black shadow-[8px_8px_0px_#C8FF00] p-6 sm:p-8">
          <p className="font-sans font-bold uppercase text-sm text-gray-400 mb-6">
            No corporate fluff. Just flex.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Name</label>
              <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Email</label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Instagram</label>
              <Input name="instagram" value={formData.instagram} onChange={handleChange} required placeholder="@handle" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">College / Uni</label>
              <Input name="college" value={formData.college} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Why should we let you in?</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                className="w-full min-h-[160px] bg-void-black border-2 border-pure-white px-4 py-3 font-sans text-pure-white text-base placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-acid-green transition-colors"
                placeholder="Roast us, flex your campus reach, whatever."
              />
            </div>

            {status === "success" && (
              <div className="border-2 border-acid-green bg-acid-green/10 text-acid-green p-4 font-sans font-bold uppercase text-sm">
                DONE. We&apos;re watching you.
              </div>
            )}

            {status === "error" && (
              <div className="border-2 border-red-500 bg-red-500/10 text-red-400 p-4 font-sans font-bold uppercase text-sm">
                {error || "FAILED. TRY AGAIN."}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full h-16 text-2xl" disabled={status === "loading"}>
              {status === "loading" ? "..." : "APPLY KARDO"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
