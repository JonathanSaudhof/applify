import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import FileExplorer from "@/feature/file-explorer/FileExplorer";
import { TRPCReactProvider } from "@/trpc/react";
import { api, HydrateClient } from "@/trpc/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Applify",
  description: "Manage your job applications in google drive    ",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const template = await api.config.getTemplateFile();

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <HydrateClient>
            <header className="flex justify-between border-b-2 px-8 py-4">
              <Link href="/">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🚀</span>
                  <h1 className="text-2xl font-semibold">Applify</h1>
                </div>
              </Link>
              <FileExplorer defaultTemplateId={template?.documentId ?? null} />
            </header>
            {children}
          </HydrateClient>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
