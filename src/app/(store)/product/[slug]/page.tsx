"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCartStore } from "@/lib/cart";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Product {
  slug: string;
  name_en: string;
  name_ur: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  description: string;
  sizes: {
    barray_log: number;
    darmiane: number;
    nojawan: number;
    mote_afraad: number;
  };
  status: string;
}

const SIZE_MAP = [
  { key: "nojawan", urdu: "نوجوان", english: "Small" },
  { key: "darmiane", urdu: "درمیانے افراد", english: "Medium" },
  { key: "barray_log", urdu: "بڑے لوگ", english: "Large" },
  { key: "mote_afraad", urdu: "موٹے افراد", english: "XL" },
];

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const docRef = doc(db, "products", params.slug);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setProduct({ slug: snapshot.id, ...snapshot.data() } as Product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card-bg">
        <p className="font-twenly text-4xl text-acid-green animate-pulse">LOADING...</p>
      </div>
    );
  }

  if (!product || product.status === "Draft") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card-bg">
        <p className="font-twenly text-4xl text-pure-white">PRODUCT NOT FOUND</p>
      </div>
    );
  }

  const isSoldOut = product.status === "Sold Out";
  const isOnSale = product.comparePrice && product.comparePrice > product.price;

  const handleAddToCart = () => {
    if (!selectedSize) return alert("Please select a size first!");
    
    const sizeObj = SIZE_MAP.find(s => s.key === selectedSize);
    
    addItem({
      id: `${product.slug}-${selectedSize}`,
      slug: product.slug,
      name_en: product.name_en,
      name_ur: product.name_ur,
      size: sizeObj ? sizeObj.urdu : selectedSize,
      price: product.price,
      image: product.images[0] || "",
      qty: 1
    });
  };

  return (
    <div className="min-h-screen bg-card-bg">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        
        {/* Left: Media Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/5] w-full bg-void-black border-4 border-gray-800 brutalist-border">
            {product.images?.[selectedImage] ? (
              <Image 
                src={product.images[selectedImage]} 
                alt={product.name_en} 
                fill 
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-twenly text-4xl text-gray-700">
                NO IMG
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative w-24 h-24 flex-shrink-0 border-2 transition-colors",
                    selectedImage === idx ? "border-acid-green" : "border-gray-800 hover:border-pure-white"
                  )}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <div className="border-b-4 border-gray-800 pb-8 mb-8">
            <h1 className="font-sans font-black text-4xl md:text-5xl uppercase text-pure-white mb-2 leading-tight">
              {product.name_en}
            </h1>
            <h2 className="font-urdu text-3xl text-acid-green mb-6">{product.name_ur}</h2>
            
            <div className="flex items-center gap-4">
              <span className="font-sans font-bold text-3xl text-pure-white">
                Rs. {product.price.toLocaleString()}
              </span>
              {isOnSale && (
                <span className="font-sans font-bold text-xl text-gray-500 line-through">
                  Rs. {product.comparePrice?.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <span className="font-sans font-bold uppercase text-gray-400 text-sm tracking-widest">Select Size</span>
              <button className="font-sans font-bold uppercase text-acid-green text-xs hover:underline">
                Size Guide
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {SIZE_MAP.map((size) => {
                const stock = product.sizes[size.key as keyof typeof product.sizes] || 0;
                const outOfStock = stock <= 0;
                const isSelected = selectedSize === size.key;

                return (
                  <button
                    key={size.key}
                    disabled={outOfStock || isSoldOut}
                    onClick={() => setSelectedSize(size.key)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 border-2 transition-colors",
                      outOfStock || isSoldOut
                        ? "border-gray-800 text-gray-600 bg-void-black cursor-not-allowed opacity-50"
                        : isSelected
                        ? "border-acid-green bg-acid-green text-void-black"
                        : "border-pure-white text-pure-white hover:bg-pure-white hover:text-void-black"
                    )}
                  >
                    <span className="font-urdu text-xl mb-1">{size.urdu}</span>
                    <span className="font-sans font-bold uppercase text-xs">{size.english}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button 
            variant="primary" 
            className="w-full h-16 text-xl shadow-[6px_6px_0px_#FFFFFF] mb-12"
            disabled={isSoldOut || !selectedSize}
            onClick={handleAddToCart}
          >
            {isSoldOut ? "SOLD OUT" : !selectedSize ? "SELECT A SIZE" : "ADD TO CART"}
          </Button>

          <div className="prose prose-invert max-w-none font-sans text-gray-300">
            <h3 className="font-sans font-bold uppercase text-pure-white mb-4 tracking-widest border-b border-gray-800 pb-2">
              Details
            </h3>
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        </div>
      </div>
    </div>
  );
}
