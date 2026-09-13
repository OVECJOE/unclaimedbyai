import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AppHeader />
      <main className="min-h-screen">{children}</main>
      <AppFooter />
    </div>
  );
}
