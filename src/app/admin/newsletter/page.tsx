"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

interface Subscriber {
  id: string;
  email: string;
  createdAt: any;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "newsletter"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscriber));
      setSubscribers(data);
    } catch (error) {
      console.error("Error fetching subscribers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    try {
      await deleteDoc(doc(db, "newsletter", id));
      setSubscribers(subscribers.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting subscriber", error);
      alert("Failed to delete subscriber.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">Newsletter.</h1>
        <Button variant="outline" className="text-xs" onClick={fetchSubscribers}>REFRESH</Button>
      </div>

      <div className="bg-void-black border-2 border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="text-gray-400 uppercase text-sm font-bold border-b-2 border-gray-800 bg-gray-900/50">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-pure-white divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={2} className="p-8 text-center text-acid-green animate-pulse">LOADING...</td></tr>
              ) : subscribers.length === 0 ? (
                <tr><td colSpan={2} className="p-8 text-center text-gray-500">No subscribers found.</td></tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="p-4 font-mono font-bold text-gray-300">{sub.email}</td>
                    <td className="p-4 text-right space-x-2">
                      <Button variant="outline" className="text-xs py-1 h-auto px-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-pure-white" onClick={() => handleDelete(sub.id)}>
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
