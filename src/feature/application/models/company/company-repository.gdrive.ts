import type { Config } from "@/feature/settings/model/config";
import gDriveService from "@/lib/google/drive";
import type { CompanyRepository } from "./company-repository.interface";
import { CompanySchema, type Company } from "./company-schema";

export function createGDriveCompanyRepository(
  config: Config,
): CompanyRepository {
  return {
    async createCompany(name: string): Promise<Company> {
      const folderId = await gDriveService.createNewFolder(
        name,
        config.baseFolder?.id ?? "root",
      );

      if (!folderId) {
        throw new Error("Failed to create company folder");
      }

      return CompanySchema.parse({
        id: folderId,
        name: name,
      });
    },
  };
}
