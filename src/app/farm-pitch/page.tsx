import { LegacyPitchRedirect } from "@/components/partners/LegacyPitchRedirect";

export const metadata = {
  title: "Nosotrack · For farms",
  alternates: { canonical: "https://nosotrack.com/for-farms/" },
  robots: { index: false },
};

export default function FarmPitchPage() {
  return <LegacyPitchRedirect href="/for-farms/" label="For farms" />;
}
