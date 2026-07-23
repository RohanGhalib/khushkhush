"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ProductView } from "@/components/store/ProductView";

export function ProductClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();

        if (!error && data) {
          setProduct(data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card-bg">
        <p className="font-twenly text-4xl text-acid-green animate-pulse">LOADING...</p>
      </div>
    );
  }

  if (!product || product.status === "Draft") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card-bg">
        <p className="font-twenly text-4xl text-pure-white">PRODUCT NOT FOUND</p>
      </div>
    );
  }

  return <ProductView product={product} />;
}
