"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile, getAllUsers, getAllJurusan, ROLES } from "@/lib/firestore";
import RoleGuard from "@/components/RoleGuard";

export default function KelolaUserPage() {
  const [users,    setUsers]    = useState([]);
  const [jurusan,  setJurusan]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");

  const [form, setForm] = useState({
    nama: "", email: "", role: "mahasiswa",
    jurusanId: "", nim: "", nip: "",
  });

  useEffect(() => {
    getAllUsers().then(setUsers);
    getAllJurusan().then(setJurusan);
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Buat akun di Firebase Auth dengan password sementara
      // User bisa reset password sendiri lewat Google login
      const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
      const cred = await createUserWithEmailAndPassword(auth, form.email, tempPassword);

      // Simpan profil ke Firestore
      await createUserProfile(cred.user.uid, {
        nama:      form.nama,
        email:     form.email,
        role:      form.role,
        jurusanId: form.jurusanId,
        ...(form.role === "mahasiswa" ? { nim: form.nim } : { nip: form.nip }),
      });

      setSuccess(`Akun berhasil dibuat untuk ${form.nama}.`);
      setForm({ nama: "", email: "", role: "mahasiswa", jurusanId: "", nim: "", nip: "" });

      // Refresh daftar user
      const updated = await getAllUsers();
      setUsers(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Kelola User</h1>
        <p className="text-slate-500 text-sm mb-6">Tambah akun mahasiswa, dosen, atau admin baru.</p>

        {/* Form tambah user */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-slate-700 mb-4">Tambah User Baru</h2>

          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
          {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nama Lengkap</label>
              <input name="nama" value={form.nama} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Budi Santoso" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email (Google)</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="nama@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="mahasiswa">Mahasiswa</option>
                <option value="dosen">Dosen</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Jurusan</label>
              <select name="jurusanId" value={form.jurusanId} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Pilih Jurusan --</option>
                {jurusan.map((j) => (
                  <option key={j.id} value={j.id}>{j.nama}</option>
                ))}
              </select>
            </div>
            {form.role === "mahasiswa" && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">NIM</label>
                <input name="nim" value={form.nim} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 2021001234" />
              </div>
            )}
            {(form.role === "dosen" || form.role === "admin") && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">NIP</label>
                <input name="nip" value={form.nip} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 198501012010011001" />
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !form.nama || !form.email || !form.jurusanId}
            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            {loading ? "Menyimpan..." : "Tambah User"}
          </button>
        </div>

        {/* Tabel daftar user */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">Daftar User ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Nama</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">NIM/NIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{u.nama}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === "admin"     ? "bg-purple-100 text-purple-700" :
                        u.role === "dosen"     ? "bg-emerald-100 text-emerald-700" :
                                                 "bg-blue-100 text-blue-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.nim ?? u.nip ?? "—"}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada user.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
