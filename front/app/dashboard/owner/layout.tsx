"use client";

// This layout is no longer needed as we now use the unified layout in /dashboard/layout.tsx
export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
