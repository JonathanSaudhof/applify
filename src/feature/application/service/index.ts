import type { Application, ApplicationState } from "../schema";
import {
  createNewApplication,
  getAllApplications,
  getApplicationById,
  getMetaDataInFolder,
  updateApplicationState,
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
  updateApplicationState: (args: {
    applicationId: string;
    state: ApplicationState;
  }) => Promise<void>;
}

const applicationService: ApplicationService = {
  createNewApplication,
  getAllApplications,
  getApplicationById,
  getMetaDataInFolder,
  updateApplicationState,
};

export default applicationService;
