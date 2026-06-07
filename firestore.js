import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Konstanta Role ──────────────────────────────────────────────
export const ROLES = {
  ADMIN:      "admin",
  DOSEN:      "dosen",
  MAHASISWA:  "mahasiswa",
};

// ─── User Profile ────────────────────────────────────────────────

/**
 * Ambil profil user berdasarkan UID Firebase Auth.
 * Return null jika belum terdaftar.
 */
export async function getUserProfile(uid) {
  const ref  = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Buat akun user baru (hanya dipanggil oleh admin).
 * @param {string} uid       - UID Firebase Auth (dari email yang sudah diketahui)
 * @param {object} data      - { nama, email, role, jurusanId, npm|nip }
 */
export async function createUserProfile(uid, data) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update profil user.
 */
export async function updateUserProfile(uid, data) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Ambil semua user (untuk halaman kelola user admin).
 * Bisa difilter berdasarkan role atau jurusan.
 */
export async function getAllUsers({ role, jurusanId } = {}) {
  let q = collection(db, "users");

  if (role)      q = query(q, where("role", "==", role));
  if (jurusanId) q = query(q, where("jurusanId", "==", jurusanId));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Jurusan ─────────────────────────────────────────────────────

export async function getAllJurusan() {
  const snap = await getDocs(collection(db, "jurusan"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Mata Kuliah ─────────────────────────────────────────────────

export async function getMatkulByJurusan(jurusanId) {
  const q    = query(collection(db, "matkul"), where("jurusanId", "==", jurusanId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getMatkulByDosen(dosenId) {
  const q    = query(collection(db, "matkul"), where("dosenId", "==", dosenId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
