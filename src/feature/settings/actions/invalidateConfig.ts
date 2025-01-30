"use server";
import cacheTags from "@/server/api/cache-tags";
import { auth } from "@/server/auth";
import { revalidateTag } from "next/cache";

export async function invalidateConfig() {
  const session = await auth();
  revalidateTag(cacheTags.config(session.user!.id!));
}
