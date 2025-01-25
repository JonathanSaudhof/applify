"use client";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/ui/page-container";

import { api } from "@/trpc/react";
import { FileIcon, FolderIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import type { Config } from "../model/config";
import { FilePicker } from "./file-picker";

export function SettingsPage({
  config,
  appId,
}: {
  config: Config;
  appId: string;
}) {
  const session = useSession();
  const mutation = api.config.updateConfigFile.useMutation({});

  const handleUpdateBaseFolder = async (folderId: string) => {
    await mutation.mutateAsync({
      id: config.id,
      folderId,
      templates: [],
    });
  };

  if (!session.data) {
    return <div>No Session</div>;
  }

  const handlePicked = (e) => {
    console.log("Picked", e);
  };

  return (
    <PageContainer>
      <h1 className="text-2xl">Settings</h1>

      <div className="flex items-center justify-between gap-2 rounded border p-4">
        <div className="flex items-start gap-4">
          <FolderIcon />
          <div>
            <h2 className="text font-semibold">Base folder</h2>
            <p className="text-sm font-light">
              Choose where to store all the applications and templates.
            </p>
          </div>
        </div>
        <FilePicker
          appId={appId}
          oauthToken={session.data?.access_token}
          mimeType="application/vnd.google-apps.folder"
          onPicked={handlePicked}
          trigger={<Button>Select</Button>}
        />
      </div>

      <div className="flex items-center justify-between gap-2 rounded border p-4">
        <div className="flex items-start gap-4">
          <FileIcon />
          <div>
            <h2 className="text font-semibold">Default CV Template</h2>
            <p className="text-sm font-light">
              If you create a new application, this Google Doc template will be
              used for your CV.
            </p>
          </div>
        </div>
        <FilePicker
          appId={appId}
          oauthToken={session.data.access_token}
          mimeType="application/vnd.google-apps.document"
          trigger={<Button>Select</Button>}
        />
      </div>

      <div className="flex items-center justify-between gap-2 rounded border p-4">
        <div className="flex items-start gap-4">
          <FileIcon />
          <div>
            <h2 className="text font-semibold">
              Default Cover Letter Template
            </h2>
            <p className="text-sm font-light">
              If you create a new application, this Google Doc template will be
              used for your cover letter.
            </p>
          </div>
        </div>
        <FilePicker
          appId={appId}
          oauthToken={session.data?.access_token}
          mimeType="application/vnd.google-apps.document"
          trigger={<Button>Select</Button>}
        />
      </div>
    </PageContainer>
  );
}
