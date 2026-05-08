import posthog from "posthog-js";

type ProductPayload = {
  slug: string;
  name?: string;
  price?: number;
  category?: string;
  size?: string;
  qty?: number;
};

function safeCapture(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.capture(event, props);
}

export const track = {
  productView: (p: ProductPayload) =>
    safeCapture("product_view", {
      product_slug: p.slug,
      product_name: p.name,
      product_price: p.price,
      product_category: p.category,
    }),
  addToCart: (p: ProductPayload) =>
    safeCapture("add_to_cart", {
      product_slug: p.slug,
      product_name: p.name,
      product_price: p.price,
      product_size: p.size,
      product_qty: p.qty || 1,
    }),
  addToWishlist: (p: ProductPayload) =>
    safeCapture("add_to_wishlist", {
      product_slug: p.slug,
      product_name: p.name,
      product_price: p.price,
    }),
  removeFromWishlist: (p: ProductPayload) =>
    safeCapture("remove_from_wishlist", {
      product_slug: p.slug,
    }),
  beginCheckout: (props: { itemCount: number; subtotal: number }) =>
    safeCapture("begin_checkout", props),
  purchase: (props: {
    orderId: string;
    total: number;
    itemCount: number;
    referralCode?: string | null;
    couponCode?: string | null;
  }) => safeCapture("purchase", props),
};
