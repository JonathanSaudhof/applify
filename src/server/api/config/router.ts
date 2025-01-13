import {
  getConfigFile,
  getOrCreateConfigFile,
  updateConfigFile,
} from "@/feature/file-explorer/services";
import gDriveService from "@/lib/google/drive";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const cachedGetOrCreateConfigFile = (userId: string) =>
  unstable_cache(() => getOrCreateConfigFile(), [`config-${userId}`], {
    tags: [`config-${userId}`],
  });

const cachedGetTemplateFile = (userId: string) =>
  unstable_cache(
    (documentId: string) => gDriveService.getDocumentById(documentId),
    [`template-${userId}`],
    {
      tags: [`config-${userId}`, `template-${userId}`],
    },
  );

export const configRouter = createTRPCRouter({
  getConfigFile: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx;
    const config = await cachedGetOrCreateConfigFile(session.user.id!)();

    return config;
  }),
  updateConfigFile: protectedProcedure
    .input(
      z.object({
        folderId: z.string().nullable(),
        defaultTemplateDocId: z.string().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      const { folderId, defaultTemplateDocId } = input;

      const config = await getConfigFile();
      if (!config) {
        console.error("Config file not found");
        return null;
      }

      await updateConfigFile({
        ...config,
        folderId: folderId ?? config.folderId,
        defaultCvTemplateDocId: string | null:
          defaultTemplateDocId ?? config.defaultCvTemplateDocId: string | null,
      });

      return await getConfigFile();
    }),
  getTemplateFile: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx;
    const config = await cachedGetOrCreateConfigFile(session.user.id!)();

    if (!config.defaultCvTemplateDocId: string | null) {
      console.error("Default template doc id not found");
      return null;
    }

    const document = await cachedGetTemplateFile(session.user.id!)(
      config.defaultCvTemplateDocId: string | null,
    );

    return document;
  }),
});
