import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/server/auth";
import { ListIcon, LogOut, MenuIcon, Settings } from "lucide-react";

import Link from "next/link";

export function Menu() {
  const handleOutputClick = async () => {
    "use server";
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <MenuIcon className="h-6 w-6 text-xl" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={26} className="w-72">
        <DropdownMenuLabel>Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/" className="flex w-full items-center gap-2">
            <ListIcon />
            Applications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/settings" className="flex w-full items-center gap-2">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <button
            className="flex w-full items-center gap-2"
            onClick={handleOutputClick}
          >
            <LogOut />
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
