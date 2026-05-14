import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, LogOut, Settings, Bell, Shield, Heart } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="px-6 pt-12 pb-12 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting
  }

  return (
    <div className="px-6 pt-12 pb-12">
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-[2rem] bg-green-100 flex items-center justify-center mb-4 text-green-600 shadow-inner">
          <User size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{user.email || "Farmer"}</h2>
        <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-bold">Verified Professional</p>
      </div>

      <div className="space-y-3">
        {[
          { icon: Bell, label: "Notifications", color: "text-blue-500" },
          { icon: Shield, label: "Security & Privacy", color: "text-indigo-500" },
          { icon: Heart, label: "My Crops", color: "text-rose-500" },
          { icon: Settings, label: "App Settings", color: "text-gray-500" },
        ].map((item, idx) => (
          <button
            key={idx}
            className="w-full p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group active:scale-98 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={item.color}>
                <item.icon size={20} />
              </div>
              <span className="font-semibold text-gray-700">{item.label}</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-green-500 transition-colors">
              <Settings size={12} />
            </div>
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="w-full mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-all"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-loose">
          AgroShield AI v2.0.4<br/>Precision Agriculture Initiative
        </p>
      </div>
    </div>
  );
}
