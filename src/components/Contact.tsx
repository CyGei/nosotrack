"use client";

import { useState } from "react";
import { Github, Linkedin } from "lucide-react";

const CONTACT_TITLE = ["Let’s work", "together."];
const CONTACT_SUBTITLE =
  "We are actively seeking collaborations and funding. Please reach out!";
const GITHUB = {
  url: "https://github.com/CyGei",
};
const LINKEDIN = {
  url: "https://www.linkedin.com/in/cyril-geismar-900926240/",
};
const FORM_ACTION = "https://formspree.io/f/maqdqzqw";

type State = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    try {
      const data = new FormData(form);
      const res = await fetch(FORM_ACTION, {
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
      data-story-chapter
      data-story-side="left"
      data-story-end
      className="on-dark section-pad border-t border-rule-inv bg-bg-ink"
      aria-label="Contact"
    >
      <div className="container-page">
        <div data-story-fork>
          <div data-story-branch data-story-intro>
            <h2
              data-story-title
              className="font-display font-normal leading-[1.05] tracking-tight text-inv-hi text-[clamp(40px,4.5vw,64px)]"
            >
              {CONTACT_TITLE.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="max-w-[30ch] font-display text-[20px] font-normal leading-[1.45] tracking-[-0.015em] text-inv">
              {CONTACT_SUBTITLE}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              <a
                href={GITHUB.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-[14px] text-inv transition-colors hover:text-inv-hi"
              >
                <Github className="h-[20px] w-[20px] shrink-0" strokeWidth={1.6} />
                GitHub
              </a>
              <a
                href={LINKEDIN.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-[14px] text-inv transition-colors hover:text-inv-hi"
              >
                <Linkedin className="h-[20px] w-[20px] shrink-0" strokeWidth={1.6} />
                LinkedIn
              </a>
            </div>
          </div>

          <div data-story-branch>
            <form
              action={FORM_ACTION}
              method="POST"
              onSubmit={handleSubmit}
              className="contact-form-dark"
            >
              <Field label="Name" name="name" type="text" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Message" name="message" as="textarea" required />

              <div className="mt-3 flex flex-wrap items-center gap-5">
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="inline-flex items-center gap-2 border border-inv-hi bg-inv-hi px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-bg-ink transition-colors duration-[var(--transition-duration-fast)] hover:bg-transparent hover:text-inv-hi disabled:opacity-50"
                >
                  {state === "sending" ? "Transmitting…" : "Send Message"}
                  <span aria-hidden>↗</span>
                </button>
                <button
                  type="reset"
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-inv-mute underline-offset-4 hover:text-inv-hi hover:underline"
                  onClick={() => setState("idle")}
                >
                  Reset
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

      <style>{`
        .contact-form-dark button[type="submit"] {
          min-height: 44px;
          padding: 12px 22px;
          border: 1px solid var(--color-inv-hi);
          background: var(--color-inv-hi);
          color: var(--color-bg-ink);
          font-size: 12px;
          letter-spacing: 0.08em;
        }
        .contact-form-dark button[type="submit"]:hover {
          background: transparent;
          color: var(--color-inv-hi);
        }
        .contact-form-dark button[type="reset"] {
          min-height: 44px;
          font-size: 12px;
          letter-spacing: 0.08em;
        }
        .contact-form-dark :focus-visible {
          outline: 1px solid var(--color-inv-hi);
          outline-offset: 4px;
        }
        .contact-form-dark label {
          display: block;
          margin-top: 22px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-inv);
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
    <label data-story-leaf>
      <span>
        {label}
        {required && (
          <span className="ml-1 text-alert" aria-hidden>
            •
          </span>
        )}
      </span>
      {as === "textarea" ? (
        <textarea name={name} required={required} rows={3} />
      ) : (
        <input name={name} type={type} required={required} />
      )}
    </label>
  );
}
