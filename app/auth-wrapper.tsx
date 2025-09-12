"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import ConditionalLayout from "./conditional-layout";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Pages that should not have any auth context at all
  const authFreePages = ["/", "/debug"];
  const isAuthFreePage = authFreePages.includes(pathname);

  // If it's an auth-free page, render without any auth context
  if (isAuthFreePage) {
    return <>{children}</>;
  }

  // For all other pages, provide auth context and conditional layout
  return (
    <AuthProvider>
      <ConditionalLayout>{children}</ConditionalLayout>
    </AuthProvider>
  );
}
