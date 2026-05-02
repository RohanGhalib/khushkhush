import { ProductView } from "@/components/store/ProductView";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// ISR: revalidate product pages every hour. Static pages are pre-built at
// deploy time for all known products and served from CDN — no Firestore read
// per visitor.
export const revalidate = 3600;

// ── Firestore REST helpers ──────────────────────────────────────────────────

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

async function fetchProduct(slug: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${encodeURIComponent(slug)}?key=${apiKey}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.fields) return null;

  const parsed: Record<string, unknown> = { slug };
  for (const [key, value] of Object.entries(data.fields)) {
    parsed[key] = parseFirestoreValue(value as Record<string, unknown>);
  }
  return parsed;
}

// ── generateStaticParams ────────────────────────────────────────────────────
// Pre-build all known product pages at deploy time. On-demand generation
// happens automatically for slugs not in this list (dynamicParams default = true).

export async function generateStaticParams() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?key=${apiKey}&pageSize=200`,
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

// ── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const name_en = product.name_en as string ?? "Product";
  const name_ur = product.name_ur as string ?? "";

  return {
    title: name_en,
    description: `Shop ${name_en} - ${name_ur}. Exclusive Gen-z streetwear from KhushKhush.`,
  };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product || product.status === "Draft") {
    notFound();
  }

  // ProductView is a Client Component — handles Add to Cart, size selection,
  // wishlist toggle, etc. It receives the already-fetched product as a prop.
  return <ProductView product={product as any} />;
}
