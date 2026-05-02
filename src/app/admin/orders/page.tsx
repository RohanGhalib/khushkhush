"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

interface Order {
  id: string;
  customerInfo: { fullName: string; email: string; phone: string; address: string; city: string };
  total: number;
  status: string;
  createdAt: any;
  items: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

      // Trigger Status Update Email
      fetch("/api/emails/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          customerEmail: order.customerInfo.email,
          customerName: order.customerInfo.fullName,
          status: newStatus,
        }),
      }).catch(console.error);
    } catch (error) {
      console.error("Error updating status", error);
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">Orders.</h1>
        <Button onClick={fetchOrders} variant="outline" className="text-xs py-1 h-auto">REFRESH</Button>
      </div>

      <div className="bg-void-black border-2 border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="text-gray-400 uppercase text-sm font-bold border-b-2 border-gray-800 bg-gray-900/50">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-pure-white divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-acid-green animate-pulse">LOADING ORDERS...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="p-4 font-mono text-gray-300">#{order.id.substring(0,8)}</td>
                    <td className="p-4">
                      <p className="font-bold">{order.customerInfo.fullName}</p>
                      <p className="text-xs text-gray-400">{order.customerInfo.city} - {order.customerInfo.phone}</p>
                    </td>
                    <td className="p-4">
                      {order.items.length} items
                    </td>
                    <td className="p-4 font-bold text-acid-green">Rs. {order.total.toLocaleString()}</td>
                    <td className="p-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`bg-void-black border px-2 py-1 text-xs font-bold uppercase ${
                          order.status === 'Pending' ? 'text-yellow-500 border-yellow-500' :
                          order.status === 'Shipped' ? 'text-blue-500 border-blue-500' :
                          order.status === 'Delivered' ? 'text-acid-green border-acid-green' :
                          'text-red-500 border-red-500'
                        }`}
                      >
                        <option value="Pending" className="text-pure-white">Pending</option>
                        <option value="Shipped" className="text-pure-white">Shipped</option>
                        <option value="Delivered" className="text-pure-white">Delivered</option>
                        <option value="Cancelled" className="text-pure-white">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" className="text-xs py-1 h-auto px-2 border-gray-600 text-gray-400 hover:text-pure-white">
                        VIEW
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
