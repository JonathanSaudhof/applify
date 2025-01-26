import { env } from "@/env";

import { SettingsPage } from "@/feature/settings/components/settings-page";
import { api } from "@/trpc/server";

export default async function Settings() {
  const config = await api.config.getConfigFile();

  const appId = env.GOOGLE_PROJECT_ID;

  return <SettingsPage config={config} appId={appId} />;
}
