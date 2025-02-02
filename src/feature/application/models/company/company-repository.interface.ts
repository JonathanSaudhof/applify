import type { Company } from "./company-schema";

export interface CompanyRepository {
  createCompany(name: string): Promise<Company>;
}
