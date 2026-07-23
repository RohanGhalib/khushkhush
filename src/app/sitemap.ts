import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khushkhush.com';

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

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('slug, updated_at')
    .neq('status', 'Draft');

  const productRoutes = (products || []).map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updated_at || new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const { data: collections } = await supabaseAdmin
    .from('collections')
    .select('slug, created_at');

  const collectionRoutes = (collections || []).map((col) => ({
    url: `${baseUrl}/collections/${col.slug}`,
    lastModified: col.created_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...productRoutes, ...collectionRoutes];
}
