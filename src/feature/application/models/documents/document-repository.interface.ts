import type { ApplicationDocument } from "./documents.schema";

export interface ApplicationDocumentRepository {
  createDocument(args: {
    title: string;
    jobId: string;
    content: string;
    type: string;
  }): Promise<boolean>;
  getDocumentById(documentId: string): Promise<ApplicationDocument | null>;
}
