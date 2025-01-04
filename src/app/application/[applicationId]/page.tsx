import { api } from "@/trpc/server";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const applicationId = (await params).applicationId;

  const application = await api.applications.getApplicationById({
    applicationId,
  });

  return (
    <section className="flex justify-between border-b-2 p-8">
      Application {applicationId}
      <pre>{JSON.stringify(application, null, 2)}</pre>
    </section>
  );
}
