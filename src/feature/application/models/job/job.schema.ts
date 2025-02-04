import { z } from "zod";

export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export type Job = z.infer<typeof JobSchema>;
