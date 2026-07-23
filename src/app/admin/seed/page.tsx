"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function SeedDatabasePage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const seedData = async () => {
    setLoading(true);
    setLogs([]);
    try {
      addLog("Starting Supabase seeding process...");

      const products: any[] = [
        {
          slug: "dunya-gol-hai",
          title: "Dunya Gol Hai Tee",
          description: "<p>The classic KhUShKhUSh tee. Heavyweight cotton, brutalist print.</p>",
          price: 3500,
          compare_at_price: 4500,
          images: [],
          status: "Active",
          stock: 30,
          category: "t-shirts",
          collection_slug: "meme",
          sizes: ["S", "M", "L", "XL"]
        },
        {
          slug: "khushkhush-logo-hoodie",
          title: "Logo Hoodie",
          description: "<p>Winter essential. Thick fleece with acid-green logo.</p>",
          price: 5500,
          compare_at_price: 0,
          images: [],
          status: "Active",
          stock: 15,
          category: "hoodies",
          collection_slug: "logo",
          sizes: ["M", "L", "XL"]
        },
        {
          slug: "anime-eyes",
          title: "Anime Eyes Tee",
          description: "<p>Limited edition anime collection drop.</p>",
          price: 4000,
          compare_at_price: 0,
          images: [],
          status: "Sold Out",
          stock: 0,
          category: "t-shirts",
          collection_slug: "anime",
          sizes: ["S", "M", "L"]
        }
      ];

      for (const p of products) {
        const { error } = await supabase.from("products").upsert(p, { onConflict: "slug" });
        if (error) throw error;
        addLog(`Created/updated product: ${p.slug}`);
      }

      const collections: any[] = [
        { slug: "meme", title: "MEME", title_en: "Meme Culture", description: "Vibe meme drops", image: "" },
        { slug: "anime", title: "ANIME", title_en: "Anime Drops", description: "Otaku gear", image: "" },
        { slug: "movie", title: "MOVIE", title_en: "Movie Merch", description: "Cinema classics", image: "" },
        { slug: "frame", title: "FRAME", title_en: "Frame Series", description: "Artistic frames", image: "" }
      ];

      for (const c of collections) {
        const { error } = await supabase.from("collections").upsert(c, { onConflict: "slug" });
        if (error) throw error;
        addLog(`Created/updated collection: ${c.slug}`);
      }

      await supabase.from("vault").upsert({ id: "khush-fund", balance: 15000, goal: 50000 } as any);
      addLog("Seeded Vault default stats");

      addLog("✅ SUPABASE DATABASE SEEDING COMPLETE!");
    } catch (error: any) {
      addLog(`❌ Error: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="font-twenly text-4xl text-pure-white uppercase mb-8">SUPABASE DATABASE SEEDER</h1>
      
      <div className="bg-red-900/20 border-2 border-red-500 p-6 mb-8">
        <h2 className="font-sans font-bold text-red-500 uppercase mb-2">Warning</h2>
        <p className="text-pure-white font-sans text-sm">
          Clicking this will inject initial products, collections, and settings into your Supabase database.
        </p>
      </div>

      <Button onClick={seedData} variant="primary" className="w-full mb-8 h-16 text-xl" disabled={loading}>
        {loading ? "SEEDING..." : "INJECT DUMMY DATA INTO SUPABASE"}
      </Button>

      {logs.length > 0 && (
        <div className="bg-void-black border-2 border-gray-800 p-4 h-64 overflow-y-auto font-mono text-sm text-acid-green flex flex-col gap-1">
          {logs.map((log, i) => (
            <span key={i}>{log}</span>
          ))}
        </div>
      )}
    </div>
  );
}
