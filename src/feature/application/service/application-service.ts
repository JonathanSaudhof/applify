import gDriveService from "@/lib/google/drive";
import spreadsheetService from "@/lib/google/spreadsheet";
import cacheTags from "@/server/api/cache-tags";
import { auth } from "@/server/auth";
import { unstable_cache } from "next/cache";

import type { CompanyRepository } from "../models/company/company-repository.interface";
import type { ApplicationDocumentRepository } from "../models/documents/document-repository.interface";
import type { JobRepository } from "../models/job/job-repository.interface";
import {
  ApplicationSchema,
  type Application,
  type ApplicationState,
  type CreateApplicationRequest,
} from "../schema";

const cachedGetMetaDataInFolder = (applicationId: string, userId: string) =>
  unstable_cache(
    () => getMetaDataInFolder(applicationId),
    [cacheTags.applications.metadata(applicationId)],
    {
      tags: [cacheTags.applications.list(userId)],
      revalidate: 60 * 60,
    },
  );

export async function createNewApplication(
  { data, templates }: CreateApplicationRequest,
  companyRepository: CompanyRepository,
  jobRepository: JobRepository,
  documentRepository: ApplicationDocumentRepository,
): Promise<Application | null> {
  try {
    const session = await auth();

    const company = await companyRepository.createCompany(data.companyName);

    const job = await jobRepository.createJob({
      title: data.jobTitle,
      companyId: company.id,
      jobDescriptionRef: data.jobDescriptionUrl,
    });

    const allTemplates = templates.map(async ({ id, prefix }) => {
      const template = await documentRepository.getDocumentById(id);
      if (!template) {
        throw new Error(`Template with id ${id} not found`);
      }

      const isSuccess = await documentRepository.createDocument({
        title: `${prefix.toUpperCase()}_${session.user?.name?.replace(" ", "_")}_${new Date().toLocaleDateString()}`,
        jobId: job.id,
        content: template.content,
        type: template.type,
      });

      if (!isSuccess) {
        throw new Error(
          `Failed to create document from template with id ${id}`,
        );
      }
    });

    await Promise.all(allTemplates);

    return ApplicationSchema.parse({
      ...data,
      folderId: company.id,
    });
  } catch (error) {
    console.error(error);
    return null;
  }
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
      cachedGetMetaDataInFolder(application.id!, userId)(),
    ),
  );

  const applications: Application[] = rawApplications.map(
    (application, index) => {
      const metadata = metadataFiles[index];
      return {
        folderId: application.id!,
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
  const application = await gDriveService.getFolderInformation(applicationId);

  const metadata = await getMetaDataInFolder(applicationId);

  return {
    folderId: application.id!,
    companyName: application.name ?? "",
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
