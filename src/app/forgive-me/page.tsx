import { Metadata } from "next";
import { Suspense } from "react";
import ChaosGameExperience, {
  ChaosGameExperienceConfig,
} from "@/components/viral/ChaosGameExperience";
import {
  buildViralMicrositeMetadata,
  getViralMicrosite,
} from "@/lib/viral-microsites";

const microsite = getViralMicrosite("forgive-me");

export const metadata: Metadata = microsite
  ? buildViralMicrositeMetadata(microsite)
  : {};

const config: ChaosGameExperienceConfig = {
  path: "/forgive-me/",
  theme: "mint",
  creatorBadge: "Interactive apology game",
  creatorHeading: "Send an apology they cannot dodge.",
  creatorDescription:
    "Build a share link with names and launch the apology mini game where 'not yet' keeps escaping.",
  questionTemplate: "Can I make it up to you, {to}?",
  yesLabel: "Okay, maybe",
  noPhrases: [
    "Not yet",
    "Still not yet?",
    "I wrote a full apology",
    "I even brought snacks",
    "Please hear me out",
    "I can do better",
    "One more chance?",
    "Final apology mode",
  ],
  acceptedLines: [
    "Diplomatic relations restored.",
    "Peace treaty signed with extra sincerity.",
    "The apology arc has a happy ending.",
  ],
  acceptedWord: "FORGIVEN!",
  acceptedShareTemplate: "{to} accepted the apology!",
  creatorShareTemplate: "Can I make it up to you, {to}?",
  ctaHref: "/sorry/",
  ctaLabel: "Create a sorry card",
  previewGif: "/images/style-presets/apology-sorry-kitten.gif",
  previewGifAlt: "Apology kitten gif",
  acceptedGif: "/images/style-presets/bear-kiss-bear-kisses.gif",
  acceptedGifAlt: "Cute reconciliation gif",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[100dvh] bg-gradient-to-br from-rose-100 via-pink-100 to-orange-50" />
      }
    >
      <ChaosGameExperience config={config} />
    </Suspense>
  );
}
