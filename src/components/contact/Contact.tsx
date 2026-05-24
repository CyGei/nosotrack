"use client";

/**
 * Contact — ported from main branch (legacy/styles.css §16 #contact).
 *
 * Dark two-column band (matches the hero so the page bookends in ink):
 *   ┌─────────────────────────────┬───────────────────────────────┐
 *   │ CONTACT                       │ Name                          │
 *   │ Let's Work Together           │ ────────────                  │
 *   │ subtitle…                     │ Email                         │
 *   │                               │ ────────────                  │
 *   │ ⓘ github  ⓘ linkedin          │ Message                       │
 *   │                               │ ────────────                  │
 *   │                               │ [ Send Message ]              │
 *   └─────────────────────────────┴───────────────────────────────┘
 *
 * Inputs are borderless except for a hairline at the bottom that lifts
 * to cream on focus — the on-dark form pattern from main.
 */

import { useState } from "react";
import { Github, Linkedin } from "lucide-react";
import { contact } from "@/lib/content";

type State = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    try {
      const data = new FormData(form);
      const res = await fetch(contact.formAction, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("submit failed");
      setState("sent");
      form.reset();
    } catch {
      setState("error");
      setTimeout(() => form.submit(), 200);
    }
  }

  return (
    <section
      id="contact"
      className="on-dark section-pad border-t border-rule-inv bg-bg-ink"
      aria-label="Contact"
    >
      <div className="container-page">
        <div className="grid grid-cols-1 gap-y-14 md:grid-cols-2 md:gap-x-24">
          {/* LEFT — heading, subtitle, social channels */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-inv-hi">
              {contact.tag}
            </p>
            <h2 className="mt-4 font-display font-medium leading-[1.04] tracking-[-0.035em] text-inv-hi text-[clamp(2.4rem,4.5vw,3.5rem)] max-w-[16ch]">
              {contact.title.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-8 max-w-[640px] text-[16px] leading-[1.7] tracking-[-0.005em] text-inv">
              {contact.subtitle}
            </p>

            <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-5">
              <a
                href={contact.github.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-inv-mute transition-colors hover:text-inv-hi"
              >
                <Github className="h-[20px] w-[20px]" strokeWidth={1.6} />
                {contact.github.label}
              </a>
              <a
                href={contact.linkedin.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-inv-mute transition-colors hover:text-inv-hi"
              >
                <Linkedin className="h-[20px] w-[20px]" strokeWidth={1.6} />
                {contact.linkedin.label}
              </a>
            </div>
          </div>

          {/* RIGHT — Formspree form */}
          <div>
            <form
              action={contact.formAction}
              method="POST"
              onSubmit={handleSubmit}
              className="contact-form-dark"
            >
              <Field
                label={contact.formLabels.name}
                name="name"
                type="text"
                required
              />
              <Field
                label={contact.formLabels.email}
                name="email"
                type="email"
                required
              />
              <Field
                label={contact.formLabels.message}
                name="message"
                as="textarea"
                required
              />

              <div className="mt-3 flex items-center gap-5">
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="inline-flex items-center gap-2 border border-inv-hi bg-inv-hi px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-bg-ink transition-colors duration-[var(--transition-duration-fast)] hover:bg-transparent hover:text-inv-hi disabled:opacity-50"
                >
                  {state === "sending"
                    ? "Transmitting…"
                    : contact.formButtons.submit}
                  <span aria-hidden>↗</span>
                </button>
                <button
                  type="reset"
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-inv-mute underline-offset-4 hover:text-inv-hi hover:underline"
                  onClick={() => setState("idle")}
                >
                  {contact.formButtons.reset}
                </button>
              </div>

              {state === "sent" && (
                <p
                  role="status"
                  className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-inv-hi"
                >
                  <span
                    className="inline-block h-[6px] w-[6px] rounded-full bg-alert"
                    aria-hidden
                  />
                  Transmitted. We&apos;ll be in touch.
                </p>
              )}
              {state === "error" && (
                <p
                  role="status"
                  className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-inv-mute"
                >
                  Transmit failed — opening Formspree as a fallback.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Form styling — borderless inputs except the bottom hairline,
          ported from main legacy/styles.css. */}
      <style>{`
        .contact-form-dark label {
          display: block;
          margin-top: 18px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-inv-mute);
          margin-bottom: 6px;
        }
        .contact-form-dark label:first-of-type { margin-top: 0; }
        .contact-form-dark input,
        .contact-form-dark textarea {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--color-rule-inv-strong);
          padding: 10px 0;
          color: var(--color-inv-hi);
          font-family: var(--font-display);
          font-size: 16px;
          outline: none;
          transition: border-color var(--transition-duration-fast);
        }
        .contact-form-dark textarea {
          resize: vertical;
          min-height: 110px;
        }
        .contact-form-dark input:focus,
        .contact-form-dark textarea:focus {
          border-bottom-color: var(--color-inv-hi);
        }
      `}</style>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Field({
  label,
  name,
  type = "text",
  as = "input",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  as?: "input" | "textarea";
  required?: boolean;
}) {
  return (
    <label>
      <span>
        {label}
        {required && (
          <span className="ml-1 text-alert" aria-hidden>
            •
          </span>
        )}
      </span>
      {as === "textarea" ? (
        <textarea name={name} required={required} rows={4} />
      ) : (
        <input name={name} type={type} required={required} />
      )}
    </label>
  );
}
