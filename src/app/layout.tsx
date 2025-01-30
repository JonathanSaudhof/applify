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
  const handleRefresh = async () => {
    "use server";
    await invalidateApplicationsList();
  };

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <HydrateClient>
              <header className="flex justify-between border-b-2 px-8 py-4">
                <Link href="/">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🚀</span>
                    <h1 className="text-2xl font-semibold">Applify</h1>
                  </div>
                </Link>
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={handleRefresh}>
                    <RefreshCw />
                  </Button>
                  <CreateApplication />
                  <Menu />
                </div>
              </header>
              {children}
            </HydrateClient>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
