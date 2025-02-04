import { z } from "zod";

export const ApplicationDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.string(),
  folderId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ApplicationDocument = z.infer<typeof ApplicationDocumentSchema>;
