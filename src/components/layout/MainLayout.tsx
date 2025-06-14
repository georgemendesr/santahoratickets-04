
import { MainHeader } from "./MainHeader";
import { MainFooter } from "./MainFooter";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
      <MainHeader />
      <main className="flex-1">
        {children}
      </main>
      <MainFooter />
    </div>
  );
}
