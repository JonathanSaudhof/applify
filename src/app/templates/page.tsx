import PageContainer from "@/components/ui/page-container";
import FileExplorer from "@/feature/file-explorer/FileExplorer";
import { api } from "@/trpc/server";

export default async function TemplatesPage() {
  const config = await api.config.getConfigFile();
  return (
    <PageContainer>
      <h1>Choose Template</h1>
      <FileExplorer />
    </PageContainer>
  );
}
