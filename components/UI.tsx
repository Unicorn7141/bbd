"use client";

import React from "react";
import {
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  Archive,
  FileText,
  X,
  LucideIcon,
} from "lucide-react";

export const THEME = {
  bgMain: "bg-[#1F2128]",
  bgCard: "bg-[#242731]",
  bgSidebar: "bg-white",
  textMain: "text-white",
  textMuted: "text-[#808191]",
  textSidebar: "text-[#5F6165]",
  textSidebarActive: "text-[#0096FF]",
  accentBlue: "#0096FF",
  accentPurple: "#6C5DD3",
  accentCyan: "#00D9D9",
  accentOrange: "#FF754B",
};

export const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case "usable":
      return <CheckCircle className="w-5 h-5 text-[#0096FF]" />;
    case "faulty":
      return <XCircle className="w-5 h-5 text-[#FF754B]" />;
    case "in-process":
      return <Activity className="w-5 h-5 text-[#6C5DD3]" />;
    case "returned":
      return <Clock className="w-5 h-5 text-[#808191]" />;
    case "closed":
      return <Archive className="w-5 h-5 text-[#808191]" />;
    default:
      return <FileText className="w-5 h-5 text-[#808191]" />;
  }
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`${THEME.bgCard} p-6 rounded-3xl shadow-sm ${className}`}>
    {children}
  </div>
);

export const IconButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-2xl bg-[#6C5DD3] text-white hover:bg-[#5a4cb8] transition duration-150 shadow-lg flex items-center justify-center font-medium ${className}`}
  >
    {children}
  </button>
);

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={`${THEME.bgCard} max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl transform transition-all border border-[#2F333F]`}
        >
          <div className="flex justify-between items-center p-6 border-b border-[#2F333F]">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-[#808191] hover:text-white transition"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
          <div className="p-6 text-white">{children}</div>
        </div>
      </div>
    </div>
  );
};

export const CircularProgress: React.FC<{
  value: number;
  label: string;
  subLabel: string;
  color: string;
}> = ({ value, label, subLabel, color }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const progressOffset =
    circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#2F333F"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-xs text-[#808191]">יח'</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-white font-semibold">{label}</p>
        <p className="text-[#808191] text-xs">{subLabel}</p>
      </div>
    </div>
  );
};
