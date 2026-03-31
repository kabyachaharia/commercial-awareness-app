"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, Home, LogOut, UploadCloud } from "lucide-react";
import { ArrowUpCircle } from "lucide-react";

import { signOut } from "./actions";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/library", label: "Library", icon: BookOpen },
  { href: "/dashboard/upload", label: "Upload", icon: UploadCloud },
  { href: "/dashboard/documents", label: "My Documents", icon: FileText },
] as const;

export function DashboardSidebarContent({
  email,
}: {
  email: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-gray-100 px-5 py-5">
        <Link href="/dashboard" className="block">
          <span className="text-lg font-bold text-black">
            Commercial Awareness
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3 pt-4">
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
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }`}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/dashboard/upgrade"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
            pathname === "/dashboard/upgrade" ||
            pathname.startsWith("/dashboard/upgrade/")
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-black"
          }`}
        >
          <ArrowUpCircle className="size-[18px] shrink-0" aria-hidden />
          Upgrade
        </Link>
      </nav>

      <div className="border-t border-gray-100 p-4">
        <p className="truncate text-[13px] text-gray-500" title={email}>
          {email}
        </p>
      </div>

      <form action={signOut} className="border-t border-gray-100 px-3 pb-4 pt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="size-[18px] shrink-0" aria-hidden />
          Sign out
        </button>
      </form>
    </div>
  );
}
