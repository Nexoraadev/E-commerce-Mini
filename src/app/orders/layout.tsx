import { Header } from "@/components/layouts/header";

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
