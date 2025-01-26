import {
  ApplicationStateSchema,
  CreateApplicationSchema,
} from "@/feature/application/schema";
import applicationService from "@/feature/application/service";
import { getOrCreateConfigFile } from "@/feature/settings/services";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import cacheTags from "../cache-tags";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const cachedApplications = (userId: string) =>
  unstable_cache(
    (folderId: string, filterFolderId?: string) =>
      applicationService.getAllApplications({
        folderId,
        userId,
        filterFolderId,
      }),
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

      // await applicationService.createNewApplication({
      //   data: input,
      //   baseFolderId: config?.folderId,
      //   templateDocId: config?.defaultCvTemplateDocId: string | null,
      // });
    }),
  getAllApplications: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const config = await getOrCreateConfigFile();
      const applications = await cachedApplications(ctx.session.user.id!)(
        input.folderId,
        config.templateFolder?.id,
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
