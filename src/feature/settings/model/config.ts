import { z } from "zod";

const TemplateTypeSchema = z.enum(["cv", "cover-letter"]);

export type TemplateType = z.infer<typeof TemplateTypeSchema>;

export const ConfigSchema = z.object({
  id: z.string(),
  baseFolder: z
    .object({
      parent: z.string().default("root"),
      id: z.string(),
    })
    .nullable()
    .default(null),
  templateFolder: z
    .object({
      parent: z.string().default("root"),
      id: z.string(),
    })
    .nullish()
    .default(null),
  templates: z
    .array(
      z.object({
        type: TemplateTypeSchema,
        id: z.string(),
      }),
    )
    .default([]),
});
export const ConfigFileSchema = ConfigSchema.omit({ id: true });

export type Config = z.infer<typeof ConfigSchema>;
