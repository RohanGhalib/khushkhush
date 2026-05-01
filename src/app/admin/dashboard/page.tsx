"use client";

import { DollarSign, ShoppingBag, Users, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Revenue", value: "Rs. 245,000", icon: DollarSign, trend: "+12%" },
    { title: "Orders Today", value: "34", icon: ShoppingBag, trend: "+5%" },
    { title: "Subscribers", value: "1,204", icon: Users, trend: "+18%" },
    { title: "Low Stock Items", value: "7", icon: AlertTriangle, trend: "-2%", isAlert: true },
  ];

  return (
    <div className="p-8">
      <h1 className="font-twenly text-5xl text-pure-white mb-8 tracking-wide">DASHBOARD.</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-void-black p-6 border-2 ${stat.isAlert ? 'border-red-500' : 'border-gray-800'} relative`}>
              <div className="flex justify-between items-start mb-4">
                <Icon size={24} className={stat.isAlert ? 'text-red-500' : 'text-acid-green'} />
                <span className={`font-sans font-bold text-sm ${stat.isAlert ? 'text-red-500' : 'text-acid-green'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="font-sans font-bold text-gray-400 uppercase text-sm mb-1">{stat.title}</h3>
              <p className="font-twenly text-3xl text-pure-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Placeholder */}
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
                <th className="pb-4 pl-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="text-pure-white">
              <tr className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                <td className="py-4 pr-4 font-mono text-gray-300">#ORD-9021</td>
                <td className="py-4 px-4 font-bold">Ahmad Khan</td>
                <td className="py-4 px-4 text-acid-green font-bold">Rs. 4,500</td>
                <td className="py-4 px-4">
                  <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 text-xs font-bold uppercase border border-yellow-500">Pending</span>
                </td>
                <td className="py-4 pl-4 text-right text-gray-400 text-sm">Today, 2:30 PM</td>
              </tr>
              <tr className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                <td className="py-4 pr-4 font-mono text-gray-300">#ORD-9020</td>
                <td className="py-4 px-4 font-bold">Fatima Ali</td>
                <td className="py-4 px-4 text-acid-green font-bold">Rs. 8,200</td>
                <td className="py-4 px-4">
                  <span className="bg-acid-green/20 text-acid-green px-2 py-1 text-xs font-bold uppercase border border-acid-green">Shipped</span>
                </td>
                <td className="py-4 pl-4 text-right text-gray-400 text-sm">Today, 11:15 AM</td>
              </tr>
              <tr className="hover:bg-gray-800/20 transition-colors">
                <td className="py-4 pr-4 font-mono text-gray-300">#ORD-9019</td>
                <td className="py-4 px-4 font-bold">Zainab Shah</td>
                <td className="py-4 px-4 text-acid-green font-bold">Rs. 3,000</td>
                <td className="py-4 px-4">
                  <span className="bg-gray-500/20 text-gray-400 px-2 py-1 text-xs font-bold uppercase border border-gray-500">Delivered</span>
                </td>
                <td className="py-4 pl-4 text-right text-gray-400 text-sm">Yesterday</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
