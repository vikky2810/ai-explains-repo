"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuthButton from "./AuthButton";
import Logo from "./Logo";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * The one site header, shared by every page.
 *
 * At the top of the page it sits flat on the background. Once the page
 * scrolls it lifts into a bordered, blurred bar. Scroll state comes from an
 * IntersectionObserver on a sentinel, never a scroll listener.
 *
 * Hovering a link slides a single highlight behind it. The highlight is
 * positioned through CSS custom properties, so pointer movement never
 * re-renders React.
 */
export default function SiteNav() {
  const pathname = usePathname();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const moveHighlight = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const wrap = linksRef.current;
    if (!wrap) return;
    const link = event.currentTarget;
    wrap.style.setProperty("--hl-x", `${link.offsetLeft}px`);
    wrap.style.setProperty("--hl-w", `${link.offsetWidth}px`);
    wrap.dataset.hovering = "true";
  };

  const hideHighlight = () => {
    if (linksRef.current) linksRef.current.dataset.hovering = "false";
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="pointer-events-none absolute left-0 top-0 h-4 w-px" />
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <nav
          className={`mx-auto flex h-14 w-full max-w-content items-center justify-between gap-4 rounded-lg border px-3 transition-[background-color,border-color,box-shadow] duration-300 sm:px-4 ${
            scrolled
              ? "border-slate-800 bg-slate-950/75 shadow-[0_12px_40px_-16px_rgb(0_0_0/0.8)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 rounded-md text-slate-100">
            <Logo
              size="sm"
              tile
              className="shrink-0 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110"
            />
            {/* The full wordmark does not fit next to the auth buttons on a
                narrow phone, so below `sm` the mark carries the brand alone. */}
            <span className="hidden truncate text-[15px] font-medium tracking-tight sm:inline">
              AI Explains <span className="text-slate-400 transition-colors group-hover:text-slate-200">This Repo</span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <div
              ref={linksRef}
              onPointerLeave={hideHighlight}
              data-hovering="false"
              className="group/links relative hidden items-center sm:flex"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-1/2 h-9 w-[var(--hl-w,0px)] -translate-y-1/2 translate-x-[var(--hl-x,0px)] rounded-md bg-slate-800/70 opacity-0 transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[hovering=true]/links:opacity-100"
              />
              {LINKS.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onPointerEnter={moveHighlight}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-md px-3 py-2 text-sm transition-colors duration-200 hover:text-slate-50 ${
                      active ? "text-slate-50" : "text-slate-400"
                    }`}
                  >
                    {label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-3 -bottom-px h-px origin-left bg-accent transition-transform duration-300 ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            <span aria-hidden className="hidden h-5 w-px bg-slate-800 sm:block" />

            <AuthButton />
          </div>
        </nav>
      </header>
    </>
  );
}
