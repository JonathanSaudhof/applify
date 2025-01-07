import { type drive_v3, google } from "googleapis";
import { getOAuth } from "./auth";

async function getAuthenticatedDocument() {
  return google.docs({ auth: await getOAuth(), version: "v1" });
}

async function getAuthenticatedDrive() {
  return google.drive({ auth: await getOAuth(), version: "v3" });
}

async function createNewFolder(
  folderName: string,
  parentFolderId?: string | null,
): Promise<string> {
  const folderId = createNewAsset({
    title: folderName,
    type: "application/vnd.google-apps.folder",
    parentFolderId,
  });

  return folderId;
}

async function createNewAsset({
  type,
  title,
  parentFolderId,
}: {
  title: string;
  parentFolderId?: string | null;
  type: drive_v3.Schema$File["mimeType"];
}) {
  const drive = await getAuthenticatedDrive();

  const asset = await drive.files.create({
    requestBody: {
      name: title,
      parents: parentFolderId ? [parentFolderId] : [],
      mimeType: type,
    },
  });

  if (!asset.data.id) {
    throw new Error(`Failed to create asset-${type}: ${title}`);
  }

  return asset.data.id;
}

async function getAllFoldersInFolder(folderId: string, filterTrashed = false) {
  const drive = await getAuthenticatedDrive();

  const folders = await drive.files.list({
    q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = ${filterTrashed ? "true" : "false"}`,
    fields: "files(id, name, mimeType)",
  });

  return folders.data.files;
}
async function getFileInFolderByName(folderId: string, fileName: string) {
  const drive = await getAuthenticatedDrive();

  const files = await drive.files.list({
    q: `'${folderId}' in parents and name = '${fileName}'`,
    fields: "files(id, name, mimeType)",
  });

  return files.data.files ? files.data.files[0] : undefined;
}

async function getFolderInformation(folderId: string) {
  const drive = await getAuthenticatedDrive();
  const res = await drive.files.get({
    fileId: folderId,
    fields: "name, mimeType, id, parents",
  });
  return res.data;
}

async function getDocumentById(documentId: string) {
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

async function getFilesByName(
  name: string,
  spaces?: drive_v3.Params$Resource$Files$List["spaces"],
) {
  const drive = await getAuthenticatedDrive();

  const fileList = await drive.files.list({
    q: `name = '${name}'`,
    fields: "nextPageToken, files(id, name)",
    spaces: spaces,
  });

  return fileList.data.files;
}

function getLinkFromFolderId(folderId: string) {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

const gDriveService = {
  getFolderInformation,
  getDocumentById,
  getAuthenticatedDrive,
  getAuthenticatedDocument,
  createNewFolder,
  getAllFoldersInFolder,
  getFileInFolderByName,
  getLinkFromFolderId,
  createNewAsset,
  getFilesByName,
};

export default gDriveService;
