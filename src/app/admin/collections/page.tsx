"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Collection {
  slug: string;
  title?: string;
  title_en: string;
  title_ur: string;
  image: string;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [titleEn, setTitleEn] = useState("");
  const [titleUr, setTitleUr] = useState("");
  const [image, setImage] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCollections();
  }, []);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn) return;
    
    try {
      const slug = editingSlug || titleEn.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      showNotification(editingSlug ? "Saving changes..." : "Creating collection...");

      await setDoc(doc(db, "collections", slug), {
        title_en: titleEn,
        title_ur: titleUr,
        image: image,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      resetForm();
      fetchCollections();
      showNotification(editingSlug ? "Collection updated" : "Collection created");
    } catch (error) {
      console.error("Error saving collection", error);
      showNotification("Failed to save collection", "error");
    }
  };

  const resetForm = () => {
    setEditingSlug(null);
    setTitleEn("");
    setTitleUr("");
    setImage("");
  };

  const startEdit = (col: any) => {
    setEditingSlug(col.slug);
    setTitleEn(col.title_en || col.title || "");
    setTitleUr(col.title_ur || "");
    setImage(col.image || "");
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      showNotification(`Deleting ${slug}...`);
      await deleteDoc(doc(db, "collections", slug));
      setCollections(collections.filter(c => c.slug !== slug));
      showNotification("Collection deleted");
    } catch (error) {
      console.error("Error deleting collection", error);
      showNotification("Failed to delete", "error");
    }
  };

  const filteredCollections = collections
    .filter(c => (c.title_en || c.title || "").toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (a.title_en || a.title || "").localeCompare(b.title_en || b.title || ""));

  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const paginatedCollections = filteredCollections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">Collections.</h1>
        <input 
          type="text" 
          placeholder="Search Collection" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-void-black border-2 border-gray-800 text-pure-white px-4 py-2 font-sans text-sm focus:border-acid-green outline-none w-full md:w-64"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="bg-void-black border-2 border-gray-800 p-6 h-fit sticky top-24">
          <h2 className="font-sans font-bold uppercase text-acid-green mb-6">
            {editingSlug ? "Edit Collection" : "Add Collection"}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Title (English)</label>
              <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="e.g. Summer Drop" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Title (Urdu)</label>
              <Input value={titleUr} onChange={(e) => setTitleUr(e.target.value)} placeholder="مثال: گرمیوں کا مجموعہ" className="text-right font-urdu" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Cover Image URL</label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingSlug ? "SAVE CHANGES" : "CREATE"}
              </Button>
              {editingSlug && (
                <Button type="button" variant="outline" onClick={resetForm} className="px-4">CANCEL</Button>
              )}
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 bg-void-black border-2 border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="text-gray-400 uppercase text-sm font-bold border-b-2 border-gray-800 bg-gray-900/50">
                <tr>
                  <th className="p-4">Collection</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-pure-white divide-y divide-gray-800">
                {loading ? (
                  <tr><td colSpan={3} className="p-8 text-center text-acid-green animate-pulse">LOADING...</td></tr>
                ) : paginatedCollections.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-500">No collections found.</td></tr>
                ) : (
                  paginatedCollections.map((col) => (
                    <tr key={col.slug} className={`hover:bg-gray-800/20 transition-colors ${editingSlug === col.slug ? 'bg-acid-green/5 border-l-4 border-l-acid-green' : ''}`}>
                      <td className="p-4">
                        <p className="font-bold uppercase">{col.title_en || col.title}</p>
                        <p className="text-xs font-urdu text-gray-400">{col.title_ur}</p>
                      </td>
                      <td className="p-4 text-gray-400 font-mono text-xs">{col.slug}</td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="outline" className="text-xs py-1 h-auto px-2" onClick={() => startEdit(col)}>EDIT</Button>
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
    </div>
  );
}
