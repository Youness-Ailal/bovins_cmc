import Sidebar from "@/components/dashboard/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";
import AuthGuard from "@/components/dashboard/AuthGuard";
import { AlertsProvider } from "@/contexts/AlertsContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ToastProvider>
        <AlertsProvider>
          <div className="flex h-screen overflow-hidden bg-surface">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </div>
        </AlertsProvider>
      </ToastProvider>
    </AuthGuard>
  );
}
