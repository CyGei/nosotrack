import { LegacyPitchRedirect } from "@/components/partners/LegacyPitchRedirect";

export const metadata = {
  title: "Nosotrack · For hospitals",
  alternates: { canonical: "https://nosotrack.com/for-hospitals/" },
  robots: { index: false },
};

export default function PitchPage() {
  return <LegacyPitchRedirect href="/for-hospitals/" label="For hospitals" />;
}
