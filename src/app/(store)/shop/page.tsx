import { Metadata } from "next";
import { ShopGrid } from "@/components/store/ShopGrid";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the complete KhushKhush archive. Exclusive Gen-z streetwear and meme-inspired drops.",
};

export const revalidate = 3600;

async function fetchProducts() {
  try {
    const { data } = await supabaseAdmin
      .from("products")
      .select("*")
      .neq("status", "Draft");
    return data || [];
  } catch (error) {
    console.error("Failed to fetch products for shop page:", error);
    return [];
  }
}

export default async function ShopPage() {
  const products = await fetchProducts();

  return (
    <div className="min-h-screen bg-card-bg">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="mb-12 border-b-2 border-gray-800 pb-4">
          <h1 className="font-twenly text-5xl md:text-7xl text-acid-green uppercase tracking-wide">
            SHOP ALL.
          </h1>
          <p className="font-sans font-bold text-gray-400 uppercase tracking-widest mt-2">
            The Complete Archive
          </p>
        </div>

        <ShopGrid products={products} />
      </div>
    </div>
  );
}
