import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Your Materials</h1>

      <Card className="max-w-2xl border-slate-200 bg-white ring-0">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">No materials yet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-600">
          <p>Upload your first document to get started.</p>
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-500">
            <Link href="/dashboard/upload">Go to Upload</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
