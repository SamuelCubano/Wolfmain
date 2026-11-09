import { Suspense } from "react";
import { connection } from "next/server";
import EditorClient from "@/components/editor/EditorClient";

async function EditorRoute(props: { searchParams: Promise<{ project?: string }> }) {
  await connection();
  const { project } = await props.searchParams;
  return <EditorClient projectId={project ?? null} />;
}

export default function EditorPage(props: { searchParams: Promise<{ project?: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900" />}>
      <EditorRoute searchParams={props.searchParams} />
    </Suspense>
  );
}
