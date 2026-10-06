import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { HeaderClient } from "./header-client";

export async function Header() {
  const user = await getAuthSession();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a8a]">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <span className="text-base font-extrabold text-[#1e3a8a]">MiniShop</span>
        </Link>

        {/* Right side */}
        <HeaderClient user={user} />
      </div>
    </header>
  );
}
