// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { DataProvider } from "@/components/context/DataContext";

export const metadata: Metadata = {
  title: "בקרת מכלולים",
  description: "Big Brother Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-[#050816] text-white">
        <DataProvider>
          {/* MOBILE: flex-col (sidebar on top), DESKTOP: flex-row (sidebar left) */}
          <div className="min-h-screen flex flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 min-h-screen overflow-x-hidden">
              {children}
            </main>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
