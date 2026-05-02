import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  slug: string;
  name_en: string;
  name_ur: string;
  price: number;
  image: string;
}

interface WishlistState {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  removeItem: (slug: string) => void;
  isInWishlist: (slug: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (item) => {
        set((state) => {
          const exists = state.items.find(i => i.slug === item.slug);
          return {
            items: exists
              ? state.items.filter(i => i.slug !== item.slug)
              : [...state.items, item],
          };
        });
      },
      removeItem: (slug) => {
        set((state) => ({ items: state.items.filter(i => i.slug !== slug) }));
      },
      isInWishlist: (slug) => {
        return !!get().items.find(i => i.slug === slug);
      }
    }),
    {
      name: 'khushkhush-wishlist',
    }
  )
);
