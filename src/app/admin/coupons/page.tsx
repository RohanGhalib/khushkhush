"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !amount) return;
    try {
      const upperCode = code.toUpperCase();
      await setDoc(doc(db, "coupons", upperCode), {
        code: upperCode,
        discountAmount: Number(amount),
        type: "fixed",
        status: "Active",
        createdAt: serverTimestamp()
      });
      setCode("");
      setAmount("");
      fetchCoupons();
    } catch (error) {
      console.error("Error adding coupon", error);
      alert("Failed to add coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting coupon", error);
      alert("Failed to delete coupon.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">Coupons.</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-void-black border-2 border-gray-800 p-6 h-fit">
          <h2 className="font-sans font-bold uppercase text-acid-green mb-6">Create Coupon</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Coupon Code</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SUMMER20" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-400">Discount Amount (PKR)</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <Button type="submit" variant="primary" className="w-full">ADD COUPON</Button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-void-black border-2 border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="text-gray-400 uppercase text-sm font-bold border-b-2 border-gray-800 bg-gray-900/50">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-pure-white divide-y divide-gray-800">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-acid-green animate-pulse">LOADING...</td></tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No coupons found.</td></tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="p-4 font-mono font-bold uppercase tracking-widest">{coupon.code}</td>
                      <td className="p-4 text-acid-green font-bold">Rs. {coupon.discountAmount}</td>
                      <td className="p-4 text-acid-green text-xs font-bold uppercase">{coupon.status}</td>
                      <td className="p-4 text-right space-x-2">
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
        </div>
      </div>
    </div>
  );
}
