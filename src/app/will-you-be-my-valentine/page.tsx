import { Metadata } from "next";
import dynamic from "next/dynamic";

// Client component loaded dynamically with no SSR
const ValentineCard = dynamic(() => import("./valentine-card"), { ssr: false });

export const metadata: Metadata = {
  title: "Will You Be My Valentine? | Interactive Valentine's Day Card",
  description: "Send a fun, interactive Valentine's Day invitation with this playful virtual card. Watch as your recipient tries to say 'No' but can't resist saying 'Yes'!",
  openGraph: {
    title: "Will You Be My Valentine?",
    description: "Send this interactive Valentine's Day card to your special someone",
    images: [
      {
        url: "https://store.celeprime.com/cute-love-bear-roses-ou7zho5oosxnpo6k.gif",
        width: 600,
        height: 600,
        alt: "Valentine's Day Card with Cute Bear",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Will You Be My Valentine?",
    description: "Send this interactive Valentine's Day card to your special someone",
    images: ["https://store.celeprime.com/cute-love-bear-roses-ou7zho5oosxnpo6k.gif"],
  },
  alternates: {
    canonical: "/will-you-be-my-valentine/",
  },
};

export default function Page() {
  return <ValentineCard />;
}
