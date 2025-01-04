import type { Application } from "../schema";
import {
  createNewApplication,
  getAllApplications,
  getApplicationById,
  getMetaDataInFolder,
} from "./applicationService";

interface ApplicationService {
  createNewApplication: typeof createNewApplication;
  getAllApplications: ({
    folderId,
    userId,
  }: {
    folderId: string;
    userId: string;
  }) => Promise<Application[]>;
  getApplicationById: ({
    applicationId,
  }: {
    applicationId: string;
  }) => Promise<Application>;
  getMetaDataInFolder: typeof getMetaDataInFolder;
}

const applicationService: ApplicationService = {
  createNewApplication,
  getAllApplications,
  getApplicationById,
  getMetaDataInFolder,
};

export default applicationService;
