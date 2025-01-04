import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { filesRouter } from "./files/router";
import { configRouter } from "./config/router";
import { applicationsRouter } from "./applications/applicationsRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  files: filesRouter,
  config: configRouter,
  applications: applicationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
