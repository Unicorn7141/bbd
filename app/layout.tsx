import "@/app/globals.css";
import Sidebar from "@/components/Sidebar";
import { DataProvider } from "@/components/context/DataContext";

export const metadata = {
  title: "Big Brother Dashboard",
  icons: {
    icon: "public/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="rtl">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <body className="bg-[#0f1624] text-white flex">
        <DataProvider>
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </DataProvider>
      </body>
    </html>
  );
}
