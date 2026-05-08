import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://us.posthog.com";
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
    if (decoded.admin !== true) {
      return { ok: false as const, status: 403, error: "Admins only" };
    }
    return { ok: true as const };
  } catch {
    return { ok: false as const, status: 401, error: "Invalid token" };
  }
}

async function hogql(query: string) {
  if (!POSTHOG_PROJECT_ID || !POSTHOG_PERSONAL_API_KEY) {
    throw new Error("Missing POSTHOG_PROJECT_ID or POSTHOG_PERSONAL_API_KEY");
  }
  const res = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`PostHog query failed (${res.status}): ${detail}`);
  }
  const data = await res.json();
  return (data?.results || []) as unknown[][];
}

function rangeClause(days: number) {
  const safe = Math.min(Math.max(1, days), 365);
  return `timestamp >= now() - INTERVAL ${safe} DAY`;
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days")) || 30;
  const range = rangeClause(days);

  try {
    const [
      summary,
      visitsByDay,
      topPages,
      topCountries,
      topReferrers,
      deviceBreakdown,
      browserBreakdown,
      hourHeatmap,
      topProducts,
      topWishlisted,
      funnel,
    ] = await Promise.all([
      // Summary: total pageviews, unique visitors, sessions
      hogql(`
        SELECT
          count() AS pageviews,
          count(DISTINCT person_id) AS unique_visitors,
          count(DISTINCT properties.$session_id) AS sessions
        FROM events
        WHERE event = '$pageview' AND ${range}
      `),
      // Visits over time (daily)
      hogql(`
        SELECT toDate(timestamp) AS day, count() AS visits
        FROM events
        WHERE event = '$pageview' AND ${range}
        GROUP BY day
        ORDER BY day ASC
      `),
      // Top pages
      hogql(`
        SELECT properties.$pathname AS path, count() AS views
        FROM events
        WHERE event = '$pageview' AND ${range} AND properties.$pathname IS NOT NULL
        GROUP BY path
        ORDER BY views DESC
        LIMIT 15
      `),
      // Top countries
      hogql(`
        SELECT properties.$geoip_country_name AS country, count() AS visits
        FROM events
        WHERE event = '$pageview' AND ${range} AND properties.$geoip_country_name IS NOT NULL
        GROUP BY country
        ORDER BY visits DESC
        LIMIT 15
      `),
      // Top referrers
      hogql(`
        SELECT properties.$referring_domain AS source, count() AS visits
        FROM events
        WHERE event = '$pageview' AND ${range} AND properties.$referring_domain IS NOT NULL
        GROUP BY source
        ORDER BY visits DESC
        LIMIT 10
      `),
      // Devices
      hogql(`
        SELECT properties.$device_type AS device, count() AS visits
        FROM events
        WHERE event = '$pageview' AND ${range} AND properties.$device_type IS NOT NULL
        GROUP BY device
        ORDER BY visits DESC
      `),
      // Browsers
      hogql(`
        SELECT properties.$browser AS browser, count() AS visits
        FROM events
        WHERE event = '$pageview' AND ${range} AND properties.$browser IS NOT NULL
        GROUP BY browser
        ORDER BY visits DESC
        LIMIT 8
      `),
      // Hourly heatmap (day-of-week x hour)
      hogql(`
        SELECT
          toDayOfWeek(timestamp) AS dow,
          toHour(timestamp) AS hour,
          count() AS visits
        FROM events
        WHERE event = '$pageview' AND ${range}
        GROUP BY dow, hour
        ORDER BY dow ASC, hour ASC
      `),
      // Top products viewed
      hogql(`
        SELECT
          properties.product_slug AS slug,
          any(properties.product_name) AS name,
          count() AS views
        FROM events
        WHERE event = 'product_view' AND ${range} AND properties.product_slug IS NOT NULL
        GROUP BY slug
        ORDER BY views DESC
        LIMIT 10
      `),
      // Top wishlisted products
      hogql(`
        SELECT
          properties.product_slug AS slug,
          any(properties.product_name) AS name,
          count() AS adds
        FROM events
        WHERE event = 'add_to_wishlist' AND ${range} AND properties.product_slug IS NOT NULL
        GROUP BY slug
        ORDER BY adds DESC
        LIMIT 10
      `),
      // Funnel: views → cart → checkout → purchase
      hogql(`
        SELECT
          countIf(event = 'product_view') AS views,
          countIf(event = 'add_to_cart') AS carts,
          countIf(event = 'begin_checkout') AS checkouts,
          countIf(event = 'purchase') AS purchases
        FROM events
        WHERE ${range}
      `),
    ]);

    return NextResponse.json({
      days,
      summary: {
        pageviews: Number(summary?.[0]?.[0]) || 0,
        uniqueVisitors: Number(summary?.[0]?.[1]) || 0,
        sessions: Number(summary?.[0]?.[2]) || 0,
      },
      visitsByDay: visitsByDay.map((r) => ({ day: String(r[0]), visits: Number(r[1]) })),
      topPages: topPages.map((r) => ({ path: String(r[0]), views: Number(r[1]) })),
      topCountries: topCountries.map((r) => ({ country: String(r[0]), visits: Number(r[1]) })),
      topReferrers: topReferrers.map((r) => ({ source: String(r[0]), visits: Number(r[1]) })),
      devices: deviceBreakdown.map((r) => ({ device: String(r[0]), visits: Number(r[1]) })),
      browsers: browserBreakdown.map((r) => ({ browser: String(r[0]), visits: Number(r[1]) })),
      heatmap: hourHeatmap.map((r) => ({ dow: Number(r[0]), hour: Number(r[1]), visits: Number(r[2]) })),
      topProducts: topProducts.map((r) => ({ slug: String(r[0]), name: r[1] ? String(r[1]) : "", views: Number(r[2]) })),
      topWishlisted: topWishlisted.map((r) => ({ slug: String(r[0]), name: r[1] ? String(r[1]) : "", adds: Number(r[2]) })),
      funnel: {
        views: Number(funnel?.[0]?.[0]) || 0,
        carts: Number(funnel?.[0]?.[1]) || 0,
        checkouts: Number(funnel?.[0]?.[2]) || 0,
        purchases: Number(funnel?.[0]?.[3]) || 0,
      },
    });
  } catch (error: unknown) {
    console.error("Analytics query failed", error);
    return NextResponse.json(
      { error: "Analytics query failed", detail: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
