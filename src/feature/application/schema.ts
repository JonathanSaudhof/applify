import { z } from "zod";

export const ApplicationStateSchema = z.enum([
  "created",
  "applied",
  "interview",
  "offer",
  "rejected",
]);

export const CreateApplicationSchema = z.object({
  companyName: z.string(),
  jobTitle: z.string(),
  applicationState: ApplicationStateSchema,
  jobDescriptionUrl: z.string().url(),
});

export type CreateApplication = z.infer<typeof CreateApplicationSchema>;

export const CreateApplicationRequestSchema = z.object({
  data: CreateApplicationSchema,
  baseFolderId: z.string(),
  templates: z.array(z.object({ id: z.string(), prefix: z.string() })),
});

export type CreateApplicationRequest = z.infer<
  typeof CreateApplicationRequestSchema
>;

export const ApplicationSchema = z.object({
  folderId: z.string(),
  jobTitle: z.string().nullable(),
  jobDescriptionUrl: z.string().url().nullable(),
  applicationState: ApplicationStateSchema.nullable(),
  companyName: z.string(),
});

export type Application = z.infer<typeof ApplicationSchema>;

export type ApplicationState = z.infer<typeof ApplicationStateSchema>;

const StateUpdateEventSchema = z.object({
  date: z.date(),
  type: z.literal("stateUpdate").default("stateUpdate"),
  title: z.enum(["applied", "interview", "offer", "rejected"]),
  content: z.string(),
});

const NoteEventSchema = z.object({
  date: z.date(),
  type: z.literal("addNote"),
  title: z.string(),
  content: z.string(),
});

export const ApplicationEventSchema = z.union([
  StateUpdateEventSchema,
  NoteEventSchema,
]);

export type ApplicationEvent = z.infer<typeof ApplicationEventSchema>;
