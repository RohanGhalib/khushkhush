import { Metadata } from "next";
import { CollectionView } from "@/components/store/CollectionView";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

async function fetchCollectionProducts(slug: string) {
  try {
    const { data } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("status", "Active")
      .or(`collection_slug.eq.${slug},category.eq.${slug}`);

    return data || [];
  } catch (error) {
    console.error(`Failed to fetch products for collection ${slug}:`, error);
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const { data } = await supabaseAdmin.from("collections").select("slug");
    return (data || []).map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.toUpperCase()} Collection`,
    description: `Explore the ${slug} collection at KhushKhush. Exclusive streetwear drops and limited editions.`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const products = await fetchCollectionProducts(slug);

  return <CollectionView slug={slug} products={products} />;
}
