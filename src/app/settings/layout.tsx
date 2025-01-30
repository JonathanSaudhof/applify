import { SettingsLayout } from "@/feature/settings/components/settings-layout";

export default function SettingsPageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SettingsLayout />
      {children}
    </>
  );
}
