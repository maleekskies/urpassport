"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] min-h-screen">
      <div className="lg:hidden sticky top-0 z-[60] bg-navy text-white flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2 font-display font-bold text-sm">
          <span className="w-6.5 h-6.5 rounded-full bg-gold text-navy flex items-center justify-center font-mono text-[10px] font-bold">
            UP
          </span>
          UrPassport NG
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center"
        >
          ☰
        </button>
      </div>

      <Sidebar userName={userName} userEmail={userEmail} open={open} onClose={() => setOpen(false)} />

      <main className="p-6 lg:p-10 max-w-[1180px]">{children}</main>
    </div>
  );
}
