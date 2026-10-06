import { Suspense } from "react";
import { Header } from "@/components/layouts/header";
import { Catalog } from "@/components/product/catalog";

export default function HomePage() {
  return (
    <div className="pb-16 md:pb-0">
      <Header />
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a8a] border-t-transparent" />
        </div>
      }>
        <Catalog />
      </Suspense>
    </div>
  );
}
