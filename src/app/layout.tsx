import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { invalidateApplicationsList } from "@/feature/application/components/actions/revalidation";
import CreateApplication from "@/feature/application/components/create-application";
import { Menu } from "@/feature/settings/components/menu";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";
import { RefreshCw } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Applify",
  description: "Manage your job applications in google drive    ",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <HydrateClient>{children}</HydrateClient>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
