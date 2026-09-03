"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { isGeneratorComposePath, type CardMaker } from "@/lib/nav-config";
import { VIRAL_MICROSITE_PATHS } from "@/lib/viral-microsites";

interface AppShellProps {
  children: ReactNode;
  cardMakers: CardMaker[];
}

const CHROMELESS_PREFIXES = ["/to/", ...VIRAL_MICROSITE_PATHS.map((path) => path.slice(0, -1))];

export default function AppShell({ children, cardMakers }: AppShellProps) {
  const pathname = usePathname() || "/";
  const hideChrome = CHROMELESS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const headerVariant = isGeneratorComposePath(pathname, cardMakers) ? "compose" : "default";

  return (
    <div className="flex min-h-screen flex-col">
      {!hideChrome && <Header variant={headerVariant} cardMakers={cardMakers} />}
      <div className="flex-grow">{children}</div>
      {!hideChrome && <Footer />}
    </div>
  );
}
