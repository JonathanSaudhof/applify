import {
  ApplicationStateSchema,
  CreateApplicationSchema,
} from "@/feature/application/schema";
import applicationService from "@/feature/application/service";
import { getOrCreateConfigFile } from "@/feature/config/configService";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import cacheTags from "../cache-tags";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const cachedApplications = (userId: string) =>
  unstable_cache(
    (folderId: string) =>
      applicationService.getAllApplications({ folderId, userId }),
    [cacheTags.applications.list(userId)],
    {
      tags: [cacheTags.applications.list(userId)],
      revalidate: 60 * 60,
    },
  );

export const applicationsRouter = createTRPCRouter({
  createApplication: protectedProcedure
    .input(CreateApplicationSchema)
    .mutation(async ({ input }) => {
      const config = await getOrCreateConfigFile();

      if (!config.folderId) {
        throw new Error("Config file is missing folderId");
      }

      if (!config.cvTemplateDocId) {
        throw new Error("Config file is missing cvTemplateDocId");
      }

      await applicationService.createNewApplication({
        data: input,
        baseFolderId: config?.folderId,
        cvTemplateDocId: config?.cvTemplateDocId,
        coverLetterTemplateDocId: input.withCoverLetter
          ? config?.coverLetterTemplateDocId
          : null,
      });
    }),
  getAllApplications: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const applications = await cachedApplications(ctx.session.user.id!)(
        input.folderId,
      );
      return applications;
    }),
  getApplicationById: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const data = await applicationService.getApplicationById({
        applicationId: input.applicationId,
      });

      return data;
    }),
  updateApplicationState: protectedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        state: ApplicationStateSchema,
      }),
    )
    .mutation(async ({ input }) => {
      await applicationService.updateApplicationState(input);
    }),
});
