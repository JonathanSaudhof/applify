import Link from "next/link";
import { Menu } from "./menu";

export function SettingsLayout() {
  return (
    <header className="flex justify-between border-b-2 px-8 py-4">
      <Link href="/">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🚀</span>
          <h1 className="text-2xl font-semibold">Applify</h1>
        </div>
      </Link>
      <div className="flex items-center gap-4">
        <Menu />
      </div>
    </header>
  );
}
