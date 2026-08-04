import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { H2, A } from "@/components/legal/Prose";

export const metadata: Metadata = {
  title: "Terms of Use — Nosotrack",
  description:
    "Nosotrack terms of use — rules for accessing and using the website.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" lastUpdated="2 May 2026">
            <p>
              These Terms of Use (the &ldquo;Terms&rdquo;) govern your
              access to and use of the Nosotrack website at{" "}
              <A href="https://nosotrack.com">nosotrack.com</A> (the
              &ldquo;Site&rdquo;), which is operated by Cyril Geismar
              (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
              By accessing or using the Site, you agree to be bound by these
              Terms. If you do not agree, do not use the Site.
            </p>

            <H2>1. About the Site</H2>
            <p>
              The Site presents information about Nosotrack, a
              research-stage outbreak-forensics platform. The Site is
              informational only. It does not provide medical, clinical,
              epidemiological, legal, or other professional advice, and
              nothing on the Site should be relied on as a substitute for
              advice from a qualified professional.
            </p>

            <H2>2. Intellectual property</H2>
            <p>
              The Site and all of its contents &mdash; including the
              Nosotrack name and wordmark, the source code, designs,
              graphics, text, illustrations, layouts, and any other
              materials &mdash; are owned by Cyril Geismar and are protected
              by copyright, trademark, and other intellectual-property
              laws. All rights are reserved. The license terms applicable to
              the source code are set out in the project&rsquo;s{" "}
              <A href="https://github.com/CyGei/nosotrack/blob/main/LICENSE.txt">
                LICENSE
              </A>
              .
            </p>
            <p>
              Nosotrack&trade; is an unregistered trademark of Cyril
              Geismar.
            </p>

            <H2>3. Permitted use</H2>
            <p>
              You may access and view the Site for personal,
              non-commercial, informational purposes. You may not, without
              our prior written permission:
            </p>
            <p>
              (a) copy, reproduce, modify, adapt, translate, republish,
              distribute, transmit, display, sell, license, sublicense, or
              otherwise exploit any part of the Site or its content;
              <br />
              (b) reverse-engineer, decompile, disassemble, or attempt to
              extract the source code or underlying algorithms of any part
              of the Site;
              <br />
              (c) use the Site or its content to train, fine-tune, or
              evaluate any machine-learning or artificial-intelligence
              model;
              <br />
              (d) scrape, crawl, harvest, or otherwise extract data from the
              Site by automated means;
              <br />
              (e) frame, mirror, or republish the Site or any substantial
              portion of it; or
              <br />
              (f) use the Site in any way that violates applicable law or
              infringes the rights of any third party.
            </p>

            <H2>4. Submissions</H2>
            <p>
              If you contact us through the Site, you represent that the
              information you submit is accurate and that you are entitled
              to submit it. We treat the information you submit in
              accordance with our <A href="/privacy/">Privacy Policy</A>. We
              may use the substance of any feedback or suggestions you send
              us without obligation or compensation to you.
            </p>

            <H2>5. Third-party links</H2>
            <p>
              The Site contains links to third-party websites and
              resources, including academic publications, code repositories,
              and professional profiles. Those resources are provided for
              convenience only. We do not control them, do not endorse
              them, and are not responsible for their content, availability,
              or privacy practices.
            </p>

            <H2>6. No warranty</H2>
            <p className="font-mono text-[13px] uppercase leading-[1.65] tracking-[0.04em]">
              The Site and its content are provided on an &ldquo;as
              is&rdquo; and &ldquo;as available&rdquo; basis, without
              warranties of any kind, whether express, implied, statutory,
              or otherwise, including without limitation warranties of
              merchantability, fitness for a particular purpose,
              non-infringement, accuracy, completeness, or that the Site
              will be uninterrupted or error-free.
            </p>

            <H2>7. Limitation of liability</H2>
            <p className="font-mono text-[13px] uppercase leading-[1.65] tracking-[0.04em]">
              To the maximum extent permitted by law, in no event will Cyril
              Geismar be liable for any indirect, incidental, special,
              consequential, exemplary, or punitive damages, or for any loss
              of profits, revenues, data, goodwill, or other intangible
              losses, arising out of or in connection with your access to or
              use of, or inability to access or use, the Site or its
              content, whether based on warranty, contract, tort (including
              negligence), statute, or any other legal theory, and whether
              or not we have been advised of the possibility of such
              damages.
            </p>

            <H2>8. Changes to the Site and these Terms</H2>
            <p>
              We may modify, suspend, or discontinue the Site (or any part
              of it) at any time, with or without notice. We may also revise
              these Terms from time to time. The revised Terms will be
              posted on this page with an updated &ldquo;Last updated&rdquo;
              date. Your continued use of the Site after the revised Terms
              are posted constitutes your acceptance of the revised Terms.
            </p>

            <H2>9. Governing law and jurisdiction</H2>
            <p>
              These Terms and any dispute arising out of or in connection
              with them or the Site are governed by the laws of England and
              Wales, without regard to conflict-of-laws principles. You
              agree to submit to the exclusive jurisdiction of the courts of
              England and Wales for the resolution of any such dispute.
            </p>

            <H2>10. Severability</H2>
            <p>
              If any provision of these Terms is held to be invalid or
              unenforceable, that provision will be modified to the minimum
              extent necessary to make it enforceable, or, if it cannot be
              so modified, will be severed, and the remaining provisions
              will remain in full force and effect.
            </p>

            <H2>11. Contact</H2>
            <p>
              For any questions about these Terms, contact Cyril Geismar
              via{" "}
              <A href="https://www.linkedin.com/in/cyril-geismar/">
                LinkedIn
              </A>
              .
            </p>
    </LegalPage>
  );
}
