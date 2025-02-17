import { google } from "googleapis";
import { getOAuth } from "./auth";
import { type FileInfo, type IFileService } from "./file-service.interface";

async function getAuthenticatedDocument() {
  return google.docs({ auth: await getOAuth(), version: "v1" });
}

async function getAuthenticatedDrive() {
  return google.drive({ auth: await getOAuth(), version: "v3" });
}

async function createNewFolder(
  folderName: string,
  parentFolderId: string | null,
): Promise<FileInfo | null> {
  const drive = await getAuthenticatedDrive();

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      parents: parentFolderId ? [parentFolderId] : [],
      mimeType: "application/vnd.google-apps.folder",
    },
  });

  if (!folder.data.id || !folder.data.name) {
    return null;
  }

  return { id: folder.data.id, name: folder.data.name };
}

async function getAllFoldersInFolder(
  folderId: string,
  filterTrashed = false,
  filterFolderId?: string,
): Promise<FileInfo[]> {
  const drive = await getAuthenticatedDrive();

  const queryString = `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' ${filterTrashed ? " and trashed=false" : ""}`;

  const folders = await drive.files.list({
    q: queryString,
    fields: "files(id, name, mimeType)",
  });

  if (!folders.data.files) {
    return [];
  }

  if (filterFolderId) {
    return folders.data.files
      .filter((folder) => folder.id !== filterFolderId)
      .map((folder) => ({ id: folder.id!, name: folder.name! }));
  }

  return folders.data.files.map((folder) => ({
    id: folder.id!,
    name: folder.name!,
  }));
}

async function getFileInFolderByName(
  folderId: string,
  fileName: string,
): Promise<FileInfo | null> {
  const drive = await getAuthenticatedDrive();

  const files = await drive.files.list({
    q: `'${folderId}' in parents and name = '${fileName}'`,
    fields: "files(id, name, mimeType)",
  });

  if (!files.data.files?.[0]) {
    return null;
  }

  const fileInfo = {
    id: files.data.files[0].id!,
    name: files.data.files[0].name!,
  };

  return fileInfo ?? null;
}

async function getFolderInformation(
  folderId: string,
): Promise<FileInfo | null> {
  const drive = await getAuthenticatedDrive();
  const res = await drive.files.get({
    fileId: folderId,
    fields: "name, mimeType, id, parents",
  });

  if (!res.data.id || !res.data.name) {
    return null;
  }

  return { id: res.data.id, name: res.data.name };
}

async function getDocumentById(documentId: string): Promise<FileInfo | null> {
  const document = await getAuthenticatedDocument();

  try {
    const res = await document.documents.get({
      documentId,
    });

    return { id: res.data.documentId!, name: res.data.title! };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getFolderInfoByName(
  folderName: string,
  parentFolderId: string,
): Promise<FileInfo | null> {
  const drive = await getAuthenticatedDrive();

  try {
    const res = await drive.files.list({
      q: `'${parentFolderId}' in parents name = '${folderName} and mimeType='application/vnd.google-apps.folder'`,
      fields: "files(id, name, mimeType)",
    });

    if (!res.data.files?.[0]) {
      return null;
    }
    return { id: res.data.files[0].id!, name: res.data.files[0].name! };
  } catch (error) {
    console.error(error);
    return null;
  }
}

const gDriveService: IFileService = {
  getFolderInformation,
  getDocumentById,
  getAuthenticatedDrive,
  getAuthenticatedDocument,
  createNewFolder,
  getAllFoldersInFolder,
  getFileInFolderByName,
  getFolderInfoByName,
};

export default gDriveService;
