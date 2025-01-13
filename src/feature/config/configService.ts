"use server";

import gDriveService from "@/lib/google/drive";
import Config from "./models/Config";

const CONFIG_FILE_NAME = "config.json";
const APP_FOLDER_NAME = "applify";
const APP__TEMPLATE_FOLDER_NAME = "templates";
const CV_TEMPLATE_FILE_NAME = "CV Template";
const COVER_LETTER_TEMPLATE_FILE_NAME = "Cover Letter Template";

export async function getAllFilesInFolder(folderId?: string) {
  const drive = await gDriveService.getAuthenticatedDrive();

  try {
    const res = await drive.files.list({
      q: `'${folderId ? folderId : "root"}' in parents`,
      fields: "nextPageToken,files(id, name, mimeType)",
      orderBy: "folder",
    });

    return res.data.files;
  } catch (error) {
    throw error;
  }
}

async function createBaseFolder() {
  const folderId = await gDriveService.createNewFolder(APP_FOLDER_NAME);
  return folderId;
}

async function createTemplateFolder(parentFolderId: string) {
  const folderId = await gDriveService.createNewFolder(
    APP__TEMPLATE_FOLDER_NAME,
    parentFolderId,
  );
  return folderId;
}

async function createTemplateDocs(
  templateName: string,
  templateFolderId: string,
) {
  const docId = await gDriveService.createNewAsset({
    title: templateName,
    type: "application/vnd.google-apps.document",
    parentFolderId: templateFolderId,
  });
  return docId;
}

async function initialConfiguration(): Promise<Config> {
  const baseFolderId = await createBaseFolder();
  const templateFolderId = await createTemplateFolder(baseFolderId);

  const cvTemplateDocId = await createTemplateDocs(
    CV_TEMPLATE_FILE_NAME,
    templateFolderId,
  );
  const coverLetterTemplateDocId = await createTemplateDocs(
    COVER_LETTER_TEMPLATE_FILE_NAME,
    templateFolderId,
  );

  const config = new Config().init({
    folderId: baseFolderId,
    cvTemplateDocId,
    coverLetterTemplateDocId,
    version: "1.0.0",
  });

  return config;
}

export async function getOrCreateConfigFile() {
  const configFile = await getConfigFile();

  if (!configFile) {
    const config = await initialConfiguration();
    return await createConfigFile(config);
  }

  return applyPendingMigrations(configFile);
}

async function applyPendingMigrations(configFile: Config): Promise<Config> {
  if (configFile.version === "1.0.0") {
    return configFile;
  }

  const newConfig = await initialConfiguration();
  const updatedConfig = newConfig.id === configFile.id ? newConfig : configFile;

  return await updateConfigFile(updatedConfig);
}

export async function getConfigFile() {
  try {
    const fileList = await gDriveService.getFilesByName(
      CONFIG_FILE_NAME,
      "appDataFolder",
    );

    const configFile = fileList ? fileList[0] : null;

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

export async function createConfigFile(config?: Config): Promise<Config> {
  const drive = await gDriveService.getAuthenticatedDrive();

  const conf = config ?? new Config().init();

  const res = await drive.files.create({
    requestBody: {
      name: CONFIG_FILE_NAME,
      mimeType: "application/json",
      parents: ["appDataFolder"],
    },
    media: {
      mimeType: "application/json",
      body: JSON.stringify(conf),
    },
  });

  conf.id = res.data.id!;

  return conf;
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

export async function updateConfigFile(config: Config): Promise<Config> {
  const drive = await gDriveService.getAuthenticatedDrive();

  const configFile = await getConfigFile();

  if (!configFile) {
    console.error("Config file not found");
    throw new Error("Config file not found");
  }

  if (!configFile.id) {
    console.error("Config file id not found");
    throw new Error("Config file id not found");
  }

  try {
    await drive.files.update({
      fileId: configFile.id,
      media: {
        mimeType: "application/json",
        body: JSON.stringify(config),
      },
    });
    return config;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
