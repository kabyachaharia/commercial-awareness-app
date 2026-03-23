"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogOut, Upload } from "lucide-react";

import { signOut } from "./actions";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/upload", label: "Upload", icon: Upload },
] as const;

export function DashboardSidebarContent({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700/80 px-5 py-6">
        <Link href="/dashboard" className="block">
          <span className="[font-family:var(--font-sora)] text-xl font-bold tracking-tight text-white">
            CommAware
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Navigate</p>
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-indigo-500/20 text-white ring-1 ring-indigo-400/30"
                  : "text-slate-300 hover:bg-indigo-500/15 hover:text-white"
              }`}
            >
              <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700/80 p-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Account</p>
        <p className="truncate text-xs text-slate-400" title={email}>
          {email}
        </p>
      </div>

      <form action={signOut} className="border-t border-slate-700/80 p-4 pt-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          Sign out
        </button>
      </form>
    </div>
  );
}
