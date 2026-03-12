import { Metadata } from "next";
import ViralMicrosite from "@/components/viral/ViralMicrosite";
import {
  buildViralMicrositeMetadata,
  getViralMicrosite,
} from "@/lib/viral-microsites";

const microsite = getViralMicrosite("will-you-be-my-bridesmaid");

export const metadata: Metadata = microsite
  ? buildViralMicrositeMetadata(microsite)
  : {};

export default function Page() {
  if (!microsite) return null;

  return <ViralMicrosite config={microsite} />;
}
