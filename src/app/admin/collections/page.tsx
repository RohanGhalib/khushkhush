"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

interface Collection {
  slug: string;
  title: string;
  image: string;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "collections"));
      const data = snapshot.docs.map(doc => ({ slug: doc.id, ...doc.data() } as Collection));
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      await deleteDoc(doc(db, "collections", slug));
      setCollections(collections.filter(c => c.slug !== slug));
    } catch (error) {
      console.error("Error deleting collection", error);
      alert("Failed to delete collection.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">Collections.</h1>
        <Button variant="primary" className="text-sm">ADD COLLECTION</Button>
      </div>

      <div className="bg-void-black border-2 border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="text-gray-400 uppercase text-sm font-bold border-b-2 border-gray-800 bg-gray-900/50">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-pure-white divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={3} className="p-8 text-center text-acid-green animate-pulse">LOADING...</td></tr>
              ) : collections.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-gray-500">No collections found.</td></tr>
              ) : (
                collections.map((col) => (
                  <tr key={col.slug} className="hover:bg-gray-800/20 transition-colors">
                    <td className="p-4 font-bold uppercase">{col.title}</td>
                    <td className="p-4 text-gray-400 font-mono">{col.slug}</td>
                    <td className="p-4 text-right space-x-2">
                      <Button variant="outline" className="text-xs py-1 h-auto px-2">EDIT</Button>
                      <Button variant="outline" className="text-xs py-1 h-auto px-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-pure-white" onClick={() => handleDelete(col.slug)}>
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
