import {
  getConfigFile,
  getOrCreateConfigFile,
  updateConfigFile,
} from "@/feature/file-explorer/services";
import { ConfigSchema } from "@/feature/settings/model/config";
import gDriveService from "@/lib/google/drive";
import { unstable_cache } from "next/cache";
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
    .input(ConfigSchema)
    .mutation(async ({ input }) => {
      await updateConfigFile(input);
      return await getConfigFile();
    }),
  getTemplateFile: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx;
    const config = await cachedGetOrCreateConfigFile(session.user.id!)();

    // if (!config.defaultCvTemplateDocId: string | null) {
    //   console.error("Default template doc id not found");
    //   return null;
    // }

    // const document = await cachedGetTemplateFile(session.user.id!)(
    //   config.defaultCvTemplateDocId: string | null,
    // );

    return {};
  }),
});
