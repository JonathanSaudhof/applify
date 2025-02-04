import gDriveService from "@/lib/google/drive";
import spreadsheetService from "@/lib/google/spreadsheet";
import { ApplicationStateSchema } from "../../schema";
import type { JobRepository } from "./job-repository.interface";
import type { Job } from "./job.schema";

export function createGDriveJobRepository(): JobRepository {
  return {
    async createJob({ title, companyId, jobDescriptionRef }): Promise<Job> {
      const jobFolderId = await gDriveService.createNewFolder(title, companyId);
      if (!jobFolderId) {
        throw new Error("Failed to create job folder");
      }
      await createMetadataSheet({
        folderId: jobFolderId,
        jobTitle: title,
        jobDescriptionUrl: jobDescriptionRef,
      });
      return Promise.resolve({ id: jobFolderId, title: title });
    },
  };
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
