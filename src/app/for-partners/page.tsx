import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PartnerChoices } from "./PartnerChoices";
import styles from "./partners.module.css";

export const metadata: Metadata = {
  title: "Nosotrack · For partners",
  description: "Outbreak forensics and control for hospitals and farms. Explore partnering with Nosotrack.",
  alternates: { canonical: "https://nosotrack.com/for-partners/" },
};

export default function PartnersPage() {
  return (
    <>
      <Nav standalone />
      <main className={`${styles.main} container-page`}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>For partners</p>
          <h1>Better outbreak investigation and control.<br />Together.</h1>
          <p>Explore what Nosotrack can do for you.</p>
        </header>
        <PartnerChoices />
      </main>
      <Footer standalone />
    </>
  );
}
