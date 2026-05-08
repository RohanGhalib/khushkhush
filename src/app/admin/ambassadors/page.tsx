"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

interface AmbassadorApplication {
  id: string;
  name: string;
  email: string;
  instagram: string;
  college: string;
  status: "pending" | "active" | "rejected";
  userId?: string | null;
  referralCode?: string | null;
  createdAt?: any;
}

interface CollegeStat {
  college: string;
  total: number;
}

const generateReferralCode = (name: string, email: string) => {
  const base = (email.split("@")[0] || name || "KHUSH").replace(/[^a-zA-Z0-9]/g, "").slice(0, 4);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `KK-${base.toUpperCase()}-${suffix}`;
};

export default function AdminAmbassadorsPage() {
  const [applications, setApplications] = useState<AmbassadorApplication[]>([]);
  const [leaderboard, setLeaderboard] = useState<CollegeStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsSnap, referralsSnap] = await Promise.all([
        getDocs(query(collection(db, "ambassadorApplications"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "referrals")),
      ]);

      const apps = appsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as AmbassadorApplication[];
      setApplications(apps);

      const totals = new Map<string, number>();
      referralsSnap.forEach((refDoc) => {
        const data = refDoc.data();
        const college = data.college || "UNKNOWN";
        const amount = data.amountAddedToVault || 0;
        totals.set(college, (totals.get(college) || 0) + amount);
      });

      const leaderboardData = Array.from(totals.entries())
        .map(([college, total]) => ({ college, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching ambassadors:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRecords = async (application: AmbassadorApplication, status: "active" | "rejected", referralCode?: string) => {
    const payload = {
      role: status === "active" ? "ambassador" : "user",
      ambassadorStatus: status,
      college: application.college,
      referralCode: status === "active" ? referralCode || "" : "",
      updatedAt: serverTimestamp(),
    };

    if (application.userId) {
      await setDoc(doc(db, "users", String(application.userId)), payload, { merge: true });
      return;
    }

    const userQuery = query(collection(db, "users"), where("email", "==", application.email));
    const userSnap = await getDocs(userQuery);
    if (userSnap.size !== 1) {
      console.warn("Ambassador email lookup mismatch:", application.email, userSnap.size);
      return;
    }
    await setDoc(userSnap.docs[0].ref, payload, { merge: true });
  };

  const handleStatus = async (application: AmbassadorApplication, status: "active" | "rejected") => {
    setWorkingId(application.id);
    try {
      const referralCode =
        status === "active"
          ? application.referralCode || generateReferralCode(application.name, application.email)
          : null;

      await updateDoc(doc(db, "ambassadorApplications", application.id), {
        status,
        referralCode: referralCode || null,
        updatedAt: serverTimestamp(),
      });

      await updateUserRecords(application, status, referralCode || undefined);

      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id ? { ...app, status, referralCode: referralCode || null } : app
        )
      );
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b-2 border-gray-800 pb-6">
        <div>
          <h1 className="font-twenly text-4xl text-pure-white tracking-wide uppercase">AMBASSADORS.</h1>
          <p className="font-urdu text-lg text-acid-green mt-1">یہ کون ہیں؟</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="text-xs py-2 h-auto">
          REFRESH
        </Button>
      </div>

      <div className="bg-void-black border-2 border-gray-800 mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="text-gray-400 uppercase text-sm font-bold border-b-2 border-gray-800 bg-gray-900/50">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">College</th>
                <th className="p-4">Status</th>
                <th className="p-4">Code</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-pure-white divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-acid-green animate-pulse">
                    LOADING...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No applications.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="p-4 font-bold">{app.name}</td>
                    <td className="p-4 text-gray-400">{app.email}</td>
                    <td className="p-4 text-gray-400">{app.college}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold uppercase border ${
                          app.status === "active"
                            ? "text-acid-green border-acid-green"
                            : app.status === "rejected"
                              ? "text-red-500 border-red-500"
                              : "text-yellow-500 border-yellow-500"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-acid-green">
                      {app.referralCode || "--"}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        className="text-xs py-1 h-auto px-3 border-acid-green text-acid-green hover:bg-acid-green hover:text-void-black"
                        onClick={() => handleStatus(app, "active")}
                        disabled={workingId === app.id}
                      >
                        IN
                      </Button>
                      <Button
                        variant="outline"
                        className="text-xs py-1 h-auto px-3 border-red-500 text-red-500 hover:bg-red-500 hover:text-pure-white"
                        onClick={() => handleStatus(app, "rejected")}
                        disabled={workingId === app.id}
                      >
                        OUT
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-void-black border-2 border-gray-800 p-6">
        <h2 className="font-twenly text-2xl text-pure-white mb-4 uppercase">COLLEGE LEADERBOARD</h2>
        {leaderboard.length === 0 ? (
          <p className="text-gray-500 text-sm uppercase">No vault funds yet.</p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div key={entry.college} className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                  <span className="font-sans font-bold uppercase text-pure-white">{entry.college}</span>
                </div>
                <span className="font-twenly text-acid-green">Rs. {entry.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
