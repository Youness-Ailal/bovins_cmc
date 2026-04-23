import AuthBrand from "@/components/auth/AuthBrand";

/**
 * Auth split layout: 540px brand panel (lg+) + flex-1 white form panel.
 * Form panel padding matches design: 80px horizontal, 48px vertical.
 */
export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <AuthBrand />
      <main className="flex flex-1 items-center justify-center bg-white px-20 py-12 overflow-auto">
        {children}
      </main>
    </div>
  );
}
