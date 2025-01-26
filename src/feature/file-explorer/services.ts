"use server";

import gDriveService from "@/lib/google/drive";
import {
  ConfigFileSchema,
  ConfigSchema,
  type Config,
} from "../settings/model/config";

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

const CONFIG_FILE_NAME = "config.json";

export async function getOrCreateConfigFile(): Promise<Config> {
  const configFile = await getConfigFile();

  if (!configFile) {
    return await createConfigFile();
  }

  return configFile;
}

export async function getConfigFile(): Promise<Config | null> {
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
    const config = ConfigFileSchema.parse(await getFileById(configFile?.id));
    return { ...config, id: configFile.id };
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
      body: JSON.stringify({}),
    },
  });

  const config = ConfigSchema.parse({
    id: res.data.id!,
    baseFolder: null,
    templateFolder: null,
    templates: [],
  });

  return config;
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

    return { ...fileContent.data };
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
