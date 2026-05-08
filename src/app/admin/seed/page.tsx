"use client";

import { useState } from "react";
import { doc, setDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

export default function SeedDatabasePage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const seedData = async () => {
    setLoading(true);
    setLogs([]);
    try {
      addLog("Starting seeding process...");

      // 1. Seed Products
      const products = [
        {
          slug: "dunya-gol-hai",
          name_en: "Dunya Gol Hai Tee",
          name_ur: "دنیا گول ہے",
          description: "<p>The classic KhUShKhUSh tee. Heavyweight cotton, brutalist print.</p>",
          price: 3500,
          comparePrice: 4500,
          images: [],
          status: "Active",
          featured: true,
          sizes: { barray_log: 10, darmiane: 15, nojawan: 5, mote_afraad: 2 },
          tags: ["meme", "trending"]
        },
        {
          slug: "khushkhush-logo-hoodie",
          name_en: "Logo Hoodie",
          name_ur: "خوش خوش ہوڈی",
          description: "<p>Winter essential. Thick fleece with acid-green logo.</p>",
          price: 5500,
          comparePrice: null,
          images: [],
          status: "Active",
          featured: true,
          sizes: { barray_log: 5, darmiane: 8, nojawan: 2, mote_afraad: 0 },
          tags: ["winter", "logo"]
        },
        {
          slug: "anime-eyes",
          name_en: "Anime Eyes",
          name_ur: "انیمی آنکھیں",
          description: "<p>Limited edition anime collection drop.</p>",
          price: 4000,
          comparePrice: null,
          images: [],
          status: "Sold Out",
          featured: false,
          sizes: { barray_log: 0, darmiane: 0, nojawan: 0, mote_afraad: 0 },
          tags: ["anime", "limited"]
        }
      ];

      for (const p of products) {
        await setDoc(doc(db, "products", p.slug), {
          ...p,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        addLog(`Created product: ${p.slug}`);
      }

      // 2. Seed Collections
      const collections = [
        { slug: "meme", title: "MEME", image: "" },
        { slug: "anime", title: "ANIME", image: "" },
        { slug: "movie", title: "MOVIE", image: "" },
        { slug: "frame", title: "FRAME", image: "" }
      ];

      for (const c of collections) {
        await setDoc(doc(db, "collections", c.slug), {
          ...c,
          createdAt: serverTimestamp()
        });
        addLog(`Created collection: ${c.slug}`);
      }

      // 3. Seed Users
      const users = [
        { id: "user_1", name: "Ahmad Khan", email: "ahmad@example.com", phone: "03001234567", role: "user" },
        { id: "user_2", name: "Zainab Ali", email: "zainab@example.com", phone: "03219876543", role: "user" }
      ];

      for (const u of users) {
        await setDoc(doc(db, "users", u.id), {
          ...u,
          createdAt: serverTimestamp()
        });
        addLog(`Created user: ${u.email}`);
      }

      // 4. Seed Orders
      const orders = [
        {
          userId: "user_1",
          customerInfo: { fullName: "Ahmad Khan", phone: "03001234567", address: "DHA Phase 6", city: "Lahore", postalCode: "54000" },
          items: [{ name_en: "Dunya Gol Hai Tee", price: 3500, qty: 1, size: "Large" }],
          subtotal: 3500,
          shipping: 200,
          total: 3700,
          status: "Pending",
          paymentMethod: "COD"
        },
        {
          userId: "user_2",
          customerInfo: { fullName: "Zainab Ali", phone: "03219876543", address: "Clifton Block 5", city: "Karachi", postalCode: "75600" },
          items: [{ name_en: "Logo Hoodie", price: 5500, qty: 2, size: "Medium" }],
          subtotal: 11000,
          shipping: 200,
          total: 11200,
          status: "Shipped",
          paymentMethod: "COD"
        }
      ];

      for (const o of orders) {
        const docRef = await addDoc(collection(db, "orders"), {
          ...o,
          createdAt: serverTimestamp()
        });
        addLog(`Created order: ${docRef.id}`);
      }

      addLog("✅ FIREBASE SEEDING COMPLETE!");
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="font-twenly text-4xl text-pure-white uppercase mb-8">DATABASE SEEDER</h1>
      
      <div className="bg-red-900/20 border-2 border-red-500 p-6 mb-8">
        <h2 className="font-sans font-bold text-red-500 uppercase mb-2">Warning</h2>
        <p className="text-pure-white font-sans text-sm">
          Clicking this will inject dummy data directly into your production Firestore database.
          Make sure your security rules allow writes before proceeding.
        </p>
      </div>

      <Button onClick={seedData} variant="primary" className="w-full mb-8 h-16 text-xl" disabled={loading}>
        {loading ? "SEEDING..." : "INJECT DUMMY DATA"}
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
