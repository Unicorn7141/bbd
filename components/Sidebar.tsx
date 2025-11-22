"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Settings } from "lucide-react";
import { useState } from "react";

const menu = [
  { label: "דאשבורד", icon: LayoutDashboard, href: "/" },
  { label: "הוספה/עדכון", icon: Settings, href: "/manage" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    // NOTE: on mobile -> full width bar on top
    //       on desktop -> fixed width sidebar on the left
    <aside className="bg-[#1a2332] text-white w-full md:w-64 md:h-screen md:flex md:flex-col border-r border-[#253041]">
      {/* MOBILE TOP BAR */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg bg-[#111827]"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <h1 className="text-lg font-bold">בקרת מכלולים</h1>
      </div>

      {/* CONTENT (DESKTOP: always visible, MOBILE: toggled) */}
      <div
        className={`
          ${open ? "flex" : "hidden"}
          md:flex
          flex-col items-center md:items-stretch gap-6
          px-4 pb-6
        `}
      >
        {/* Logo */}
        <div className="flex justify-center mt-2 mb-4">
          <Image
            src="/logo/logo.png"
            width={120}
            height={120}
            alt="Website Logo"
            className="rounded-full"
          />
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-2 w-full text-sm">
          {menu.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#222c3e] transition"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto w-full text-xs text-[#808191] text-center pt-4 border-t border-[#253041]">
          Version 1.0.6
        </div>
      </div>
    </aside>
  );
}
