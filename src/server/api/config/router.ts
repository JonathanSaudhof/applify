import { ConfigSchema } from "@/feature/settings/model/config";
import {
  getConfigFile,
  getOrCreateConfigFile,
  updateConfigFile,
} from "@/feature/settings/services";
import { unstable_cache } from "next/cache";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import cacheTags from "../cache-tags";

export const cachedGetOrCreateConfigFile = (userId: string) =>
  unstable_cache(() => getOrCreateConfigFile(), [cacheTags.config(userId)], {
    tags: [cacheTags.config(userId)],
  });

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
});
