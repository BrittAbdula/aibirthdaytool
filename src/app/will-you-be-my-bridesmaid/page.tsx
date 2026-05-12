import { Metadata } from "next";
import { Suspense } from "react";
import ChaosGameExperience, {
  ChaosGameExperienceConfig,
} from "@/components/viral/ChaosGameExperience";
import {
  buildViralMicrositeMetadata,
  getViralMicrosite,
} from "@/lib/viral-microsites";

const microsite = getViralMicrosite("will-you-be-my-bridesmaid");

export const metadata: Metadata = microsite
  ? buildViralMicrositeMetadata(microsite)
  : {};

const config: ChaosGameExperienceConfig = {
  path: "/will-you-be-my-bridesmaid/",
  theme: "violet",
  creatorBadge: "Interactive best friend game",
  creatorHeading: "Send a best-friend ask with chaotic energy.",
  creatorDescription:
    "Generate a share link, then let the 'hmm' button run for its life until your bestie taps yes.",
  questionTemplate: "Will you be my best friend forever, {to}?",
  yesLabel: "Bestie forever",
  noPhrases: [
    "Hmm...",
    "That sounds uncertain",
    "Bestie audit running",
    "We already share memes",
    "Friendship contract ready",
    "Snacks included",
    "Say yes, legend",
    "Final bestie warning",
  ],
  acceptedLines: [
    "Legendary friendship mode unlocked.",
    "Bestie status now official and permanent.",
    "You two just upgraded to elite friend tier.",
  ],
  acceptedWord: "BESTIES!",
  acceptedShareTemplate: "{to} said yes to bestie forever!",
  creatorShareTemplate: "Will you be my best friend forever, {to}?",
  ctaHref: "/wedding/",
  ctaLabel: "Create a keepsake card",
  previewGif: "/images/style-presets/best-friend-hug.gif",
  previewGifAlt: "Best friend hug gif",
  acceptedGif: "/images/style-presets/bear-kiss-bear-kisses.gif",
  acceptedGifAlt: "Cute celebration gif",
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
