import RoleGuard from "@/components/dashboard/RoleGuard";

export default function AdministrationLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow={["Admin"]}>{children}</RoleGuard>;
}
