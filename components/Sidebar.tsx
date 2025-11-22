"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, History, UserCog, Settings } from "lucide-react";

const menu = [
  { label: "דאשברוד", icon: LayoutDashboard, href: "/" },
  // { label: "History", icon: History, href: "/history" },
  { label: "הוספה/עדכון", icon: Settings, href: "/manage" },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#1a2332] h-screen p-6 flex flex-col border-r border-[#253041]">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image
          src="/logo/logo.png"
          width={80}
          height={80}
          alt="Website Logo"
          className="rounded-full"
        />
      </div>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#222c3e] transition"
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <label>Version 1.0.0</label>
      </div>
    </div>
  );
}
