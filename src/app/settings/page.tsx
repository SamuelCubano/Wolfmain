import { Suspense } from "react";
import SettingsContent from "./SettingsContent";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900" />}>
      <SettingsContent />
    </Suspense>
  );
}
