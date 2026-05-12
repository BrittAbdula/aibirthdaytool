import { Metadata } from "next";
import { Suspense } from "react";
import ChaosGameExperience, {
  ChaosGameExperienceConfig,
} from "@/components/viral/ChaosGameExperience";
import {
  buildViralMicrositeMetadata,
  getViralMicrosite,
} from "@/lib/viral-microsites";

const microsite = getViralMicrosite("open-your-birthday-surprise");

export const metadata: Metadata = microsite
  ? buildViralMicrositeMetadata(microsite)
  : {};

const config: ChaosGameExperienceConfig = {
  path: "/open-your-birthday-surprise/",
  theme: "amber",
  creatorBadge: "Interactive birthday surprise game",
  creatorHeading: "Send a birthday surprise they cannot postpone.",
  creatorDescription:
    "Type both names, generate a share link, then watch the 'later' button panic and run.",
  questionTemplate: "Open your birthday surprise, {to}?",
  yesLabel: "Open it now",
  noPhrases: [
    "Later",
    "Later later?",
    "Come on birthday star",
    "Cake is getting impatient",
    "One tiny click",
    "The balloons voted yes",
    "No more excuses",
    "Open it already",
  ],
  acceptedLines: [
    "Excellent choice. The cake committee approves.",
    "Birthday magic unlocked right on schedule.",
    "You just saved the candles from melting.",
  ],
  acceptedWord: "OPENED IT!",
  acceptedShareTemplate: "{to} opened the birthday surprise!",
  creatorShareTemplate: "Open your birthday surprise, {to}?",
  ctaHref: "/birthday/",
  ctaLabel: "Create a birthday card",
  previewGif: "/images/style-presets/birthday-bear-party.gif",
  previewGifAlt: "Birthday bear party gif",
  acceptedGif: "/images/style-presets/bear-kiss-bear-kisses.gif",
  acceptedGifAlt: "Celebration bear gif",
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
