import { ProductView } from "@/components/store/ProductView";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

async function fetchProduct(slug: string) {
  try {
    const { data } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();
    return data || null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const { data } = await supabaseAdmin.from("products").select("slug");
    return (data || []).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const title = (product.title as string) || (product.name_en as string) || "Product";
  const name_ur = (product.name_ur as string) || "";

  return {
    title,
    description: `Shop ${title} ${name_ur}. Exclusive Gen-z streetwear from KhushKhush.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product || product.status === "Draft") {
    notFound();
  }

  return <ProductView product={product as any} />;
}
