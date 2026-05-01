"use client";

import { useAuthStore } from "@/lib/authStore";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/Button";

export default function AccountProfilePage() {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      <h2 className="font-twenly text-3xl text-acid-green mb-8 uppercase tracking-wide border-b-2 border-gray-800 pb-4">
        Profile Info.
      </h2>

      <div className="flex flex-col gap-6 max-w-lg">
        <div>
          <p className="text-gray-400 font-sans font-bold uppercase text-sm mb-1">Name</p>
          <p className="text-pure-white font-sans text-xl font-medium">{user?.displayName || "N/A"}</p>
        </div>
        
        <div>
          <p className="text-gray-400 font-sans font-bold uppercase text-sm mb-1">Email</p>
          <p className="text-pure-white font-sans text-xl font-medium">{user?.email}</p>
        </div>

        <div className="mt-8 pt-8 border-t-2 border-gray-800">
          <Button variant="outline" onClick={handleLogout} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-pure-white hover:border-red-500">
            SIGN OUT
          </Button>
        </div>
      </div>
    </div>
  );
}
