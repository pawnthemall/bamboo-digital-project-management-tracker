import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TimerWidget from "@/components/TimerWidget";
import AccentColorProvider from "@/components/AccentColorProvider";
import Providers from "@/components/Providers";
import CommandPalette from "@/components/CommandPalette";
import PageTransition from "@/components/PageTransition";
import ErrorBoundary from "@/components/ErrorBoundary";
import ToastContainer from "@/components/ToastContainer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <ErrorBoundary>
              <PageTransition>{children}</PageTransition>
            </ErrorBoundary>
          </main>
        </div>
        <TimerWidget />
        <AccentColorProvider />
        <CommandPalette />
        <ToastContainer />
      </div>
    </Providers>
  );
}
