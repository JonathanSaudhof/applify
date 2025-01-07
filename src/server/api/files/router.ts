import { getAllFilesInFolder } from "@/feature/config/configService";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const filesRouter = createTRPCRouter({
  getFilesInFolder: protectedProcedure
    .input(z.object({ folderId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return await getAllFilesInFolder(input.folderId);
    }),
});
