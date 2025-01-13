export default class Config {
  id?: string | null;
  folderId?: string | null;
  cvTemplateDocId?: string | null;
  coverLetterTemplateDocId?: string | null;
  version?: string;

  init(config?: {
    id?: string | null;
    folderId?: string | null;
    cvTemplateDocId?: string | null;
    coverLetterTemplateDocId?: string | null;
    version?: string;
  }) {
    this.id = config?.id;
    this.folderId = config?.folderId;
    this.cvTemplateDocId = config?.cvTemplateDocId;
    this.coverLetterTemplateDocId = config?.coverLetterTemplateDocId;
    this.version = config?.version;
    return this;
  }
}
