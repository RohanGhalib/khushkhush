import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void-black text-pure-white font-sans">
      <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        <div className="prose prose-invert prose-acid max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}
