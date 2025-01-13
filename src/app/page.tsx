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
  const template = await api.config.getTemplateFile();
  const config = await api.config.getConfigFile();

  const handleRefresh = async () => {
    "use server";
    await invalidateApplicationsList();
  };

  return (
    <HydrateClient>
      <main className="">
        <section className="flex justify-between border-b-2 p-8">
          {template ? (
            <Button variant="outline" asChild>
              <a
                href={`https://docs.google.com/document/d/${template?.documentId}`}
                target="_blank"
                rel="noreferrer"
              >
                {template.title}
              </a>
            </Button>
          ) : (
            "No template selected"
          )}
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw />
            </Button>
            <CreateApplication />
          </div>
        </section>

        {config?.folderId ? (
          <Suspense fallback={<ApplicationListSkeleton />} key={Math.random()}>
            <ApplicationsList folderId={config.folderId} />
          </Suspense>
        ) : (
          <div>No folderId found</div>
        )}
      </main>
    </HydrateClient>
  );
}
