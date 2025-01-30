import ApplicationsList, {
  ApplicationListSkeleton,
} from "@/feature/application/components/application-list";
import { api, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function Home() {
  const config = await api.config.getConfigFile();

  return (
    <HydrateClient>
      <main className="">
        {config?.baseFolder ? (
          <Suspense fallback={<ApplicationListSkeleton />} key={Math.random()}>
            <ApplicationsList folderId={config.baseFolder.id} />
          </Suspense>
        ) : (
          <div>No folderId found</div>
        )}
      </main>
    </HydrateClient>
  );
}
