"use client";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/ui/page-container";

import { getLinkFromDocumentId, getLinkFromFolderId } from "@/lib/utils";
import { api } from "@/trpc/react";
import { FileIcon, FolderIcon, SquareArrowOutUpRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type PropsWithChildren } from "react";
import type { Config, TemplateType } from "../model/config";
import { FilePicker, type PickedEvent } from "./file-picker";
import { invalidateConfig } from "../actions/invalidateConfig";
import { Skeleton } from "@/components/ui/skeleton";

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
    onSuccess: async () => {
      await invalidateConfig();
      router.refresh();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleBaseFolderUpdate = (e: PickedEvent) => {
    if (e.detail.docs.length > 1) {
      throw new Error("Only one folder can be selected");
    }
    if (!e.detail.docs[0]) {
      throw new Error("No folder has been selected");
    }

    if (!config?.id) {
      throw new Error("Config is not loaded or has no config Id");
    }

    mutation.mutate({
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

  const cvTemplate = config.templates.find((item) => item.type === "cv");
  const coverLetterTemplate = config.templates.find(
    (item) => item.type === "cover-letter",
  );

  if (mutation.isPending || !session.data) {
    return <SettingsSkeleton />;
  }

  return (
    <PageContainer>
      <h1 className="text-2xl">Settings</h1>
      {mutation.isPending && <div>Loading...</div>}
      <SettingsSection>
        <SettingsContent icon={<FolderIcon />}>
          <SettingsTitle>Base folder</SettingsTitle>
          <SettingsDescription>
            Choose where to store all the applications.
          </SettingsDescription>
        </SettingsContent>
        <SettingsControls>
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
        </SettingsControls>
      </SettingsSection>
      <SettingsSection>
        <SettingsContent icon={<FolderIcon />}>
          <SettingsTitle>Template folder</SettingsTitle>
          <SettingsDescription>
            Choose you store all templates.
          </SettingsDescription>
        </SettingsContent>
        <SettingsControls>
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
        </SettingsControls>
      </SettingsSection>
      <SettingsSection>
        <SettingsContent icon={<FileIcon />}>
          <SettingsTitle>Default CV Template</SettingsTitle>
          <SettingsDescription>
            If you create a new application, this Google Doc template will be
            used for your CV.
          </SettingsDescription>
        </SettingsContent>
        <SettingsControls>
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
        </SettingsControls>
      </SettingsSection>
      <SettingsSection>
        <SettingsContent icon={<FileIcon />}>
          <SettingsTitle>Default Cover Letter Template</SettingsTitle>
          <SettingsDescription>
            If you create a new application, this Google Doc template will be
            used for your cover letter.
          </SettingsDescription>
        </SettingsContent>
        <SettingsControls>
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
        </SettingsControls>
      </SettingsSection>
    </PageContainer>
  );
}

function SettingsSection({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center justify-between gap-2 rounded border p-4">
      {children}
    </div>
  );
}

function SettingsContent({
  children,
  icon,
}: PropsWithChildren<{ icon?: React.ReactElement }>) {
  return (
    <div className="flex items-start gap-4">
      {icon ? (
        <>
          {icon}
          <div>{children}</div>
        </>
      ) : (
        children
      )}
    </div>
  );
}

function SettingsTitle({ children }: PropsWithChildren) {
  return (
    <div>
      <h2 className="text font-semibold">{children}</h2>
    </div>
  );
}

function SettingsDescription({ children }: PropsWithChildren) {
  return <p className="text-sm font-light">{children}</p>;
}

function SettingsControls({ children }: PropsWithChildren) {
  return <div className="flex items-center gap-6">{children}</div>;
}

export function SettingsSkeleton() {
  const skeletons = Array.from({ length: 5 }).map((_, index) => (
    <SettingsSection key={index}>
      <SettingsContent icon={<Skeleton className="h-5 w-5 rounded" />}>
        <Skeleton className="mb-2 h-4 w-48 rounded-full" />
        <Skeleton className="h-3 w-36 rounded-full" />
      </SettingsContent>
      <SettingsControls>
        <Skeleton className="h-8 w-12 rounded" />
        <Skeleton className="h-8 w-24 rounded" />
      </SettingsControls>
    </SettingsSection>
  ));
  return (
    <PageContainer>
      <h1 className="text-2xl">Settings</h1>
      {skeletons}
    </PageContainer>
  );
}
