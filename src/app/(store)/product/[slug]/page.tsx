import { ProductClient } from "@/components/store/ProductClient";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

// Use REST API for metadata to avoid GRPC errors on server
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/products/${slug}?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    
    if (!res.ok) return { title: "Product Not Found" };
    
    const data = await res.json();
    const fields = data.fields;
    const name_en = fields?.name_en?.stringValue || "Product";
    const name_ur = fields?.name_ur?.stringValue || "";
    
    return {
      title: name_en,
      description: `Shop ${name_en} - ${name_ur}. Exclusive Gen-z streetwear from KhushKhush.`,
    };
  } catch (error) {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductClient slug={slug} />;
}
