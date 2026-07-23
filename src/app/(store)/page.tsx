import { Metadata } from "next";
import { HomeClient } from "@/components/store/HomeClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const metadata: Metadata = {
  title: "KhushKhush | Gen-z Meme Streetwear",
  description: "Gen-z Meme Streetwear. Massive types. Brutalist aesthetic.",
};

export const revalidate = 3600;

async function fetchData() {
  try {
    const [productsRes, collectionsRes] = await Promise.all([
      supabaseAdmin.from("products").select("*").eq("status", "Active").limit(4),
      supabaseAdmin.from("collections").select("*"),
    ]);

    return {
      products: productsRes.data || [],
      collections: collectionsRes.data || [],
    };
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    return { products: [], collections: [] };
  }
}

export default async function Home() {
  const { products, collections } = await fetchData();
  return <HomeClient products={products} collections={collections} />;
}
