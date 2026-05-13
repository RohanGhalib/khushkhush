import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khushkhush.com';
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  // 1. Static Routes
  const routes = [
    '',
    '/shop',
    '/ambassador',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Helper to safely fetch from Firestore REST
  async function fetchFromFirestore(collection: string) {
    if (!projectId || !apiKey) return [];
    try {
      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?key=${apiKey}&pageSize=200`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.documents ?? []).map((doc: { name: string; updateTime?: string }) => ({
        slug: doc.name.split("/").pop() as string,
        updatedAt: doc.updateTime || new Date().toISOString()
      }));
    } catch {
      return [];
    }
  }

  // 2. Dynamic Product Routes
  const products = await fetchFromFirestore('products');
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // 3. Dynamic Collection Routes
  const collections = await fetchFromFirestore('collections');
  const collectionRoutes = collections.map((collection) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    lastModified: collection.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...productRoutes, ...collectionRoutes];
}
