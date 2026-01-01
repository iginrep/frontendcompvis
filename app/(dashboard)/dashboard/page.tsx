"use client";

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

interface JadwalMengajar {
  nama_mk: string;
  waktu_mulai: string;
  waktu_selesai: string;
  class_id: string;
}

interface UserInfo {
  id: string;
  nama: string;
  akun_upi: string;
  jabatan: string;
  jadwal_mengajar: JadwalMengajar[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [classNames, setClassNames] = useState<Record<string, string>>({});

  useEffect(() => {
    // Ambil user info dari localStorage
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    // fetch class names for user's schedule if available
    if (!user || !user.jadwal_mengajar) return;
    const ids = Array.from(new Set(user.jadwal_mengajar.map((j) => j.class_id).filter(Boolean)));
    if (ids.length === 0) return;

    const fetchName = async (id: string) => {
      const base = "http://localhost:8000";
      try {
        const res = await fetch(`${base}/class/${id}`);
        if (res.ok) {
          const data = await res.json();
          return data.no_kelas || data.no_kelas?.toString?.() || data.name || data.class_name || data.nama_kelas || data.nama || data.title || null;
        }
      } catch (e) {
        // fallthrough to fallback
      }

      // Fallback: some backends don't expose GET /class/{id} — fetch list and match by _id
      try {
        const listRes = await fetch(`${base}/class`);
        if (!listRes.ok) return null;
        const list = await listRes.json();
        if (!Array.isArray(list)) return null;
        const found = list.find((c: any) => {
          if (!c) return false;
          let cid: any = c._id ?? c.id;
          if (cid && typeof cid === "object") cid = cid.$oid ?? cid.toString();
          return String(cid) === String(id);
        });
        if (!found) return null;
        return found.no_kelas || found.no_kelas?.toString?.() || found.name || found.class_name || found.nama_kelas || found.nama || found.title || null;
      } catch (e) {
        return null;
      }
    };

    (async () => {
      const map: Record<string, string> = {};
      await Promise.all(ids.map(async (id) => {
        const name = await fetchName(id);
        if (name) map[id] = name;
      }));
      setClassNames(map);
    })();
  }, [user]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          {user ? `Welcome, ${user.nama}` : "Welcome"}
        </h1>
        <p className="text-slate-500 font-medium">Current Date: Januari, 2026</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center text-slate-800">Your Subjects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user && user.jadwal_mengajar && user.jadwal_mengajar.length > 0 ? (
            user.jadwal_mengajar.map((mk, idx) => (
              <StatCard
                key={mk.class_id || idx}
                title={mk.nama_mk}
                subtitle={
                  <span className="text-sm text-slate-500">
                    Kelas <span className="font-semibold text-slate-700">
                      {classNames[mk.class_id] || mk.class_id}
                    </span>
                  </span>
                }
                value={`${mk.waktu_mulai} - ${mk.waktu_selesai}`}
                icon={<BookOpen className="h-6 w-6 text-blue-600" />}
              />
            ))
          ) : (
            <div className="col-span-2 text-center text-slate-400">No subjects found.</div>
          )}
        </div>
      </div>

      <footer className="pt-24 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400 border-t border-slate-200">
        <p>© 2026 UPI. All rights reserved.</p>
        <p>
          For assistance, contact <span className="text-slate-600 font-medium">support@upi.edu</span>
        </p>
      </footer>
    </div>
  )
}


function StatCard({
  title,
  subtitle,
  value,
  icon,
  status,
}: { title: string; subtitle?: React.ReactNode; value: string; icon: React.ReactNode; status?: "success" }) {
  return (
    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span
          className={cn(
            "text-2xl font-bold tracking-tight",
            status === "success" ? "text-emerald-600" : "text-slate-900",
          )}
        >
          {value}
        </span>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </CardContent>
    </Card>
  )
}

import { cn } from "@/lib/utils"
