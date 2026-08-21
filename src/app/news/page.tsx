import type { Metadata } from "next";
import Image from "next/image";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

type NewsItem = {
  title: string;
  date?: string;
  dateTime?: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
  // Logos render contained on a white field instead of cropped cover.
  logo?: boolean;
};

const ITEMS: NewsItem[] = [
  {
    title: "Hopkins Innovation Translation Award.",
    date: "May 2026",
    dateTime: "2026-05",
    description:
      "Selected by the Johns Hopkins Innovation Translation Council at the Bloomberg School's Innovation Week Idea Tank.",
    href: "https://publichealth.jhu.edu/2026/innovation-week-2026-sparks-new-connections-and-ideas",
    image: "/images/news/hbhi-logo.svg",
    imageAlt: "Johns Hopkins University — Hopkins Business of Health Initiative",
    logo: true,
  },
  {
    title: "Science in Context.",
    date: "February 2025",
    dateTime: "2025-02-20",
    description:
      "Dr Cyril Geismar on how transmission patterns shape outbreaks, and what that means for investigations.",
    href: "https://www.youtube.com/watch?v=Ib5dBunDPN0",
    image: "/images/news/science-in-context-frame.jpg",
    imageAlt: "Cyril Geismar interviewed at Imperial College London",
  },
  {
    title: "The operating system for outbreak response.",
    description:
      "A walkthrough of the Nosotrack prototype.",
    href: "https://www.youtube.com/watch?v=EWTf3TVEZXQ",
    image: "/images/news/nosotrack-live-demo.jpg",
    imageAlt: "Nosotrack product demonstration",
  },
];

const [FEATURED, ...REST] = ITEMS;

export const metadata: Metadata = {
  title: "Nosotrack · News",
  description: "Awards, talks and product updates from Nosotrack.",
  alternates: { canonical: "/news/" },
  openGraph: {
    title: "Nosotrack · News",
    description: "Awards, talks and product updates from Nosotrack.",
    url: "/news/",
  },
};

export default function NewsPage() {
  return (
    <>
      <Nav standalone />

      <main id="top" className="bg-bg pt-[72px] text-text">
        <section className="section-pad" aria-label="News">
          <div className="container-page">
            <h1 className="font-display font-normal leading-[1.05] tracking-tight text-ink text-[clamp(32px,3.6vw,56px)] max-w-[20ch]">
              In the News.
            </h1>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              <NewsCard item={FEATURED} featured />
              <div className="grid grid-cols-1 content-start gap-6">
                {REST.map((item) => (
                  <NewsCard key={item.href} item={item} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer standalone />
    </>
  );
}

function NewsCard({
  item,
  featured = false,
}: {
  item: NewsItem;
  featured?: boolean;
}) {
  return (
    <article>
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div
          className={`relative w-full overflow-hidden ${
            item.logo ? "bg-white" : "bg-bg-tint"
          } ${featured ? "aspect-[4/3] md:aspect-square" : "aspect-video"}`}
        >
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className={
              item.logo
                ? "object-contain p-10 md:p-16"
                : "object-cover transition-transform duration-[var(--transition-duration-base)] ease-out group-hover:scale-[1.02]"
            }
          />
          {item.href.includes("youtube.com") && (
            <span
              aria-hidden
              className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink/40 text-inv-hi backdrop-blur-sm transition-colors duration-[var(--transition-duration-fast)] group-hover:bg-ink/60"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 translate-x-[1px]">
                <path d="m9 7 8 5-8 5V7Z" />
              </svg>
            </span>
          )}
        </div>
        <div className="pt-4">
          {item.date && (
            <time
              dateTime={item.dateTime}
              className="block font-mono text-[11px] uppercase tracking-[0.14em] text-faint"
            >
              {item.date}
            </time>
          )}
          <h2 className={`${item.date ? "mt-3 " : ""}font-display text-[22px] font-normal leading-[1.2] tracking-[-0.015em] text-ink max-w-[55ch]`}>
            {item.title}
          </h2>
          <p className="mt-3 text-[17px] leading-[1.55] tracking-[-0.005em] text-mute max-w-[60ch]">
            {item.description}
          </p>
        </div>
      </a>
    </article>
  );
}
