import { requireAuth } from "@/lib/auth";
import { getProfileAction } from "@/app/actions/profile";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsContent() {
  await requireAuth();
  const profile = await getProfileAction();

  return <SettingsClient initialProfile={profile} />;
}
