import { Button } from "@/components/ui/button";
import ApplicationsList, {
  ApplicationListSkeleton,
} from "@/feature/application/components/application-list";
import CreateApplication from "@/feature/application/components/create-application";
import { api, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default async function Home() {
  const template = await api.config.getTemplateFile();
  const config = await api.config.getConfigFile();

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
          <CreateApplication />
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
