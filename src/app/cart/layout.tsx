import { Header } from "@/components/layouts/header";

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
