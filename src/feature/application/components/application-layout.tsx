import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import CreateApplication from "./create-application";
import Link from "next/link";
import { invalidateApplicationsList } from "./actions/revalidation";
import { Menu } from "@/feature/settings/components/menu";

export default function ApplicationLayout() {
  const handleRefresh = async () => {
    "use server";
    await invalidateApplicationsList();
  };

  return (
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
  );
}
