"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

/**
 * Komponen pembungkus untuk proteksi halaman berdasarkan role.
 *
 * Contoh pemakaian:
 *   <RoleGuard allowedRoles={["dosen", "admin"]}>
 *     <HalamanUploadTugas />
 *   </RoleGuard>
 *
 * @param {string[]} allowedRoles  - Role yang boleh akses. Kosong = semua role boleh (asal login).
 * @param {string}   redirectTo    - Redirect ke mana jika tidak punya akses (default: "/login").
 */
export default function RoleGuard({
  children,
  allowedRoles = [],
  redirectTo   = "/login",
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Belum login → ke halaman login
    if (!user || !profile) {
      router.replace(redirectTo);
      return;
    }

    // Sudah login tapi role tidak diizinkan
    if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
      router.replace("/dashboard"); // redirect ke dashboard utama
    }
  }, [user, profile, loading, allowedRoles, redirectTo, router]);

  // Loading state
  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  // Role tidak cocok → jangan render apapun, useEffect sudah handle redirect
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}
