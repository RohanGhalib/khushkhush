import { Metadata } from "next";
import { ShopGrid } from "@/components/store/ShopGrid";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the complete KhushKhush archive. Exclusive Gen-z streetwear and meme-inspired drops.",
};

// ISR: revalidate every hour. Shoppers always get near-instant page loads
// from CDN cache, while the data stays fresh. 1000 concurrent visitors
// will hit the cache, not Firestore.
export const revalidate = 3600;

interface FirestoreProduct {
  slug: string;
  name_en: string;
  name_ur: string;
  price: number;
  status: string;
  images: string[];
  [key: string]: unknown;
}

function parseFirestoreValue(value: Record<string, unknown>): unknown {
  if (!value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return parseInt(value.integerValue as string, 10);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("arrayValue" in value) {
    const arr = value.arrayValue as { values?: Record<string, unknown>[] };
    return (arr.values ?? []).map(parseFirestoreValue);
  }
  if ("mapValue" in value) {
    const map = value.mapValue as { fields?: Record<string, Record<string, unknown>> };
    const fields = map.fields ?? {};
    return Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, parseFirestoreValue(v)])
    );
  }
  return null;
}

async function fetchProducts(): Promise<FirestoreProduct[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  try {
    // Firestore REST API — works in Server Components without the gRPC client SDK
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?key=${apiKey}&pageSize=200`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const docs: FirestoreProduct[] = [];

    for (const doc of data.documents ?? []) {
      const fields = doc.fields ?? {};
      const status = (fields.status as { stringValue?: string })?.stringValue;
      // Filter out drafts server-side
      if (status === "Draft") continue;

      const slug = doc.name.split("/").pop() as string;
      const parsed: Record<string, unknown> = { slug };
      for (const [key, value] of Object.entries(fields)) {
        parsed[key] = parseFirestoreValue(value as Record<string, unknown>);
      }
      docs.push(parsed as FirestoreProduct);
    }

    return docs;
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
