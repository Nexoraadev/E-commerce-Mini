import { Header } from "@/components/layouts/header";

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
