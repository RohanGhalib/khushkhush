"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DollarSign, ShoppingBag, Users, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    lowStock: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      let revenue = 0;
      let orderCount = 0;
      const recent: any[] = ordersData?.slice(0, 5) || [];

      (ordersData || []).forEach((order) => {
        revenue += Number(order.total) || 0;
        orderCount++;
      });

      const { count: userCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      const { data: productsData } = await supabase
        .from("products")
        .select("*");

      let lowStockCount = 0;
      (productsData || []).forEach((p) => {
        const stock = Number(p.stock) || 0;
        if (stock < 10) {
          lowStockCount++;
        }
      });

      setStats({
        revenue,
        orders: orderCount,
        users: userCount || 0,
        lowStock: lowStockCount
      });
      setRecentOrders(recent);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Revenue", value: `Rs. ${stats.revenue.toLocaleString()}`, icon: DollarSign, trend: "LAST 200 ORDERS" },
    { title: "Total Orders", value: stats.orders.toString(), icon: ShoppingBag, trend: "LAST 200" },
    { title: "Customers", value: stats.users.toString(), icon: Users, trend: "REGISTERED" },
    { title: "Low Stock Items", value: stats.lowStock.toString(), icon: AlertTriangle, trend: "< 10 UNITS", isAlert: stats.lowStock > 0 },
  ];

  return (
    <div className="p-8">
      <h1 className="font-twenly text-5xl text-pure-white mb-8 tracking-wide">DASHBOARD.</h1>

      {loading ? (
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-900 w-full" />
          <div className="h-64 bg-gray-900 w-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`bg-void-black p-6 border-2 ${stat.isAlert ? 'border-red-500 shadow-[4px_4px_0px_#EF4444]' : 'border-gray-800'} relative`}>
                  <div className="flex justify-between items-start mb-4">
                    <Icon size={24} className={stat.isAlert ? 'text-red-500' : 'text-acid-green'} />
                    <span className={`font-sans font-bold text-xs ${stat.isAlert ? 'text-red-500' : 'text-gray-500'}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-gray-400 uppercase text-sm mb-1">{stat.title}</h3>
                  <p className="font-twenly text-3xl text-pure-white">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-void-black border-2 border-gray-800 p-6">
            <h2 className="font-twenly text-2xl text-pure-white mb-6">RECENT ORDERS</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead className="text-gray-400 uppercase text-sm font-bold border-b border-gray-800">
                  <tr>
                    <th className="pb-4 pr-4">Order ID</th>
                    <th className="pb-4 px-4">Customer</th>
                    <th className="pb-4 px-4">Total</th>
                    <th className="pb-4 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-pure-white">
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-gray-500">No recent orders.</td></tr>
                  ) : (
                    recentOrders.map(order => (
                      <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 pr-4 font-mono text-gray-300">#{order.order_number || order.id.substring(0,8)}</td>
                        <td className="py-4 px-4 font-bold">{order.customer_name || "Guest"}</td>
                        <td className="py-4 px-4 text-acid-green font-bold">Rs. {order.total?.toLocaleString() || 0}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 text-xs font-bold uppercase border ${
                            order.order_status === 'Pending' ? 'text-yellow-500 border-yellow-500 bg-yellow-500/10' :
                            order.order_status === 'Shipped' ? 'text-blue-500 border-blue-500 bg-blue-500/10' :
                            order.order_status === 'Delivered' ? 'text-acid-green border-acid-green bg-acid-green/10' :
                            'text-red-500 border-red-500 bg-red-500/10'
                          }`}>
                            {order.order_status || order.status || 'Processing'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
