import { Header } from "@/components/layouts/header";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
