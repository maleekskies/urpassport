"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◆", group: "Overview" },
  { href: "/dashboard/passport", label: "Passport Hub", icon: "▤", group: "My Journey" },
  { href: "/dashboard/visa", label: "Visa Assistant", icon: "▤", group: "My Journey" },
  { href: "/dashboard/documents", label: "My Documents", icon: "▥", group: "My Journey" },
  { href: "/dashboard/flights", label: "Flights", icon: "✈", group: "My Journey" },
  { href: "/dashboard/planner", label: "AI Trip Planner", icon: "✦", group: "My Journey" },
  { href: "/dashboard/family", label: "Family", icon: "◈", group: "My Journey" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙", group: "Account" },
];

export function Sidebar({
  userName,
  userEmail,
  open,
  onClose,
}: {
  userName: string;
  userEmail: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const groups = ["Overview", "My Journey", "Account"];
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-navy/55 z-[69] lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`bg-navy text-[#EDEFE6] p-6 flex flex-col fixed lg:sticky top-0 left-0 h-screen w-[270px] z-[70]
        transition-transform duration-250 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <button
          onClick={onClose}
          className="lg:hidden absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
        >
          ✕
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5 font-display font-bold text-lg mb-10 px-1.5">
          <span className="w-7 h-7 rounded-full bg-gold text-navy flex items-center justify-center font-mono text-[11px] font-bold">
            UP
          </span>
          UrPassport NG
        </Link>

        {groups.map((group) => (
          <div key={group} className="mb-6">
            <div className="font-mono text-[10px] tracking-widest uppercase text-[#7C8AA0] px-3 pb-2.5">
              {group}
            </div>
            {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium mb-0.5 transition-colors
                  ${active ? "bg-navy-soft text-white border-l-2 border-gold pl-2.5" : "text-[#C7CEDD] hover:bg-white/5 hover:text-white"}`}
                >
                  <span className="w-4.5 text-center text-sm">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
            {group === "Account" && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[#C7CEDD] hover:bg-white/5 hover:text-white transition-colors"
              >
                <span className="w-4.5 text-center text-sm">⏻</span>
                Log Out
              </button>
            )}
          </div>
        ))}

        <div className="mt-auto pt-5 border-t border-white/10">
          <Link href="/dashboard/settings" className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-gold-soft text-navy flex items-center justify-center font-display font-bold text-xs">
              {initials || "?"}
            </div>
            <div className="text-sm">
              <div className="text-white font-semibold">{userName}</div>
              <div className="text-[#8A96AA] text-xs">{userEmail}</div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
