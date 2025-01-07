"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/trpc/react";
import clsx from "clsx";
import { type drive_v3 } from "googleapis";
import {
  File,
  FileText,
  Folder,
  Map,
  Presentation,
  Settings,
  Sheet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FileExplorerProps = {
  defaultTemplateId: string | null;
};

const SELECTABLE_MIME_TYPES = [
  "application/vnd.google-apps.folder",
  "application/vnd.google-apps.document",
];

export default function FileExplorer({ defaultTemplateId }: FileExplorerProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<drive_v3.Schema$File[]>([
    {
      id: "root",
      name: "Root",
    },
  ]);

  const [selectedFile, setSelectedFile] = useState<string | null>(
    defaultTemplateId ?? null,
  );

  const { data, isLoading } = api.files.getFilesInFolder.useQuery({
    folderId: folders ? folders[folders.length - 1]!.id! : undefined,
  });

  const { mutate, error, isPending } =
    api.config.updateConfigFile.useMutation();

  const handleDocumentSelectClick = (
    fileId: string,
    mimeType: string,
    name: string,
  ) => {
    if (mimeType === "application/vnd.google-apps.folder") {
      setFolders((prev) => {
        return prev ? [...prev, { id: fileId, name }] : [{ id: fileId, name }];
      });
      return;
    }
    setSelectedFile(fileId);
  };

  const handleSaveClick = async () => {
    if (!selectedFile) {
      console.error("No file selected");
      return;
    }

    mutate(
      {
        folderId: folders.length > 1 ? folders[folders.length - 1]!.id! : null,
        defaultTemplateDocId: selectedFile,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Settings />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose a default Template</DialogTitle>
          <DialogDescription className="flex">
            {folders && !isLoading
              ? folders.map((folder, index) => (
                  <Button
                    key={folder.id}
                    className="hover: flex gap-4 rounded hover:text-blue-600 hover:underline [&:not(:last-child)]:border-r"
                    onClick={() => {
                      setFolders((prev) => {
                        return prev ? prev.slice(0, index + 1) : [];
                      });
                    }}
                    variant="ghost"
                  >
                    <p>{folder.name}</p>
                  </Button>
                ))
              : null}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="flex w-full flex-col gap-2">
            {data
              ? data.map((file) => {
                  const isAllowed = SELECTABLE_MIME_TYPES.includes(
                    file.mimeType!,
                  );
                  return (
                    <button
                      key={file.id}
                      className={clsx(
                        "flex gap-4 rounded border-2 p-2",
                        isAllowed ? "border-gray-600 text-gray-600" : null,
                        selectedFile === file.id
                          ? "border-blue-600 bg-blue-300"
                          : "hover:bg-gray-100",
                      )}
                      onClick={() => {
                        handleDocumentSelectClick(
                          file.id!,
                          file.mimeType!,
                          file.name!,
                        );
                      }}
                      disabled={!isAllowed}
                    >
                      {getIconFromMimeType({
                        mimeType: file.mimeType,
                        isAllowed,
                      })}
                      <p>{file.name}</p>
                    </button>
                  );
                })
              : null}
          </div>
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={!selectedFile} onClick={handleSaveClick}>
              Save
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              disabled={!selectedFile}
              variant="secondary"
              onClick={() => {
                setSelectedFile(null);
                setFolders([{ id: "root", name: "Root" }]);
              }}
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getIconFromMimeType({
  mimeType,
  isAllowed,
}: {
  mimeType?: string | null;
  isAllowed?: boolean;
}) {
  const disabled = "stroke-gray-300";
  if (mimeType === "application/vnd.google-apps.folder") {
    return <Folder className={isAllowed ? "stroke-gray-600" : disabled} />;
  }

  if (mimeType === "application/vnd.google-apps.spreadsheet") {
    return <Sheet className={isAllowed ? "stroke-green-600" : disabled} />;
  }

  if (mimeType === "application/vnd.google-apps.document") {
    return <FileText className={isAllowed ? "stroke-blue-600" : disabled} />;
  }

  if (mimeType === "application/vnd.google-apps.presentation") {
    return <Presentation className={isAllowed ? "stroke-red-600" : disabled} />;
  }

  if (mimeType === "application/vnd.google-apps.map") {
    return <Map className={isAllowed ? "stroke-gray-600" : disabled} />;
  }

  return <File className="stroke-gray-600" />;
}
