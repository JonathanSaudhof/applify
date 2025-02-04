import gDriveService from "@/lib/google/drive";
import type { ApplicationDocumentRepository } from "./document-repository.interface";

export default function createGDriveApplicationDocumentRepository(): ApplicationDocumentRepository {
  return {
    async createDocument({ title, jobId, content, type, }): Promise<boolean> {
        gDriveService.createDocument(title, jobId, content, type);
      // Implement the logic to create a document in GDrive
      // For now, we return true to indicate success
      return Promise.resolve(true);
    },
    async deleteDocument() {
      return Promise.resolve("GDrive document deleted");    
  };
}
