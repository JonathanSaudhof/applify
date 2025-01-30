import { getAllFilesInFolder } from "@/feature/settings/services";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const filesRouter = createTRPCRouter({
  getFilesInFolder: protectedProcedure
    .input(z.object({ folderId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!input.folderId) {
        return await getAllFilesInFolder("root");
      }
      return await getAllFilesInFolder(input.folderId);
    }),
});
