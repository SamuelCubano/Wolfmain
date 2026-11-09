import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900" />}>
      <DashboardContent />
    </Suspense>
  );
}
