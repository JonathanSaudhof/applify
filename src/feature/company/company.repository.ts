import gDriveService from "@/lib/google/drive";

export type Company = {
  id: string;
  name: string;
};

interface ICompanyRepository {
  createCompany({ companyName }: { companyName: string }): Promise<Company>;
  getAllCompanies(): Promise<Company[]>;
  getCompanyById({ companyId }: { companyId: string }): Promise<Company>;
}

export function companyRepositoryFactory({
  baseFolderId,
}: {
  baseFolderId: string;
}): ICompanyRepository {
  return {
    createCompany: createCompanyCreator({ baseFolderId }),
    getAllCompanies: createGetAllCompaniesGetter({ baseFolderId }),
    getCompanyById: createCompanyByIdGetter(),
  };
}

function createCompanyCreator({ baseFolderId }: { baseFolderId: string }) {
  return async function ({
    companyName,
  }: {
    companyName: string;
  }): Promise<Company> {
    const data = await gDriveService.createNewFolder(companyName, baseFolderId);

    if (!data) {
      throw new Error("Failed to create company");
    }

    return {
      id: data.id,
      name: data.name,
    };
  };
}

function createCompanyByIdGetter() {
  return async ({ companyId }: { companyId: string }) => {
    const folder = await gDriveService.getFolderById(companyId);

    if (!folder) {
      throw new Error("Company not found");
    }

    return { id: folder.id, name: folder.name } as Company;
  };
}

function createGetAllCompaniesGetter({
  baseFolderId,
}: {
  baseFolderId: string;
}) {
  return async () => {
    const folders = await gDriveService.getAllFoldersInFolder(baseFolderId);

    return folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
    }));
  };
}
