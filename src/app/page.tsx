import { Button } from "@/components/ui/button";
import { invalidateApplicationsList } from "@/feature/application/components/actions/revalidation";
import ApplicationsList, {
  ApplicationListSkeleton,
} from "@/feature/application/components/application-list";
import CreateApplication from "@/feature/application/components/create-application";
import { api, HydrateClient } from "@/trpc/server";
import { RefreshCw } from "lucide-react";
import { Suspense } from "react";

export default async function Home() {
  const config = await api.config.getConfigFile();

  const handleRefresh = async () => {
    "use server";
    await invalidateApplicationsList();
  };

  return (
    <HydrateClient>
      <main className="">
        <section className="flex justify-between border-b-2 p-8">
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw />
            </Button>
            <CreateApplication />
          </div>
        </section>
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
