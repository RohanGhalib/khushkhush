"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, limit, query } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const triggerRevalidation = async (paths: string[]) => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) return;

      await fetch("/api/revalidate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ paths }),
      });
    } catch (err) {
      console.error("Revalidation failed:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, "products"), limit(300)));
      const data = snapshot.docs.map(doc => ({ slug: doc.id, ...doc.data() } as Product));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(p => p.name_en.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name_en.localeCompare(b.name_en);
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search/sort
  }, [searchQuery, sortBy]);

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      showNotification(`Deleting ${slug}...`);
      await deleteDoc(doc(db, "products", slug));
      setProducts(products.filter(p => p.slug !== slug));
      
      // Trigger instant cache refresh for storefront
      await triggerRevalidation(["/", "/shop", `/product/${slug}`]);
      
      showNotification("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product", error);
      showNotification("Failed to delete product", "error");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-8 z-[200] p-4 border-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-acid-green border-void-black text-void-black' : 'bg-red-600 border-pure-white text-pure-white'
        }`}>
          <div className="font-sans font-black uppercase text-sm">{notification.message}</div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b-2 border-gray-800 pb-6">
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">Products.</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search Product Name" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-void-black border-2 border-gray-800 text-pure-white px-4 py-2 font-sans text-sm focus:border-acid-green outline-none w-full sm:w-64"
          />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-void-black border-2 border-gray-800 text-pure-white px-4 py-2 font-sans text-sm focus:border-acid-green outline-none"
          >
            <option value="name">Name: A-Z</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="status">Status</option>
          </select>
          <Link href="/admin/products/new">
            <Button variant="primary" className="text-sm">ADD PRODUCT</Button>
          </Link>
        </div>
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
              ) : paginatedProducts.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No products match your search.</td></tr>
              ) : (
                paginatedProducts.map((product) => (
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t-2 border-gray-800 flex justify-between items-center bg-gray-900/20">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Showing page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="text-xs py-1 h-auto px-3 border-gray-600 disabled:opacity-30"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                PREVIOUS
              </Button>
              <Button 
                variant="outline" 
                className="text-xs py-1 h-auto px-3 border-gray-600 disabled:opacity-30"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                NEXT
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
