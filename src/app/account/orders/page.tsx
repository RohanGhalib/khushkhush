"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/lib/authStore";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function UserOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchOrders() {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user!.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="text-acid-green animate-pulse">FETCHING ORDERS...</div>;
  }

  return (
    <div>
      <h2 className="font-twenly text-3xl text-acid-green mb-8 uppercase tracking-wide border-b-2 border-gray-800 pb-4">
        Your Orders.
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center opacity-50">
          <ShoppingBag size={64} className="mb-6 text-gray-700" />
          <p className="font-twenly text-2xl mb-4 text-pure-white">NO ORDERS YET.</p>
          <p className="font-urdu text-xl text-gray-500">مڈی تیار رکھو منافق ماحول ہے</p>
          <Link href="/shop" className="mt-8 text-acid-green font-bold uppercase hover:underline">
            Go Shopping &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="border-2 border-gray-800 p-6 bg-void-black/30">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-4 border-b border-gray-800">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
                  <p className="font-mono text-acid-green font-bold text-lg">#{order.id.substring(0, 10).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="font-sans font-bold text-lg">Rs. {order.total?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-3 py-1 text-xs font-bold uppercase border ${
                    order.status === 'Pending' ? 'text-yellow-500 border-yellow-500 bg-yellow-500/10' :
                    order.status === 'Shipped' ? 'text-blue-500 border-blue-500 bg-blue-500/10' :
                    order.status === 'Delivered' ? 'text-acid-green border-acid-green bg-acid-green/10' :
                    'text-red-500 border-red-500 bg-red-500/10'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-card-bg relative border border-gray-800 flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name_en} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-bold text-sm text-pure-white truncate uppercase">{item.name_en}</p>
                      <p className="text-xs text-gray-500">{item.size} • Qty: {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
