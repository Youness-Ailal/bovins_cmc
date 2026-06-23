import Sidebar from "@/components/dashboard/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";
import AuthGuard from "@/components/dashboard/AuthGuard";
import BoviAIButton from "@/components/dashboard/BoviAIButton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden bg-surface">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            {children}
          </div>
          <BoviAIButton />
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
