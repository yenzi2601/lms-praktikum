import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

export const metadata = {
  title: "LMS Praktikum",
  description: "Sistem Manajemen Pembelajaran Praktis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
