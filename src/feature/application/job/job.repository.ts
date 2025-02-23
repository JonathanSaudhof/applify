import gDriveService from "@/lib/google/drive";

export type Job = {
  id: string;
  title: string;
};

interface IJobRepository {
  getAllJobs(): Promise<Job[]>;
  getJobById(jobId: string): Promise<Job>;
  createJob({ jobTitle }: { jobTitle: string }): Promise<Job>;
}

export function createJobRepository({
  baseFolderId,
}: {
  baseFolderId: string;
}): IJobRepository {
  return {
    createJob: getCreateJob({ baseFolderId }),
    getAllJobs: async () => {
      return getJobs({ companyId: baseFolderId });
    },
    getJobById: async (jobId: string) => {
      return getJobById(jobId);
    },
  };
}

function getCreateJob({ baseFolderId }: { baseFolderId: string }) {
  return async function ({ jobTitle }: { jobTitle: string }): Promise<Job> {
    const data = await gDriveService.createNewFolder(jobTitle, baseFolderId);

    if (!data) {
      throw new Error("Failed to create job");
    }

    return {
      id: data.id,
      title: data.name,
    };
  };
}

export async function getJobs({
  companyId,
}: {
  companyId: string;
}): Promise<Job[]> {
  const folders = await gDriveService.getFolders();

  return folders.map((folder) => ({
    id: folder.id,
    title: folder.name,
  }));
}

export async function getJobById(jobId: string): Promise<Job> {
  const folder = await gDriveService.getFolderInformation(jobId);

  return {
    id: folder.id,
    title: folder.name,
  };
}
