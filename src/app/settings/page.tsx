import { env } from "@/env";

import { SettingsPage } from "@/feature/settings/components/settings-page";
import type { Config } from "@/feature/settings/model/config";

export default async function Settings() {
  // const config = await api.config.getConfigFile();
  const config: Config = {
    folderId: "1",
    id: "",
    templates: [],
  };

  const appId = env.GOOGLE_PROJECT_ID;

  return <SettingsPage config={config} appId={appId} />;
}
