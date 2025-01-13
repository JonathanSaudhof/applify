"use server";

import gDriveService from "@/lib/google/drive";

export async function getAllFilesInFolder(folderId: string) {
  try {
    return await gDriveService.getAllFoldersInFolder(folderId, true);
  } catch (error) {
    throw error;
  }
}

export async function downloadFile(fileId: string) {
  const drive = await gDriveService.getAuthenticatedDrive();

  try {
    const res = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      { responseType: "stream" },
    );

    return res.data;
  } catch (error) {
    throw error;
  }
}

export type Config = {
  id: string;
  folderId: string | null;
  defaultCvTemplateDocId: string | null;
  defaultCoverLetterTemplateDocId: string | null;
};

const CONFIG_FILE_NAME = "config.json";

export async function getOrCreateConfigFile() {
  const configFile = await getConfigFile();

  if (!configFile) {
    return await createConfigFile();
  }

  return configFile;
}

export async function getConfigFile() {
  const drive = await gDriveService.getAuthenticatedDrive();

  try {
    const fileList = await drive.files.list({
      q: `name = '${CONFIG_FILE_NAME}'`,
      fields: "nextPageToken, files(id, name)",
      spaces: "appDataFolder",
    });
    // return actual content of the file
    const configFile = fileList.data.files ? fileList.data.files[0] : null;
    if (!configFile?.id) {
      return null;
    }
    const config = await getFileById(configFile?.id);
    return { id: configFile.id, ...config } as Config;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createConfigFile(): Promise<Config> {
  const drive = await gDriveService.getAuthenticatedDrive();

  const res = await drive.files.create({
    requestBody: {
      name: CONFIG_FILE_NAME,
      mimeType: "application/json",
      parents: ["appDataFolder"],
    },
    media: {
      mimeType: "application/json",
      body: JSON.stringify({
        folderId: null,
        defaultTemplateDocId: "",
      }),
    },
  });

  return {
    id: res.data.id!,
    folderId: null,
    defaultCvTemplateDocId: null,
    defaultCoverLetterTemplateDocId: null,
  };
}

export async function getFileById(fileId: string | null) {
  if (!fileId) {
    return null;
  }
  const drive = await gDriveService.getAuthenticatedDrive();

  try {
    const fileContent = await drive.files.get({
      fileId: fileId,
      alt: "media",
    });

    return fileContent.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateConfigFile(config: Config) {
  const drive = await gDriveService.getAuthenticatedDrive();

  const configFile = await getConfigFile();

  if (!configFile) {
    console.error("Config file not found");
    return null;
  }

  if (!configFile.id) {
    console.error("Config file id not found");
    return null;
  }

  try {
    await drive.files.update({
      fileId: configFile.id,
      media: {
        mimeType: "application/json",
        body: JSON.stringify(config),
      },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
