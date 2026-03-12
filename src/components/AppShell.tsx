"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { VIRAL_MICROSITE_PATHS } from "@/lib/viral-microsites";

interface AppShellProps {
  children: ReactNode;
}

const CHROMELESS_PREFIXES = ["/to/", ...VIRAL_MICROSITE_PATHS.map((path) => path.slice(0, -1))];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() || "/";
  const hideChrome = CHROMELESS_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className="flex min-h-screen flex-col">
      {!hideChrome && <Header />}
      <div className="flex-grow">{children}</div>
      {!hideChrome && <Footer />}
    </div>
  );
}
