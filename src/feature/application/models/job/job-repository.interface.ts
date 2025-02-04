import type { Job } from "./job.schema";

export interface JobRepository {
  createJob(args: {
    title: string;
    companyId: string;
    jobDescriptionRef: string;
  }): Promise<Job>;
}
