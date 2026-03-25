"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, LogOut, Upload } from "lucide-react";

import { signOut } from "./actions";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/library", label: "Library", icon: BookOpen },
  { href: "/dashboard/upload", label: "My Documents", icon: Upload },
] as const;

export function DashboardSidebarContent({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="border-b-2 border-white/20 px-5 py-6">
        <Link href="/dashboard" className="block">
          <span className="text-lg font-black uppercase leading-tight tracking-tight text-white sm:text-xl">
            Commercial Awareness
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Navigate</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/dashboard/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-sm font-bold uppercase transition-colors duration-200 ${
                isActive
                  ? "border-black bg-[#FACC15] text-black"
                  : "border-transparent text-gray-300 hover:border-white hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t-2 border-white/20 p-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Account</p>
        <p className="truncate text-xs text-gray-300" title={email}>
          {email}
        </p>
      </div>

      <form action={signOut} className="border-t-2 border-white/20 p-4 pt-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg border-2 border-transparent px-3 py-2.5 text-left text-sm font-bold uppercase text-gray-300 transition-colors duration-200 hover:border-red-300 hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          Sign out
        </button>
      </form>
    </div>
  );
}
