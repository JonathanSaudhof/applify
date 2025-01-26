"use client";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/ui/page-container";

import { getLinkFromDocumentId, getLinkFromFolderId } from "@/lib/utils";
import { api } from "@/trpc/react";
import { FileIcon, FolderIcon, SquareArrowOutUpRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Config, TemplateType } from "../model/config";
import { FilePicker, type PickedEvent } from "./file-picker";

export function SettingsPage({
  appId,
  config,
}: {
  appId: string;
  config: Config;
}) {
  const session = useSession();
  const router = useRouter();

  const mutation = api.config.updateConfigFile.useMutation({
    onSuccess: () => {
      console.log("Config updated");
      router.refresh();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleBaseFolderUpdate = async (e: PickedEvent) => {
    if (e.detail.docs.length > 1) {
      throw new Error("Only one folder can be selected");
    }
    if (!e.detail.docs[0]) {
      throw new Error("No folder has been selected");
    }

    if (!config?.id) {
      throw new Error("Config is not loaded or has no config Id");
    }

    await mutation.mutateAsync({
      id: config.id,
      baseFolder: {
        parent: e.detail.docs[0].parentId,
        id: e.detail.docs[0].id,
      },
      templateFolder: null,
      templates: [],
    });
  };

  const handleTemplateFolderUpdate = async (e: PickedEvent) => {
    if (e.detail.docs.length > 1) {
      throw new Error("Only one folder can be selected");
    }
    if (!e.detail.docs[0]) {
      throw new Error("No folder has been selected");
    }

    if (!config?.id) {
      throw new Error("Config is not loaded or has no config Id");
    }

    await mutation.mutateAsync({
      ...config,
      templateFolder: {
        parent: e.detail.docs[0].parentId,
        id: e.detail.docs[0].id,
      },
    });
  };

  const templateUpdateHandlerFactory =
    (templateType: TemplateType) => async (e: PickedEvent) => {
      if (e.detail.docs.length > 1) {
        throw new Error("Only one folder can be selected");
      }
      if (!e.detail.docs[0]) {
        throw new Error("No folder has been selected");
      }

      const otherTemplates = config.templates.filter(
        (template) => template.type !== templateType,
      );

      await mutation.mutateAsync({
        ...config,
        templates: [
          ...otherTemplates,
          {
            type: templateType,
            id: e.detail.docs[0].id,
          },
        ],
      });
    };

  if (!session.data) {
    return <div>Is Loading</div>;
  }

  const cvTemplate = config.templates.find((item) => item.type === "cv");
  const coverLetterTemplate = config.templates.find(
    (item) => item.type === "cover-letter",
  );

  return (
    <PageContainer>
      <h1 className="text-2xl">Settings</h1>

      <div className="flex items-center justify-between gap-2 rounded border p-4">
        <div className="flex items-start gap-4">
          <FolderIcon />
          <div>
            <h2 className="text font-semibold">Base folder</h2>
            <p className="text-sm font-light">
              Choose where to store all the applications.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {config.baseFolder && (
            <Button variant="outline" asChild title="Document's Folder">
              <a
                href={getLinkFromFolderId(config.baseFolder?.id)}
                target="_blank"
              >
                <SquareArrowOutUpRight />
              </a>
            </Button>
          )}

          <FilePicker
            appId={appId}
            oauthToken={session.data?.access_token}
            mimeType="application/vnd.google-apps.folder"
            onPicked={handleBaseFolderUpdate}
            trigger={<Button>Select</Button>}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded border p-4">
        <div className="flex items-start gap-4">
          <FolderIcon />
          <div>
            <h2 className="text font-semibold">Template folder</h2>
            <p className="text-sm font-light">
              Choose you store all templates.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {config.templateFolder && (
            <Button variant="outline" asChild title="Document's Folder">
              <a
                href={getLinkFromFolderId(config.templateFolder?.id)}
                target="_blank"
              >
                <SquareArrowOutUpRight />
              </a>
            </Button>
          )}
          <FilePicker
            appId={appId}
            oauthToken={session.data?.access_token}
            mimeType="application/vnd.google-apps.folder"
            disabled={!config.baseFolder}
            parent={config.baseFolder?.id}
            onPicked={handleTemplateFolderUpdate}
            trigger={<Button>Select</Button>}
          />
        </div>
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
        <div className="flex items-center gap-6">
          {cvTemplate && (
            <Button variant="outline" asChild title="Document's Folder">
              <a href={getLinkFromDocumentId(cvTemplate.id)} target="_blank">
                <SquareArrowOutUpRight />
              </a>
            </Button>
          )}
          <FilePicker
            appId={appId}
            oauthToken={session.data.access_token}
            mimeType="application/vnd.google-apps.document"
            trigger={<Button>Select</Button>}
            parent={config.templateFolder?.id}
            onPicked={templateUpdateHandlerFactory("cv")}
            disabled={!config.baseFolder || !config.templateFolder}
          />
        </div>
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
        <div className="flex items-center gap-6">
          {coverLetterTemplate && (
            <Button variant="outline" asChild title="Document's Folder">
              <a
                href={getLinkFromDocumentId(coverLetterTemplate.id)}
                target="_blank"
              >
                <SquareArrowOutUpRight />
              </a>
            </Button>
          )}
          <FilePicker
            appId={appId}
            oauthToken={session.data?.access_token}
            mimeType="application/vnd.google-apps.document"
            trigger={<Button>Select</Button>}
            onPicked={templateUpdateHandlerFactory("cover-letter")}
            parent={config.templateFolder?.id}
            disabled={!config.baseFolder || !config.templateFolder}
          />
        </div>
      </div>
    </PageContainer>
  );
}
