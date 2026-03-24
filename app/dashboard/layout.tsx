import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/server";

import { DashboardSidebarContent } from "./dashboard-sidebar";

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
    <div className="min-h-screen scroll-smooth bg-[#F5F5F5]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="sticky top-0 h-screen">
            <DashboardSidebarContent email={userEmail} />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center border-b-2 border-black bg-white/95 px-4 backdrop-blur md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open sidebar">
                  <Menu className="size-5 text-black" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 border-r-2 border-black bg-black p-0 text-white [&>button]:text-white"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Dashboard Navigation</SheetTitle>
                </SheetHeader>
                <DashboardSidebarContent email={userEmail} />
              </SheetContent>
            </Sheet>
            <Link
              href="/dashboard"
              className="ml-3 text-base font-black uppercase tracking-tight text-black"
            >
              Commercial Awareness
            </Link>
          </header>

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
