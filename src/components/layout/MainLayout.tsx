
import { MainHeader } from "./MainHeader";
import { MainFooter } from "./MainFooter";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary">
      <MainHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <MainFooter />
    </div>
  );
}
