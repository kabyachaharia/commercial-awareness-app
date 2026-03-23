import Link from "next/link";
import { redirect } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { Home, LogOut, Menu, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/server";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

type NavLink = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/upload", label: "Upload", icon: Upload },
];

function SidebarContent({ email }: { email: string }) {
  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-4 py-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">Signed in as</p>
        <p className="mt-1 truncate text-sm font-medium text-slate-200">{email}</p>
      </div>

      <nav className="flex-1 space-y-2 p-3">
        {navLinks.map((link) => (
          <Button
            key={link.href}
            asChild
            variant="ghost"
            className="w-full justify-start text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            <Link href={link.href}>
              <link.icon className="mr-2 size-4" />
              {link.label}
            </Link>
          </Button>
        ))}
      </nav>

      <form action={signOut} className="border-t border-slate-800 p-3">
        <Button
          type="submit"
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="mr-2 size-4" />
          Sign Out
        </Button>
      </form>
    </div>
  );
}

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userEmail = user.email ?? "No email available";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-72 border-r border-slate-800 md:block">
        <SidebarContent email={userEmail} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center border-b border-slate-200 bg-white px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open sidebar">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-slate-800 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Dashboard Navigation</SheetTitle>
              </SheetHeader>
              <SidebarContent email={userEmail} />
            </SheetContent>
          </Sheet>
          <p className="ml-3 text-sm font-medium text-slate-700">Dashboard</p>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
