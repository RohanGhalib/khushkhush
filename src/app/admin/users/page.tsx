"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_admin?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (user: User) => {
    const newIsAdmin = !user.is_admin;
    const newRole = newIsAdmin ? "admin" : "user";

    try {
      const { error } = await supabase
        .from("users")
        .update({ is_admin: newIsAdmin, role: newRole })
        .eq("id", user.id);

      if (error) throw error;

      setUsers(users.map(u => u.id === user.id ? { ...u, is_admin: newIsAdmin, role: newRole } : u));
    } catch (error: any) {
      console.error("Error updating user role:", error);
      alert("Failed to update role: " + (error.message || "Unknown error"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user profile?")) return;
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error("Error deleting user", error);
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">Users.</h1>
      </div>

      <div className="bg-void-black border-2 border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="text-gray-400 uppercase text-sm font-bold border-b-2 border-gray-800 bg-gray-900/50">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-pure-white divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-acid-green animate-pulse">LOADING...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="p-4 font-bold">{user.name}</td>
                    <td className="p-4 text-gray-400">{user.email}</td>
                    <td className="p-4 text-gray-400">{user.phone || "-"}</td>
                    <td className="p-4 uppercase text-xs font-bold text-acid-green">
                      {user.is_admin || user.role === "admin" ? "ADMIN" : user.role || "user"}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button 
                        variant="outline" 
                        className={`text-xs py-1 h-auto px-2 ${user.is_admin ? 'border-yellow-500 text-yellow-500' : 'border-acid-green text-acid-green'}`} 
                        onClick={() => toggleAdminRole(user)}
                      >
                        {user.is_admin ? "REVOKE ADMIN" : "MAKE ADMIN"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-xs py-1 h-auto px-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-pure-white" 
                        onClick={() => handleDelete(user.id)}
                      >
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
