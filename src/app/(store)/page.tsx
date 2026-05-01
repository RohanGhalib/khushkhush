import { ProductCard } from "@/components/store/ProductCard";
import { CollectionCard } from "@/components/store/CollectionCard";
import { NewsletterBar } from "@/components/store/NewsletterBar";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center p-8 relative overflow-hidden min-h-[90vh]">
        <div className="z-10 flex flex-col items-center justify-center text-center">
          <h1 className="font-twenly text-acid-green leading-none mb-6 tracking-tight" style={{ fontSize: 'clamp(80px, 14vw, 180px)' }}>
            KhUShKhUSh.
          </h1>
          
          <p className="text-pure-white text-xl md:text-3xl font-medium mb-12 animate-fade-in-up tracking-wider">
            Gen-z We're Coming!
          </p>

          <button className="bg-acid-green text-void-black font-twenly text-3xl px-12 py-4 uppercase transition-all duration-300 border-2 border-transparent hover:bg-void-black hover:text-acid-green hover:border-acid-green">
            Shop Now &rarr;
          </button>
        </div>

        <div className="absolute bottom-0 w-full bg-acid-green text-void-black py-4 marquee-container border-y-4 border-void-black font-urdu text-2xl md:text-3xl font-bold z-10">
          <div className="marquee-content space-x-12 px-4 flex items-center">
            <span>دنیا گول ہے منافق ماحول ہے</span>
            <span>•</span>
            <span>بڑے لوگ</span>
            <span>•</span>
            <span>درمیانے افراد</span>
            <span>•</span>
            <span>نوجوان</span>
            <span>•</span>
            <span>موٹے افراد</span>
            <span>•</span>
            <span>دنیا گول ہے منافق ماحول ہے</span>
            <span>•</span>
            <span>بڑے لوگ</span>
            <span>•</span>
            <span>درمیانے افراد</span>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 px-6 md:px-12 bg-void-black z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 border-b-2 border-gray-800 pb-4">
            <h2 className="font-twenly text-5xl md:text-6xl text-pure-white uppercase tracking-wide">
              Collections.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CollectionCard title="MEME" slug="meme" />
            <CollectionCard title="ANIME" slug="anime" />
            <CollectionCard title="MOVIE" slug="movie" />
            <CollectionCard title="FRAME" slug="frame" />
          </div>
        </div>
      </section>

      {/* Latest Drop (Static for now, will connect to Firestore) */}
      <section className="py-24 px-6 md:px-12 bg-card-bg z-10 brutalist-border-green">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 border-b-2 border-gray-800 pb-4">
            <h2 className="font-twenly text-5xl md:text-6xl text-acid-green uppercase tracking-wide">
              Latest Drop.
            </h2>
            <p className="font-sans font-bold text-gray-400 uppercase tracking-widest hidden md:block">
              Fresh off the press
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard 
              slug="dunya-gol-hai" 
              name_en="Dunya Gol Hai" 
              name_ur="دنیا گول ہے منافق ماحول ہے" 
              price={3500} 
              comparePrice={4500}
              image="" 
              status="Active" 
            />
            <ProductCard 
              slug="khushkhush-logo-tee" 
              name_en="Logo Tee" 
              name_ur="خوش خوش" 
              price={3000} 
              image="" 
              status="Active" 
            />
            <ProductCard 
              slug="anime-eyes" 
              name_en="Anime Eyes" 
              name_ur="انیمی آنکھیں" 
              price={3500} 
              image="" 
              status="Sold Out" 
            />
            <ProductCard 
              slug="frame-collection-01" 
              name_en="Frame 01" 
              name_ur="فریم ۰۱" 
              price={4000} 
              image="" 
              status="Active" 
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterBar />

    </main>
  );
}
