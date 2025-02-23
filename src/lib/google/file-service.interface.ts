import { type docs_v1, type drive_v3 } from "googleapis";

export type FileInfo = {
  id: string;
  name: string;
};

export interface IFileService {
  getFolderInformation: (folderId: string) => Promise<FileInfo | null>;
  getDocumentById: (documentId: string) => Promise<FileInfo | null>;
  getAuthenticatedDrive: () => Promise<drive_v3.Drive>;
  getAuthenticatedDocument: () => Promise<docs_v1.Docs>;
  createNewFolder: (
    folderName: string,
    parentFolderId: string | null,
  ) => Promise<FileInfo | null>;
  getAllFoldersInFolder: (
    folderId: string,
    filterTrashed?: boolean,
    filterFolderId?: string,
  ) => Promise<FileInfo[]>;
  getFileInFolderByName: (
    folderId: string,
    fileName: string,
  ) => Promise<FileInfo | null>;
  getFolderInfoByName: (
    folderName: string,
    parentFolderId: string,
  ) => Promise<FileInfo | null>;
  getFolderById(folderId: string): Promise<FileInfo | null>;
}
