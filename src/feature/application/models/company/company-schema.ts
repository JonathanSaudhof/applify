import { z } from "zod";

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Company = z.infer<typeof CompanySchema>;
