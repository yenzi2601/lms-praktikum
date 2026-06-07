import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { getUserProfile } from "./firestore";

const provider = new GoogleAuthProvider();

/**
 * Login dengan Google.
 * Setelah berhasil, cek apakah user sudah terdaftar di Firestore.
 * Jika belum terdaftar (belum ditambah admin), lempar error.
 */
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user   = result.user;

  const profile = await getUserProfile(user.uid);

  if (!profile) {
    // User login Google tapi belum didaftarkan admin
    await signOut(auth);
    throw new Error("Akun kamu belum terdaftar. Hubungi admin untuk mendaftarkan akun.");
  }

  return { user, profile };
}

/**
 * Logout dari Firebase Auth.
 */
export async function logout() {
  await signOut(auth);
}
