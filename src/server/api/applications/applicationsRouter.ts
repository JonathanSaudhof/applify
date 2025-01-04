import { CreateApplicationSchema } from "@/feature/application/schema";
import applicationService from "@/feature/application/service";
import { getOrCreateConfigFile } from "@/feature/file-explorer/services";
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

const cachedGetApplicationById = (applicationId: string, userId: string) =>
  unstable_cache(
    () => applicationService.getApplicationById({ applicationId }),
    [cacheTags.applications.details(applicationId)],
    {
      tags: [
        cacheTags.applications.details(userId),
        cacheTags.applications.metadata(applicationId),
      ],
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

      if (!config.defaultTemplateDocId) {
        throw new Error("Config file is missing defaultTemplateDocId");
      }

      await applicationService.createNewApplication({
        data: input,
        baseFolderId: config?.folderId,
        templateDocId: config?.defaultTemplateDocId,
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
    .query(async ({ input, ctx }) => {
      const data = await applicationService.getApplicationById({
        applicationId: input.applicationId,
      });

      return data;
    }),
});
