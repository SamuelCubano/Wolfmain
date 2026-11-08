import { requireAuth } from "@/lib/auth";
import { listMyProjectsAction } from "@/app/actions/project";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardContent() {
  const user = await requireAuth();
  const projects = await listMyProjectsAction();

  return (
    <DashboardClient
      user={user}
      initialProjects={projects}
    />
  );
}
