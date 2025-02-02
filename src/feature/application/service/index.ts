import type {
  Application,
  ApplicationState,
  CreateApplicationRequest,
} from "../schema";
import {
  createNewApplication,
  getAllApplications,
  getApplicationById,
  getMetaDataInFolder,
  updateApplicationState,
} from "./application-service";

interface ApplicationService {
  createNewApplication: (
    props: CreateApplicationRequest,
  ) => Promise<Application | null>;
  getAllApplications: ({
    folderId,
    userId,
    filterFolderId,
  }: {
    folderId: string;
    userId: string;
    filterFolderId?: string;
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
