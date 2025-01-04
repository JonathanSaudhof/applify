import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import FileExplorer from "@/feature/file-explorer/FileExplorer";
import { TRPCReactProvider } from "@/trpc/react";
import { api, HydrateClient } from "@/trpc/server";
import { FileInput } from "lucide-react";

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
              <div className="flex gap-4">
                <FileInput />
                <h1 className="text-2xl font-semibold">Applify Moep</h1>
              </div>
              <FileExplorer defaultTemplateId={template?.documentId ?? null} />
            </header>
            {children}
          </HydrateClient>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
