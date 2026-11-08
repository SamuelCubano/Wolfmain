import { requireAuth } from "@/lib/auth";
import { listMyProjectsAction } from "@/app/actions/project";
import DashboardClient from "@/components/dashboard/DashboardClient";

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
