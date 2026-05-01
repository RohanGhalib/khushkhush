"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

interface Product {
  slug: string;
  name_en: string;
  price: number;
  status: string;
  images: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map(doc => ({ slug: doc.id, ...doc.data() } as Product));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", slug));
      setProducts(products.filter(p => p.slug !== slug));
    } catch (error) {
      console.error("Error deleting product", error);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">Products.</h1>
        <Link href="/admin/products/new">
          <Button variant="primary" className="text-sm">ADD PRODUCT</Button>
        </Link>
      </div>

      <div className="bg-void-black border-2 border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="text-gray-400 uppercase text-sm font-bold border-b-2 border-gray-800 bg-gray-900/50">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-pure-white divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-acid-green animate-pulse">LOADING PRODUCTS...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No products found.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.slug} className="hover:bg-gray-800/20 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 relative bg-card-bg border border-gray-800">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name_en} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">IMG</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold">{product.name_en}</td>
                    <td className="p-4 text-acid-green font-bold">Rs. {product.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold uppercase border ${
                        product.status === 'Active' ? 'text-acid-green border-acid-green bg-acid-green/10' :
                        product.status === 'Draft' ? 'text-gray-400 border-gray-400 bg-gray-400/10' :
                        'text-red-500 border-red-500 bg-red-500/10'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link href={`/admin/products/${product.slug}`}>
                        <Button variant="outline" className="text-xs py-1 h-auto px-2">EDIT</Button>
                      </Link>
                      <Button variant="outline" className="text-xs py-1 h-auto px-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-pure-white" onClick={() => handleDelete(product.slug)}>
                        DELETE
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
