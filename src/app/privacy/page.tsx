/**
 * /privacy — Privacy Policy (ported from legacy/privacy.html).
 *
 * Narrow prose-first column on the standard cream canvas. Uses the v4
 * design tokens (font-display, font-mono, text-ink/mute, color-alert)
 * and the section-pad / container-page utilities defined in globals.css.
 * No client interactivity — pure static legal page.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — NosoTrack",
  description:
    "NosoTrack privacy policy — what we collect, why, and how to contact us.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "2 May 2026";

export default function PrivacyPage() {
  return (
    <>
      <Nav />

      <main id="top" className="bg-bg">
        <article className="mx-auto max-w-[720px] px-6 pb-[clamp(64px,10vh,120px)] pt-[clamp(96px,12vh,160px)]">
          <Link
            href="/"
            className="mb-8 inline-block font-mono text-[12px] text-mute transition-colors hover:text-ink"
          >
            ← Back to NosoTrack
          </Link>

          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
            Legal
          </div>

          <h1 className="mb-2 font-display text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-tight text-ink">
            Privacy Policy
          </h1>

          <p className="mb-12 font-mono text-[12px] text-mute">
            Last updated: {LAST_UPDATED}
          </p>

          <Prose>
            <p>
              This Privacy Policy explains what personal information is
              collected when you use the NosoTrack website at{" "}
              <A href="https://nosotrack.com">nosotrack.com</A> (the
              &ldquo;Site&rdquo;), how that information is used, and the
              choices you have. The Site is operated by Cyril Geismar
              (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
            </p>

            <H2>1. What we collect</H2>
            <p>
              The Site collects personal information only when you
              voluntarily submit it through the contact form. The fields
              collected are: your <strong>name</strong>, your{" "}
              <strong>email address</strong>, and the{" "}
              <strong>message</strong> you write.
            </p>
            <p>
              The Site does not use analytics, advertising trackers,
              third-party cookies, fingerprinting, or any other mechanism
              designed to identify or track visitors. The Site does not set
              first-party cookies for tracking. Standard, anonymous server
              logs may be kept by our hosting provider for security and
              operational purposes.
            </p>

            <H2>2. Why we collect it</H2>
            <p>
              The information you submit through the contact form is used
              solely to read your message and reply to you. We do not use
              it for marketing, profiling, or any automated decision-making,
              and we do not sell, rent, or share it with anyone for
              marketing purposes.
            </p>

            <H2>3. Who processes it</H2>
            <p>
              The contact form is delivered using{" "}
              <A href="https://formspree.io">Formspree</A>, a third-party
              form-processing service. When you submit the form, the
              information you provide is transmitted to Formspree, which
              forwards it to us by email. Formspree therefore acts as a data
              processor on our behalf. Formspree&rsquo;s own privacy
              practices are described at{" "}
              <A href="https://formspree.io/legal/privacy-policy">
                formspree.io/legal/privacy-policy
              </A>
              .
            </p>

            <H2>4. Where we store it</H2>
            <p>
              Once forwarded by Formspree, your message and the information
              you submitted are stored in our email account with our email
              provider (Google). It is retained for as long as we may
              reasonably need it to respond to you and to keep a record of
              correspondence, and is deleted on request.
            </p>

            <H2>5. Your rights</H2>
            <p>
              Depending on where you live, you may have the right to access,
              correct, delete, or restrict the processing of personal
              information we hold about you, the right to object to
              processing, and the right to data portability. Residents of
              the European Economic Area, the United Kingdom, and California
              (and certain other jurisdictions) have specific statutory
              rights of this kind under the GDPR, the UK GDPR, and the CCPA
              respectively.
            </p>
            <p>
              To exercise any of these rights, or to ask us to delete
              information you have submitted, contact us at the address
              below. We will respond within a reasonable period, and at the
              latest within the period required by applicable law.
            </p>

            <H2>6. Children</H2>
            <p>
              The Site is not directed to children under 16, and we do not
              knowingly collect personal information from children. If you
              believe a child has submitted personal information, please
              contact us so that we can delete it.
            </p>

            <H2>7. Security</H2>
            <p>
              We use industry-standard measures to protect the information
              you submit, including transport encryption (HTTPS) for the
              contact form. No method of transmission or storage is
              perfectly secure, however, and we cannot guarantee absolute
              security.
            </p>

            <H2>8. International transfers</H2>
            <p>
              Because Formspree and our email provider operate from the
              United States, information you submit may be transferred to,
              stored in, and processed in the United States and other
              countries whose data-protection laws may differ from those in
              your country of residence. By submitting the contact form, you
              consent to such transfers.
            </p>

            <H2>9. Changes to this policy</H2>
            <p>
              We may update this Privacy Policy from time to time. The
              &ldquo;Last updated&rdquo; date at the top of this page
              indicates when it was most recently revised. Material changes
              will be reflected by updating that date.
            </p>

            <H2>10. Contact</H2>
            <p>
              For any questions, requests, or complaints relating to this
              Privacy Policy or your personal information, contact Cyril
              Geismar via{" "}
              <A href="https://www.linkedin.com/in/cyril-geismar/">
                LinkedIn
              </A>
              .
            </p>
          </Prose>
        </article>
      </main>

      <Footer />
    </>
  );
}

/* ── shared inline helpers (kept local so the page is one self-contained file) */

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 text-[15px] leading-[1.7] text-text [&_strong]:font-medium [&_strong]:text-ink">
      {children}
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 font-display text-[18px] font-semibold leading-[1.3] tracking-[-0.01em] text-ink">
      {children}
    </h2>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="underline underline-offset-[3px] transition-colors hover:text-alert"
    >
      {children}
    </a>
  );
}
