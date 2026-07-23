"use client";

import { useAuthStore } from "@/lib/authStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

import { getUserProfile } from "@/lib/firestore";
import { useEffect, useState } from "react";

export default function AccountProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      getUserProfile(user.id).then(setProfile);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "N/A";

  return (
    <div>
      <h2 className="font-twenly text-3xl text-acid-green mb-8 uppercase tracking-wide border-b-2 border-gray-800 pb-4">
        Profile Info.
      </h2>

      <div className="flex flex-col gap-6 max-w-lg">
        <div>
          <p className="text-gray-400 font-sans font-bold uppercase text-sm mb-1">Name</p>
          <p className="text-pure-white font-sans text-xl font-medium">{displayName}</p>
        </div>
        
        <div>
          <p className="text-gray-400 font-sans font-bold uppercase text-sm mb-1">Email</p>
          <p className="text-pure-white font-sans text-xl font-medium">{user?.email}</p>
        </div>

        {profile?.phone && (
          <div>
            <p className="text-gray-400 font-sans font-bold uppercase text-sm mb-1">Phone</p>
            <p className="text-pure-white font-sans text-xl font-medium">{profile.phone}</p>
          </div>
        )}

        {profile?.address && (
          <div>
            <p className="text-gray-400 font-sans font-bold uppercase text-sm mb-1">Saved Shipping Address</p>
            <p className="text-pure-white font-sans text-lg font-medium">{profile.address}</p>
            <p className="text-gray-400 font-sans text-sm">{profile.city} {profile.postalCode}</p>
          </div>
        )}

        <div className="mt-8 pt-8 border-t-2 border-gray-800">
          <Button variant="outline" onClick={handleLogout} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-pure-white hover:border-red-500">
            SIGN OUT
          </Button>
        </div>
      </div>
    </div>
  );
}
