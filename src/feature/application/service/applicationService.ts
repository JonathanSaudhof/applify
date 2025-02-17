import gDriveService from "@/lib/google/drive";
import spreadsheetService from "@/lib/google/spreadsheet";
import cacheTags from "@/server/api/cache-tags";
import { auth } from "@/server/auth";
import { unstable_cache } from "next/cache";
import {
  ApplicationSchema,
  ApplicationStateSchema,
  type Application,
  type ApplicationState,
  type CreateApplicationRequest,
} from "../schema";
import { type FileInfo } from "@/lib/google/file-service.interface";

const cachedGetMetaDataInFolder = (applicationId: string, userId: string) =>
  unstable_cache(
    () => getMetaDataInFolder(applicationId),
    [cacheTags.applications.metadata(applicationId)],
    {
      tags: [cacheTags.applications.list(userId)],
      revalidate: 60 * 60,
    },
  );

export async function createNewApplication({
  data,
  templates,
  baseFolderId,
}: CreateApplicationRequest): Promise<Application | null> {
  try {
    const session = await auth();

    let companyFolder: FileInfo | null =
      await gDriveService.getFolderInfoByName(data.companyName, baseFolderId);

    if (!companyFolder) {
      companyFolder = await gDriveService.createNewFolder(
        data.companyName,
        baseFolderId,
      );
    }

    if (!companyFolder) {
      throw new Error("Failed to create folder");
    }

    const jobFolder = await gDriveService.createNewFolder(
      data.jobTitle,
      companyFolder.id,
    );

    if (!jobFolder) {
      throw new Error("Failed to create folder");
    }

    const allTemplates = templates.map(({ id, prefix }) =>
      copyTemplateDocument({
        templateDocId: id,
        folderId: jobFolder.id,
        documentName: `${prefix.toUpperCase()}_${session.user?.name?.replace(" ", "_")}_${new Date().toLocaleDateString()}`,
      }),
    );

    await Promise.all(allTemplates);

    await createMetadataSheet({
      folderId: jobFolder.id,
      jobTitle: data.jobTitle,
      jobDescriptionUrl: data.jobDescriptionUrl,
    });

    return ApplicationSchema.parse({
      ...data,
      folderId: jobFolder.id,
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function copyTemplateDocument({
  templateDocId,
  folderId,
  documentName,
}: {
  templateDocId: string;
  folderId: string;
  documentName: string;
}) {
  const drive = await gDriveService.getAuthenticatedDrive();

  const document = await drive.files.copy({
    fileId: templateDocId,
    requestBody: {
      parents: [folderId],
      name: documentName,
    },
  });

  return document.data.id;
}

////////////// Metadata Sheet //////////////
async function createMetadataSheet({
  folderId,
  jobTitle,
  jobDescriptionUrl,
}: {
  folderId: string;
  jobTitle: string;
  jobDescriptionUrl: string;
}) {
  const sheetName = "metadata";
  const spreadsheetId = await spreadsheetService.createSpreadSheet(
    sheetName,
    folderId,
  );

  if (!spreadsheetId) {
    throw new Error("Failed to create metadata sheet");
  }

  await createOverviewTable(spreadsheetId, { jobTitle, jobDescriptionUrl });
}

async function createOverviewTable(
  spreadSheetId: string,
  data: { jobDescriptionUrl: string; jobTitle: string },
) {
  const OVERVIEW_SHEET_NAME = "overview";
  const columns = ["link", "title", "state"];

  const table = await spreadsheetService.createTable({
    spreadSheetId,
    title: OVERVIEW_SHEET_NAME,
    columns,
  });

  if (!table) {
    throw new Error("Failed to create overview table");
  }

  await table.addRows([
    {
      link: data.jobDescriptionUrl,
      title: data.jobTitle,
      state: ApplicationStateSchema.enum.created,
    },
  ]);
}

export async function getAllApplications({
  folderId,
  userId,
  filterFolderId,
}: {
  folderId: string;
  userId: string;
  filterFolderId?: string;
}): Promise<Application[]> {
  const rawApplications = await gDriveService.getAllFoldersInFolder(
    folderId,
    true,
    filterFolderId,
  );

  if (!rawApplications) {
    return [];
  }

  const metadataFiles = await Promise.all(
    rawApplications.map((application) =>
      cachedGetMetaDataInFolder(application.id, userId)(),
    ),
  );

  const applications: Application[] = rawApplications.map(
    (application, index) => {
      const metadata = metadataFiles[index];
      return {
        folderId: application.id,
        companyName: application.name ?? "",
        ...metadata!,
      };
    },
  );

  return applications;
}

export async function getApplicationById({
  applicationId,
}: {
  applicationId: string;
}): Promise<Application> {
  const applicationFolder =
    await gDriveService.getFolderInformation(applicationId);

  if (!applicationFolder) {
    throw new Error("Application folder not found");
  }

  const metadata = await getMetaDataInFolder(applicationFolder?.id);

  return {
    folderId: applicationFolder.id,
    companyName: applicationFolder.name ?? "",
    ...metadata,
  };
}

type Metadata = {
  jobDescriptionUrl: string | null;
  jobTitle: string | null;
  applicationState: ApplicationState | null;
};

type MetadataFile = {
  link: string;
  title: string;
  state?: ApplicationState;
};

export async function getMetaDataInFolder(folderId: string): Promise<Metadata> {
  const file = await gDriveService.getFileInFolderByName(folderId, "metadata");

  if (!file?.id) {
    return {
      jobDescriptionUrl: null,
      jobTitle: null,
      applicationState: null,
    };
  }

  const rows = await spreadsheetService.readTable<MetadataFile>(
    file.id,
    "overview",
  );

  if (!rows.length || !rows) {
    console.error("Metadata table not found in file: ", file.id);
    return {
      jobDescriptionUrl: null,
      jobTitle: null,
      applicationState: null,
    };
  }

  return {
    jobDescriptionUrl: (rows[0]?.get("link") as string) ?? null,
    jobTitle: (rows[0]?.get("title") as string) ?? null,
    applicationState: (rows[0]?.get("state") as ApplicationState) ?? null,
  };
}

export async function updateApplicationState({
  applicationId,
  state,
}: {
  applicationId: string;
  state: ApplicationState;
}): Promise<void> {
  const file = await gDriveService.getFileInFolderByName(
    applicationId,
    "metadata",
  );

  if (!file?.id) {
    throw new Error("Metadata file not found in folder");
  }

  const rows = await spreadsheetService.readTable<MetadataFile>(
    file.id,
    "overview",
  );

  if (!rows.length || !rows) {
    throw new Error("Metadata table not found in file");
  }

  rows[0]?.set("state", state);
  await rows[0]?.save();
}
