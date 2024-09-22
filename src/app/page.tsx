import { Metadata } from "next";
import BirthdayCardGenerator from "@/components/birthday-card-generator";

export const metadata: Metadata = {
  title: "MewTruCard - AI Birthday Card Generator",
  description: "Create personalized birthday cards with our AI-powered generator",
};

export default function Home() {
  return (
    <main>
      <BirthdayCardGenerator />
    </main>
  );
}