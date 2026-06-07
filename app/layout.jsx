"use client";

import { useAuth } from "@/lib/AuthContext";
import { logout } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import Link from "next/link";

// ─── Menu berdasarkan role ────────────────────────────────────────
const menus = {
  mahasiswa: [
    { label: "Dashboard",   href: "/dashboard",           icon: "🏠" },
    { label: "Mata Kuliah", href: "/dashboard/matkul",    icon: "📚" },
    { label: "Tugas",       href: "/dashboard/tugas",     icon: "📝" },
    { label: "Absensi",     href: "/dashboard/absensi",   icon: "✅" },
    { label: "Diskusi",     href: "/dashboard/diskusi",   icon: "💬" },
  ],
  dosen: [
    { label: "Dashboard",    href: "/dashboard",                  icon: "🏠" },
    { label: "Mata Kuliah",  href: "/dashboard/matkul",           icon: "📚" },
    { label: "Upload Tugas", href: "/dashboard/upload-tugas",     icon: "📤" },
    { label: "Absensi",      href: "/dashboard/absensi",          icon: "✅" },
    { label: "Diskusi",      href: "/dashboard/diskusi",          icon: "💬" },
    { label: "Hasil Data",   href: "/dashboard/hasil",            icon: "📊" },
  ],
  admin: [
    { label: "Dashboard",    href: "/dashboard",                  icon: "🏠" },
    { label: "Kelola User",  href: "/admin/kelola-user",          icon: "👥" },
    { label: "Mata Kuliah",  href: "/dashboard/matkul",           icon: "📚" },
    { label: "Upload Tugas", href: "/dashboard/upload-tugas",     icon: "📤" },
    { label: "Absensi",      href: "/dashboard/absensi",          icon: "✅" },
    { label: "Hasil Data",   href: "/dashboard/hasil",            icon: "📊" },
  ],
};

const roleBadge = {
  mahasiswa: "bg-blue-100 text-blue-700",
  dosen:     "bg-emerald-100 text-emerald-700",
  admin:     "bg-purple-100 text-purple-700",
};

function Sidebar({ profile, pathname }) {
  const router  = useRouter();
  const navMenu = menus[profile?.role] ?? [];

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-sm font-bold shrink-0">
            LMS
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">LMS Praktikum</p>
            <p className="text-xs text-slate-400">Sistem Akademik</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">
              {profile?.nama?.[0] ?? "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{profile?.nama ?? "Pengguna"}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[profile?.role] ?? ""}`}>
              {profile?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navMenu.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }) {
  const { profile } = useAuth();
  const pathname    = usePathname();

  return (
    <RoleGuard allowedRoles={["mahasiswa", "dosen", "admin"]}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar profile={profile} pathname={pathname} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
