"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ur: "",
    slug: "",
    price: "",
    comparePrice: "",
    description: "",
    images: [] as string[],
    sizes: {
      barray_log: 0,
      darmiane: 0,
      nojawan: 0,
      mote_afraad: 0
    },
    status: "Active",
    featured: false,
    tags: "",
    colors: "",
    collectionSlug: "",
  });

  useEffect(() => {
    const fetchCollections = async () => {
      const snapshot = await getDocs(collection(db, "collections"));
      setCollections(snapshot.docs.map(doc => ({ slug: doc.id, ...doc.data() })));
    };
    fetchCollections();
  }, []);

  const handleSlugify = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "name_en" && !formData.slug) {
      setFormData(prev => ({ ...prev, [name]: value, slug: handleSlugify(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSizeChange = (key: keyof typeof formData.sizes, value: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: { ...prev.sizes, [key]: parseInt(value) || 0 }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug) return alert("Slug is required");
    setLoading(true);

    try {
      const productRef = doc(db, "products", formData.slug);
      await setDoc(productRef, {
        ...formData,
        price: Number(formData.price),
        comparePrice: formData.comparePrice ? Number(formData.comparePrice) : null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      alert("Product created!");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide">NEW PRODUCT.</h1>
        <Button onClick={() => router.back()} variant="outline">CANCEL</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Info */}
          <div className="space-y-6">
            <div className="bg-card-bg p-6 border-2 border-gray-800 space-y-4">
              <h2 className="font-sans font-bold uppercase text-acid-green mb-4">General</h2>
              
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Name (English)</label>
                <Input name="name_en" value={formData.name_en} onChange={handleChange} required />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Name (Urdu) <span className="text-acid-green">(اردو)</span></label>
                <Input name="name_ur" value={formData.name_ur} onChange={handleChange} dir="rtl" className="font-urdu" required />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Slug</label>
                <Input name="slug" value={formData.slug} onChange={handleChange} required />
              </div>
            </div>

            <div className="bg-card-bg p-6 border-2 border-gray-800 space-y-4">
              <h2 className="font-sans font-bold uppercase text-acid-green mb-4">Description</h2>
              <RichTextEditor 
                content={formData.description} 
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))} 
              />
            </div>

            <div className="bg-card-bg p-6 border-2 border-gray-800 space-y-4">
              <h2 className="font-sans font-bold uppercase text-acid-green mb-4">Media</h2>
              <ImageUploader 
                images={formData.images} 
                onChange={(images) => setFormData(prev => ({ ...prev, images }))} 
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-6">
            <div className="bg-card-bg p-6 border-2 border-gray-800 space-y-4">
              <h2 className="font-sans font-bold uppercase text-acid-green mb-4">Pricing</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Price (PKR)</label>
                  <Input name="price" type="number" value={formData.price} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Compare-at Price</label>
                  <Input name="comparePrice" type="number" value={formData.comparePrice} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="bg-card-bg p-6 border-2 border-gray-800 space-y-4">
              <h2 className="font-sans font-bold uppercase text-acid-green mb-4">Inventory (Sizes)</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-400 font-urdu">بڑے لوگ (Large)</label>
                  <Input type="number" value={formData.sizes.barray_log} onChange={(e) => handleSizeChange("barray_log", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-400 font-urdu">درمیانے افراد (Medium)</label>
                  <Input type="number" value={formData.sizes.darmiane} onChange={(e) => handleSizeChange("darmiane", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-400 font-urdu">نوجوان (Small)</label>
                  <Input type="number" value={formData.sizes.nojawan} onChange={(e) => handleSizeChange("nojawan", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-400 font-urdu">موٹے افراد (XL)</label>
                  <Input type="number" value={formData.sizes.mote_afraad} onChange={(e) => handleSizeChange("mote_afraad", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="bg-card-bg p-6 border-2 border-gray-800 space-y-4">
              <h2 className="font-sans font-bold uppercase text-acid-green mb-4">Organization</h2>
              
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="flex h-12 w-full bg-void-black border-2 border-pure-white px-4 py-2 font-sans text-pure-white text-base focus-visible:outline-none focus-visible:border-acid-green"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Sold Out">Sold Out</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Collection</label>
                <select 
                  name="collectionSlug" 
                  value={formData.collectionSlug} 
                  onChange={handleChange}
                  className="flex h-12 w-full bg-void-black border-2 border-pure-white px-4 py-2 font-sans text-pure-white text-base focus-visible:outline-none focus-visible:border-acid-green"
                >
                  <option value="">No Collection</option>
                  {collections.map(col => (
                    <option key={col.slug} value={col.slug}>{col.title_en || col.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Tags (Comma separated)</label>
                <Input name="tags" value={formData.tags} onChange={handleChange} placeholder="meme, cool, trending" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Colors (Comma separated)</label>
                <Input name="colors" value={formData.colors} onChange={handleChange} placeholder="Black, White, Neon" />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input 
                  type="checkbox" 
                  name="featured" 
                  checked={formData.featured} 
                  onChange={handleChange}
                  className="w-5 h-5 accent-acid-green"
                />
                <label className="text-sm font-bold uppercase text-pure-white">Featured Product</label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t-2 border-gray-800">
          <Button type="submit" variant="primary" className="w-full md:w-auto md:px-16" disabled={loading}>
            {loading ? "SAVING..." : "SAVE PRODUCT"}
          </Button>
        </div>
      </form>
    </div>
  );
}
