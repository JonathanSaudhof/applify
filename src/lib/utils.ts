import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLinkFromFolderId(folderId: string) {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

export function getLinkFromDocumentId(documentId: string) {
  return `https://docs.google.com/document/d/${documentId}`;
}
