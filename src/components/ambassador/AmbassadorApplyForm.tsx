"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function AmbassadorApplyForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("loading");
    setMessage("");

    const formData = new FormData(form);

    try {
      const res = await fetch("/api/ambassador/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          instagramHandle: formData.get("instagramHandle"),
          college: formData.get("college"),
          ambassadorPitch: formData.get("ambassadorPitch"),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application failed");

      setStatus("success");
      setMessage("Application received. We will review your campus energy.");
      form.reset();
    } catch (error: unknown) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Application failed. Try again.");
    }
  };

  const inputClass =
    "w-full bg-pure-white text-void-black border-[3px] border-void-black px-4 py-4 font-sans font-black uppercase placeholder:text-black/35 focus:outline-none focus:ring-4 focus:ring-void-black/25";

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-sans text-xs font-black uppercase tracking-widest text-void-black">Full Name</span>
          <input name="name" required className={inputClass} placeholder="FULL NAME" />
        </label>
        <label className="grid gap-2">
          <span className="font-sans text-xs font-black uppercase tracking-widest text-void-black">Email</span>
          <input name="email" type="email" required className={inputClass} placeholder="EMAIL" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-sans text-xs font-black uppercase tracking-widest text-void-black">Instagram</span>
          <input name="instagramHandle" className={inputClass} placeholder="@HANDLE" />
        </label>
        <label className="grid gap-2">
          <span className="font-sans text-xs font-black uppercase tracking-widest text-void-black">College / University</span>
          <input name="college" required className={inputClass} placeholder="COLLEGE / UNIVERSITY" />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="font-sans text-xs font-black uppercase tracking-widest text-void-black">
          Why should we let you in?
        </span>
        <textarea
          name="ambassadorPitch"
          required
          rows={6}
          className={`${inputClass} resize-none normal-case`}
          placeholder="Tell us what you can actually move on campus."
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="group relative mt-2 h-16 w-full disabled:opacity-60"
      >
        <span className="absolute inset-0 translate-x-2 translate-y-2 bg-void-black transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
        <span className="relative flex h-full items-center justify-center border-[3px] border-void-black bg-pure-white font-twenly text-3xl font-black uppercase text-void-black transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
          {status === "loading" ? "SENDING" : "APPLY KARDO"}
        </span>
      </button>

      {message && (
        <p
          className={`border-[3px] border-void-black p-3 font-sans text-sm font-black uppercase ${
            status === "success" ? "bg-void-black text-acid-green" : "bg-red-600 text-pure-white"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
