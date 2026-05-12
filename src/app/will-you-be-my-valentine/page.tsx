import { Metadata } from "next";
import { Suspense } from "react";
import {
  buildViralMicrositeMetadata,
  getViralMicrosite,
} from "@/lib/viral-microsites";
import ValentineExperience from "./valentine-experience";

const microsite = getViralMicrosite("will-you-be-my-valentine");

export const metadata: Metadata = microsite
  ? buildViralMicrositeMetadata(microsite)
  : {};

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[100dvh] bg-gradient-to-br from-rose-100 via-pink-100 to-orange-50" />
      }
    >
      <ValentineExperience />
    </Suspense>
  );
}
