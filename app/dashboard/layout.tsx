import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Inter, Sora } from "next/font/google";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/server";

import { DashboardSidebarContent } from "./dashboard-sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

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
    <div
      className={`${inter.variable} ${sora.variable} min-h-screen scroll-smooth bg-white [font-family:var(--font-inter)]`}
    >
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="sticky top-0 h-screen">
            <DashboardSidebarContent email={userEmail} />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open sidebar">
                  <Menu className="size-5 text-slate-700" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 border-slate-800 bg-slate-900 p-0 text-white [&>button]:text-slate-300 [&>button]:hover:bg-white/10 [&>button]:hover:text-white"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Dashboard Navigation</SheetTitle>
                </SheetHeader>
                <DashboardSidebarContent email={userEmail} />
              </SheetContent>
            </Sheet>
            <Link
              href="/dashboard"
              className="ml-3 [font-family:var(--font-sora)] text-base font-bold tracking-tight text-slate-900"
            >
              CommAware
            </Link>
          </header>

          <main className="flex-1 bg-white px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
