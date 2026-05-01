import { Metadata } from "next";
import { HomeClient } from "@/components/store/HomeClient";

export const metadata: Metadata = {
  title: "Home",
  description: "Gen-z Meme Streetwear. Massive types. Brutalist aesthetic.",
};

export default function Home() {
  return <HomeClient />;
}
