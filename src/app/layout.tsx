import type { Metadata } from "next";
import { DM_Sans, Noto_Nastaliq_Urdu } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { StoreLayout } from "@/components/layout/StoreLayout";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const notoNastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "KhushKhush. | Gen-z Streetwear & Meme Culture",
    template: "%s | KhushKhush."
  },
  description: "Aggressive Gen-z streetwear. Meme-inspired drops. Brutalist aesthetic. Premium quality shirts, hoodies, and accessories.",
  keywords: ["streetwear", "gen-z fashion", "meme clothing", "pakistan fashion", "brutalist design", "khushkhush"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${notoNastaliq.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-void-black text-pure-white font-sans selection:bg-acid-green selection:text-void-black relative">
        <svg
          className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="diagonal-text"
              width="400"
              height="300"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-45)"
            >
              <text x="-50" y="100" className="font-twenly text-4xl fill-acid-green font-bold">
                yeah so cool! yeah so cool!
              </text>
              <text x="50" y="250" className="font-twenly text-4xl fill-acid-green font-bold">
                yeah so cool! yeah so cool!
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-text)" className="animate-pattern" />
        </svg>
        <AuthProvider>
          <StoreLayout>
            {children}
          </StoreLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
