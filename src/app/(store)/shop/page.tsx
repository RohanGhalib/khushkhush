import { Metadata } from "next";
import { ShopClient } from "@/components/store/ShopClient";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the complete KhushKhush archive. Exclusive Gen-z streetwear and meme-inspired drops.",
};

export default function ShopPage() {
  return <ShopClient />;
}
