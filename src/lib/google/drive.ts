"use server";
import { google } from "googleapis";
import { getOAuth } from "./auth";

export async function getAuthenticatedDocument() {
  return google.docs({ auth: await getOAuth(), version: "v1" });
}

export async function getAuthenticatedDrive() {
  return google.drive({ auth: await getOAuth(), version: "v3" });
}

export async function createNewFolder(
  folderName: string,
  parentFolderId: string | null,
) {
  const drive = await getAuthenticatedDrive();

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      parents: parentFolderId ? [parentFolderId] : [],
      mimeType: "application/vnd.google-apps.folder",
    },
  });

  return folder.data.id;
}

export async function getAllFoldersInFolder(
  folderId: string,
  filterTrashed = false,
) {
  const drive = await getAuthenticatedDrive();

  const folders = await drive.files.list({
    q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = ${filterTrashed ? "true" : "false"}`,
    fields: "files(id, name, mimeType)",
  });

  return folders.data.files;
}
export async function getFileInFolderByName(
  folderId: string,
  fileName: string,
) {
  const drive = await getAuthenticatedDrive();

  const files = await drive.files.list({
    q: `'${folderId}' in parents and name = '${fileName}'`,
    fields: "files(id, name, mimeType)",
  });

  return files.data.files ? files.data.files[0] : undefined;
}

export async function getDocumentById(documentId: string) {
  const document = await getAuthenticatedDocument();

  try {
    const res = await document.documents.get({
      documentId,
    });

    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
