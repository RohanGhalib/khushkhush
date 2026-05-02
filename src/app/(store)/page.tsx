import { Metadata } from "next";
import { HomeClient } from "@/components/store/HomeClient";

export const metadata: Metadata = {
  title: "KhushKhush | Gen-z Meme Streetwear",
  description: "Gen-z Meme Streetwear. Massive types. Brutalist aesthetic.",
};

// ISR: revalidate every hour.
export const revalidate = 3600;

// Firestore REST helpers
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

async function fetchData() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  try {
    // Fetch Latest Products
    const productsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
    const productsQuery = {
      structuredQuery: {
        from: [{ collectionId: "products" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "status" },
            op: "EQUAL",
            value: { stringValue: "Active" }
          }
        },
        limit: 4
      }
    };

    const collectionsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/collections?key=${apiKey}`;

    const [productsRes, collectionsRes] = await Promise.all([
      fetch(productsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productsQuery),
        next: { revalidate: 3600 }
      }),
      fetch(collectionsUrl, { next: { revalidate: 3600 } })
    ]);

    let products: any[] = [];
    if (productsRes.ok) {
      const data = await productsRes.json();
      products = (data || []).filter((item: any) => item.document).map((item: any) => {
        const doc = item.document;
        const slug = doc.name.split("/").pop();
        const parsed: Record<string, unknown> = { slug };
        for (const [key, value] of Object.entries(doc.fields || {})) {
          parsed[key] = parseFirestoreValue(value as Record<string, unknown>);
        }
        return parsed;
      });
    }

    let collections: any[] = [];
    if (collectionsRes.ok) {
      const data = await collectionsRes.json();
      collections = (data.documents ?? []).map((doc: any) => {
        const slug = doc.name.split("/").pop();
        const parsed: Record<string, unknown> = { slug };
        for (const [key, value] of Object.entries(doc.fields || {})) {
          parsed[key] = parseFirestoreValue(value as Record<string, unknown>);
        }
        return parsed;
      });
    }

    return { products, collections };
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    return { products: [], collections: [] };
  }
}

export default async function Home() {
  const { products, collections } = await fetchData();
  return <HomeClient products={products} collections={collections} />;
}
