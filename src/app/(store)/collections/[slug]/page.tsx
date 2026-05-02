import { Metadata } from "next";
import { CollectionView } from "@/components/store/CollectionView";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
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

async function fetchCollectionProducts(slug: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  try {
    // Structured query to filter by tag and status
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
    
    const query = {
      structuredQuery: {
        from: [{ collectionId: "products" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: "status" },
                  op: "EQUAL",
                  value: { stringValue: "Active" }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: "tags" },
                  op: "ARRAY_CONTAINS",
                  value: { stringValue: slug }
                }
              }
            ]
          }
        }
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
      next: { revalidate: 3600 }
    });

    if (!res.ok) return [];

    const data = await res.json();
    // runQuery returns an array of { document: ... }
    return (data || []).filter((item: any) => item.document).map((item: any) => {
      const doc = item.document;
      const slug = doc.name.split("/").pop() as string;
      const parsed: Record<string, unknown> = { slug };
      for (const [key, value] of Object.entries(doc.fields || {})) {
        parsed[key] = parseFirestoreValue(value as Record<string, unknown>);
      }
      return parsed;
    });
  } catch (error) {
    console.error(`Failed to fetch products for collection ${slug}:`, error);
    return [];
  }
}

export async function generateStaticParams() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/collections?key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.documents ?? []).map((doc: { name: string }) => ({
      slug: doc.name.split("/").pop(),
    }));
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

  // We could also fetch the collection metadata here if we wanted to show the title/description
  // But for now we just pass the products.

  return <CollectionView slug={slug} products={products} />;
}
