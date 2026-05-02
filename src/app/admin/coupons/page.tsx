"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Coupon {
  id: string;
  code: string;
  discountAmount: number;
  type: string; // 'percent' or 'fixed'
  status: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("fixed");
  const [status, setStatus] = useState("Active");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "coupons"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !amount) return;
    try {
      const upperCode = code.toUpperCase();
      const docId = editingId || upperCode;
      
      await setDoc(doc(db, "coupons", docId), {
        code: upperCode,
        discountAmount: Number(amount),
        type: type,
        status: status,
        updatedAt: serverTimestamp(),
        ...(editingId ? {} : { createdAt: serverTimestamp() })
      });

      // Trigger storefront cache refresh
      await triggerRevalidation(["/", "/shop"]);

      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error("Error saving coupon", error);
      alert("Failed to save coupon");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setAmount("");
    setType("fixed");
    setStatus("Active");
  };

  const startEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setAmount(coupon.discountAmount.toString());
    setType(coupon.type || "fixed");
    setStatus(coupon.status || "Active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      setCoupons(coupons.filter(c => c.id !== id));

      // Trigger storefront cache refresh
      await triggerRevalidation(["/", "/shop"]);
    } catch (error) {
      console.error("Error deleting coupon", error);
      alert("Failed to delete coupon.");
    }
  };

  const filteredCoupons = coupons
    .filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.code.localeCompare(b.code));

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b-2 border-gray-800 pb-6">
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">Coupons.</h1>
        <input 
          type="text" 
          placeholder="Search Coupon Code" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-void-black border-2 border-gray-800 text-pure-white px-4 py-2 font-sans text-sm focus:border-acid-green outline-none w-full md:w-64"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create/Edit Form */}
        <div className="bg-void-black border-2 border-gray-800 p-6 h-fit sticky top-24">
          <h2 className="font-sans font-bold uppercase text-acid-green mb-6">
            {editingId ? "Edit Coupon" : "Create Coupon"}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Coupon Code</label>
              <Input 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="e.g. SUMMER20" 
                required 
                disabled={!!editingId}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-void-black border-2 border-gray-800 text-pure-white px-3 py-2 text-sm outline-none focus:border-acid-green"
                >
                  <option value="fixed">Fixed (PKR)</option>
                  <option value="percent">Percent (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Discount</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-void-black border-2 border-gray-800 text-pure-white px-3 py-2 text-sm outline-none focus:border-acid-green"
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? "SAVE CHANGES" : "ADD COUPON"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm} className="px-4">CANCEL</Button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-void-black border-2 border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="text-gray-400 uppercase text-sm font-bold border-b-2 border-gray-800 bg-gray-900/50">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-pure-white divide-y divide-gray-800">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-acid-green animate-pulse">LOADING...</td></tr>
                ) : paginatedCoupons.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No coupons match your search.</td></tr>
                ) : (
                  paginatedCoupons.map((coupon) => (
                    <tr key={coupon.id} className={`hover:bg-gray-800/20 transition-colors ${editingId === coupon.id ? 'bg-acid-green/5 border-l-4 border-l-acid-green' : ''}`}>
                      <td className="p-4">
                        <p className="font-mono font-bold uppercase tracking-widest">{coupon.code}</p>
                        <p className="text-[10px] text-gray-500">{coupon.type === 'percent' ? 'Percentage Discount' : 'Fixed Amount'}</p>
                      </td>
                      <td className="p-4 text-acid-green font-bold">
                        {coupon.type === 'percent' ? `${coupon.discountAmount}%` : `Rs. ${coupon.discountAmount.toLocaleString()}`}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          coupon.status === 'Active' ? 'text-acid-green border-acid-green' : 'text-gray-500 border-gray-500'
                        }`}>
                          {coupon.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="outline" className="text-xs py-1 h-auto px-2" onClick={() => startEdit(coupon)}>
                          EDIT
                        </Button>
                        <Button variant="outline" className="text-xs py-1 h-auto px-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-pure-white" onClick={() => handleDelete(coupon.id)}>
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
              <p className="text-xs font-bold text-gray-500 uppercase">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="text-[10px] py-1 h-auto px-3 border-gray-600 disabled:opacity-30"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  PREV
                </Button>
                <Button 
                  variant="outline" 
                  className="text-[10px] py-1 h-auto px-3 border-gray-600 disabled:opacity-30"
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
