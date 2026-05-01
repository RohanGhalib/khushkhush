import Link from "next/link";
import Image from "next/image";

interface CollectionCardProps {
  title: string;
  slug: string;
  image?: string;
}

export function CollectionCard({ title, slug, image }: CollectionCardProps) {
  return (
    <Link href={`/collections/${slug}`} className="group relative aspect-square bg-void-black border-2 border-gray-800 overflow-hidden block">
      {image ? (
        <Image src={image} alt={title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <span className="font-twenly text-gray-700 text-4xl">IMG</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-void-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
        <span className="bg-acid-green text-void-black font-sans font-bold px-6 py-2 uppercase tracking-widest text-lg translate-y-4 group-hover:translate-y-0 transition-transform">
          Explore &rarr;
        </span>
      </div>

      <div className="absolute bottom-4 left-4 z-20">
        <h3 className="font-twenly text-3xl text-pure-white group-hover:text-acid-green transition-colors drop-shadow-lg">
          {title}
        </h3>
      </div>
    </Link>
  );
}
