"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui";

import { authClient } from "@/lib/auth/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={({ href, ...props }) => <Link href={href} {...props} />}
      redirectTo="/boards"
      defaultTheme="system"
    >
      {children}
    </NeonAuthUIProvider>
  );
}
