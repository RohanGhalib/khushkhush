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

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerInfo.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.createdAt?.seconds - a.createdAt?.seconds;
      if (sortBy === "oldest") return a.createdAt?.seconds - b.createdAt?.seconds;
      if (sortBy === "total-high") return b.total - a.total;
      if (sortBy === "total-low") return a.total - b.total;
      return 0;
    });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      showNotification(`Updating order #${orderId.substring(0, 8)}...`, "success");
      
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

      showNotification(`Order #${orderId.substring(0, 8)} updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status", error);
      showNotification("Failed to update status", "error");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, statusFilter]);

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
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">Orders.</h1>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search Order / Name / Email" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-void-black border-2 border-gray-800 text-pure-white px-4 py-2 font-sans text-sm focus:border-acid-green outline-none w-full sm:w-64"
          />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-void-black border-2 border-gray-800 text-pure-white px-4 py-2 font-sans text-sm focus:border-acid-green outline-none"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-void-black border-2 border-gray-800 text-pure-white px-4 py-2 font-sans text-sm focus:border-acid-green outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="total-high">Price: High to Low</option>
            <option value="total-low">Price: Low to High</option>
          </select>
          <Button onClick={fetchOrders} variant="outline" className="text-xs py-2 h-auto">REFRESH</Button>
        </div>
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
              ) : paginatedOrders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders match your search.</td></tr>
              ) : (
                paginatedOrders.map((order) => (
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
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs py-1 h-auto px-2 border-gray-600 text-gray-400 hover:text-pure-white"
                      >
                        VIEW
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void-black/80 backdrop-blur-sm">
          <div className="bg-void-black border-4 border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto brutalist-border-green shadow-[10px_10px_0px_#C8FF00]">
            <div className="p-6 border-b-2 border-gray-800 flex justify-between items-center sticky top-0 bg-void-black z-10">
              <h2 className="font-twenly text-2xl text-pure-white uppercase">Order Details.</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-acid-green font-bold uppercase text-xs">CLOSE [X]</button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-bold text-acid-green uppercase mb-4 tracking-widest">Customer Info</h3>
                  <div className="space-y-2 text-pure-white font-sans">
                    <p className="text-xl font-bold">{selectedOrder.customerInfo.fullName}</p>
                    <p className="text-gray-400">{selectedOrder.customerInfo.email}</p>
                    <p className="text-gray-400">{selectedOrder.customerInfo.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-acid-green uppercase mb-4 tracking-widest">Shipping Address</h3>
                  <div className="space-y-2 text-pure-white font-sans">
                    <p>{selectedOrder.customerInfo.address}</p>
                    <p className="font-bold">{selectedOrder.customerInfo.city}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-acid-green uppercase mb-4 tracking-widest">Items ({selectedOrder.items.length})</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-gray-900/30 p-4 border border-gray-800">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-gray-800 border border-gray-700 flex-shrink-0">
                          {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-bold uppercase text-sm">{item.name_en}</p>
                          <p className="text-xs text-gray-500">{item.size} × {item.qty}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">Rs. {(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t-2 border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="w-full md:w-auto">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-acid-green">Rs. {selectedOrder.total.toLocaleString()}</p>
                </div>
                <div className="w-full md:w-auto text-left md:text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Update Order Status</p>
                  <div className="flex gap-2">
                    <select 
                      id="modal-status-select"
                      defaultValue={selectedOrder.status}
                      className="bg-void-black border-2 border-gray-800 text-pure-white px-3 py-2 text-xs font-bold uppercase outline-none focus:border-acid-green"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <Button 
                      variant="primary" 
                      className="text-[10px] py-1 px-3 h-auto"
                      onClick={() => {
                        const newStatus = (document.getElementById('modal-status-select') as HTMLSelectElement).value;
                        updateStatus(selectedOrder.id, newStatus);
                        setSelectedOrder({ ...selectedOrder, status: newStatus });
                      }}
                    >
                      UPDATE STATUS
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
