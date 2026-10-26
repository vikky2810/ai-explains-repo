"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, CodeSimple, GithubLogo, Globe, KeyReturn, Lightning, ShieldCheck, TreeStructure } from '@phosphor-icons/react';
import Logo from './Logo';
import Reveal from './Reveal';
import Spotlight from './Spotlight';
import { HomeProps } from '@/types';
import SiteNav from './SiteNav';

/** One icon family, one weight, set in a single place. */
const ICON_WEIGHT = 'regular' as const;

const DIMENSIONS = [
  {
    icon: TreeStructure,
    title: 'Architecture',
    body: 'How the pieces fit together: module boundaries, dependency direction, and the patterns the code actually follows.',
  },
  {
    icon: ShieldCheck,
    title: 'Security',
    body: 'Exposed secrets, ageing dependencies, and the authentication paths worth a second look.',
  },
  {
    icon: Lightning,
    title: 'Performance',
    body: 'Heavy dependencies, expensive queries, and the code paths that get costly under load.',
  },
  {
    icon: CodeSimple,
    title: 'Quality',
    body: 'Complexity hot spots, dead weight, and the parts a new contributor will lose a day to.',
  },
];

const STEPS = [
  {
    title: 'Point it at a repository',
    body: 'Any public GitHub URL. Nothing to install, no token to issue, no access to your private code.',
  },
  {
    title: 'It reads the source',
    body: 'The analyzer pulls the repository contents and runs them through the model against a structured brief.',
  },
  {
    title: 'You get the write-up',
    body: 'One page of plain English, written to be pasted into a design doc or a code review.',
  },
];

const SAMPLE_REPOS = ['expressjs/express', 'honojs/hono', 'sindresorhus/got'];

const HEADLINE_LEAD = ['Understand', 'any', 'repo'];
const HEADLINE_MARKED = ['before', 'you', 'clone', 'it.'];

/** Bento spans: wide, narrow / narrow, wide, so the grid has rhythm. */
const DIMENSION_SPANS = [
  'lg:col-span-4',
  'lg:col-span-2',
  'lg:col-span-2',
  'lg:col-span-4',
];

const Home: React.FC<HomeProps> = ({ onTryNow }) => {
  // Analysis is free and needs no account. The session is read only to decide
  // whether to nudge the visitor about history, which is the one signed-in perk.
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  const [repoUrl, setRepoUrl] = useState('');
  const [formError, setFormError] = useState('');
  // Flips after first paint so the hero marker sweeps in instead of appearing.
  const [markerOn, setMarkerOn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickSample = (repo: string) => {
    setRepoUrl(`https://github.com/${repo}`);
    setFormError('');
    // Restart the flash even when the same chip is clicked twice.
    const el = inputRef.current;
    if (!el) return;
    el.classList.remove('fill-flash');
    void el.offsetWidth;
    el.classList.add('fill-flash');
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMarkerOn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleAnalyze = (event: React.FormEvent) => {
    event.preventDefault();
    const url = repoUrl.trim();

    if (!url) {
      onTryNow();
      return;
    }

    if (!/^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/i.test(url)) {
      setFormError('That does not look like a GitHub repository URL.');
      return;
    }

    setFormError('');
    router.push(`/explain?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950">
      <SiteNav />

      <main>
        {/* ------------------------------------------------------------- hero */}
        <section id="analyze" className="relative overflow-hidden">
          <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[620px] rounded-full bg-accent/[0.06] blur-3xl"
          />

          <div className="relative mx-auto grid w-full max-w-content grid-cols-1 items-center gap-x-16 gap-y-12 px-5 pb-16 pt-12 lg:grid-cols-12 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="lg:col-span-7">
              <h1 className="max-w-[16ch] text-[2.5rem] font-medium leading-[1.08] tracking-[-0.035em] text-slate-50 sm:text-5xl lg:text-[4rem]">
                {HEADLINE_LEAD.map((word, i) => (
                  <React.Fragment key={word}>
                    <span className="word-rise" style={{ '--i': i } as React.CSSProperties}>
                      {word}
                    </span>{' '}
                  </React.Fragment>
                ))}
                <span
                  className={`hl-now ${markerOn ? 'is-on' : ''}`}
                  style={{ '--hl-delay': '700ms' } as React.CSSProperties}
                >
                  {HEADLINE_MARKED.map((word, i) => (
                    <React.Fragment key={word}>
                      <span
                        className="word-rise"
                        style={{ '--i': i + HEADLINE_LEAD.length } as React.CSSProperties}
                      >
                        {word}
                      </span>
                      {i < HEADLINE_MARKED.length - 1 ? ' ' : null}
                    </React.Fragment>
                  ))}
                </span>
              </h1>
              <p
                className="animate-rise-in mt-7 max-w-[48ch] text-[17px] leading-relaxed text-slate-300"
                style={{ animationDelay: '450ms' }}
              >
                Paste a public GitHub URL. Get a plain-English read on architecture,
                security risks, performance, and technical debt.
              </p>
            </div>

            {/* Real analyzer, not a mockup. This is the product surface. */}
            <div
              className="animate-rise-in lg:col-span-5"
              style={{ animationDelay: '250ms' }}
            >
              <div className="ring-border rounded-lg shadow-[0_30px_80px_-40px_rgb(163_230_53/0.35)]">
                <Spotlight
                  as="form"
                  onSubmit={handleAnalyze}
                  className="rounded-[7px] bg-slate-900"
                >
                  {/* Card header: what this is, and the one constraint that matters. */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent text-slate-950">
                        <GithubLogo size={18} weight="fill" />
                      </span>
                      <span className="text-sm font-medium text-slate-100">
                        Analyze a repository
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-2 py-1 font-mono text-[11px] text-slate-300">
                      <Globe size={12} weight={ICON_WEIGHT} />
                      Public repos
                    </span>
                  </div>

                  <div className="px-5 pb-5 pt-5">
                    <label
                      htmlFor="repo-url"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Repository URL
                    </label>
                    <div className="group/input relative mt-2">
                      <GithubLogo
                        size={18}
                        weight={ICON_WEIGHT}
                        aria-hidden
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within/input:text-accent"
                      />
                      <input
                        ref={inputRef}
                        id="repo-url"
                        type="text"
                        inputMode="url"
                        value={repoUrl}
                        onChange={(e) => {
                          setRepoUrl(e.target.value);
                          if (formError) setFormError('');
                        }}
                        onAnimationEnd={(e) => e.currentTarget.classList.remove('fill-flash')}
                        placeholder="https://github.com/owner/name"
                        aria-invalid={formError ? true : undefined}
                        aria-describedby={formError ? 'repo-url-error' : 'repo-url-help'}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-12 font-mono text-sm text-slate-100 placeholder:text-slate-500 transition-[border-color,box-shadow] duration-200 hover:border-slate-600 focus:border-accent focus:shadow-[0_0_0_3px_rgb(163_230_53/0.15)] focus:outline-none"
                      />
                      <KeyReturn
                        size={18}
                        weight={ICON_WEIGHT}
                        aria-hidden
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 opacity-0 transition-opacity group-focus-within/input:opacity-100"
                      />
                    </div>

                    {formError ? (
                      <p
                        id="repo-url-error"
                        className="mt-2 text-sm text-brand-error-red"
                      >
                        {formError}
                      </p>
                    ) : (
                      <p id="repo-url-help" className="mt-2 text-xs text-slate-400">
                        Private repositories are not supported.
                      </p>
                    )}

                    <button
                      type="submit"
                      className="btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3.5 text-sm font-semibold text-slate-950"
                    >
                      Analyze repository
                      <ArrowRight size={16} weight="bold" />
                    </button>

                    {/* Rendered only once the session resolves, so the copy never
                        flips from "sign in" to "saved" in front of the visitor. */}
                    {sessionStatus === 'unauthenticated' ? (
                      <p className="mt-3 text-center text-xs text-slate-400">
                        Free, no account needed.{' '}
                        <Link href="/login" className="link-draw text-accent">
                          Sign in
                        </Link>{' '}
                        to save your history.
                      </p>
                    ) : null}
                    {sessionStatus === 'authenticated' ? (
                      <p className="mt-3 text-center text-xs text-slate-400">
                        Saved to your{' '}
                        <Link href="/history" className="link-draw text-accent">
                          history
                        </Link>{' '}
                        automatically.
                      </p>
                    ) : null}
                  </div>

                  {/* Samples live in their own recessed footer strip. */}
                  <div className="rounded-b-[7px] border-t border-slate-800 bg-slate-950/50 px-5 py-4">
                    <p className="text-xs text-slate-400">Or try one of these</p>
                    <div className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                      {SAMPLE_REPOS.map((repo) => {
                        const [owner, name] = repo.split('/');
                        return (
                          <button
                            key={repo}
                            type="button"
                            onClick={() => pickSample(repo)}
                            aria-label={`Use ${repo}`}
                            className="group/chip flex min-w-0 flex-col items-start rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/[0.06] active:translate-y-0"
                          >
                            <span className="w-full truncate font-mono text-[11px] text-slate-500 transition-colors group-hover/chip:text-slate-400">
                              {owner}/
                            </span>
                            <span className="w-full truncate font-mono text-[13px] text-slate-200 transition-colors group-hover/chip:text-accent">
                              {name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Spotlight>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------- what it reads (4-up) */}
        <section className="border-y border-slate-800/70">
          <div className="mx-auto w-full max-w-content px-5 py-16 lg:px-8 lg:py-20">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400">
                What it reads
              </p>
              <h2 className="mt-3 max-w-[20ch] text-3xl font-medium tracking-[-0.02em] text-slate-50 sm:text-4xl">
                Four passes over the same codebase.
              </h2>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {DIMENSIONS.map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 70} className={`h-full ${DIMENSION_SPANS[i]}`}>
                  <Spotlight className="group h-full rounded-md border border-slate-800 bg-slate-900/40 p-6 transition-colors duration-300 hover:bg-slate-900/80 lg:p-8">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 bg-slate-950 text-accent transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-accent/40 group-hover:shadow-[0_8px_20px_-8px_rgb(163_230_53/0.5)]">
                      <Icon size={20} weight={ICON_WEIGHT} />
                    </span>
                    <h3 className="mt-6 text-lg font-medium text-slate-100">
                      {title}
                    </h3>
                    <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
                      {body}
                    </p>
                  </Spotlight>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ sample output */}
        <section className="mx-auto w-full max-w-content px-5 py-16 lg:px-8 lg:py-24">
          <Reveal>
            <h2 className="max-w-[24ch] text-3xl font-medium tracking-[-0.02em] text-slate-50 sm:text-4xl">
              What it gives back.
            </h2>
            <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-slate-300">
              Not a score out of ten. A short technical brief you could hand to
              someone joining the project on Monday.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <figure className="mt-10">
              <Spotlight className="overflow-hidden rounded-md border border-slate-800">
                <div className="border-b border-slate-800 bg-slate-900/70 px-4 py-2.5">
                  <span className="font-mono text-xs text-slate-400">
                    github.com/expressjs/express
                  </span>
                </div>

                <div className="bg-slate-900/30 px-5 py-6 sm:px-8 sm:py-8">
                  <div className="max-w-[70ch] space-y-5">
                    <div>
                      <h3 className="font-mono text-sm text-accent">Overview</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-300">
                        Express is a small, unopinionated HTTP framework for Node.
                        Nearly everything past routing is{' '}
                        <mark className="hl bg-transparent text-slate-100">
                          delegated to middleware
                        </mark>
                        , which is why the core stays short and the ecosystem around
                        it stays enormous.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-mono text-sm text-accent">
                        How it is put together
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-300">
                        Every request walks a single middleware stack.{' '}
                        <code className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[13px] text-slate-200">
                          app.use()
                        </code>{' '}
                        appends to that stack and the router walks it{' '}
                        <mark
                          className="hl bg-transparent text-slate-100"
                          style={{ '--hl-delay': '650ms' } as React.CSSProperties}
                        >
                          in order until something ends the response
                        </mark>
                        . Once that loop makes
                        sense, most of the codebase does too.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-mono text-sm text-accent">
                        What to watch
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-300">
                        The framework{' '}
                        <mark
                          className="hl bg-transparent text-slate-100"
                          style={{ '--hl-delay': '950ms' } as React.CSSProperties}
                        >
                          sanitises nothing on your behalf
                        </mark>
                        . Input
                        validation, output escaping, and rate limiting are all left
                        to the application, so budget for them rather than assuming
                        a default.
                      </p>
                    </div>
                  </div>
                </div>
              </Spotlight>

              <figcaption className="mt-3 text-xs text-slate-500">
                Example output, abbreviated.
              </figcaption>
            </figure>
          </Reveal>
        </section>

        {/* -------------------------------------------------------- how it works */}
        <section className="border-t border-slate-800/70">
          <div className="mx-auto grid w-full max-w-content grid-cols-1 gap-x-16 gap-y-10 px-5 py-16 lg:grid-cols-12 lg:px-8 lg:py-24">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <Reveal>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400">
                    How it works
                  </p>
                  <h2 className="mt-3 text-3xl font-medium tracking-[-0.02em] text-slate-50 sm:text-4xl">
                    Three moves.
                  </h2>

                  <button
                    type="button"
                    onClick={() => {
                      document
                        .getElementById('analyze')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      document.getElementById('repo-url')?.focus({ preventScroll: true });
                    }}
                    className="btn-primary mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-slate-950"
                  >
                    Analyze repository
                    <ArrowRight size={16} weight={ICON_WEIGHT} />
                  </button>
                </Reveal>
              </div>
            </div>

            <div className="lg:col-span-8">
              <ol className="divide-y divide-slate-800">
                {STEPS.map((step, i) => (
                  <li key={step.title}>
                    <Reveal delay={i * 80}>
                      <div className="group relative py-7 pl-5 transition-transform duration-300 ease-out hover:translate-x-1">
                        <span
                          aria-hidden
                          className="absolute left-0 top-7 h-[calc(100%-3.5rem)] w-px origin-top scale-y-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-y-100"
                        />
                        <h3 className="text-lg font-medium text-slate-100 transition-colors group-hover:text-accent">
                          {step.title}
                        </h3>
                        <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
                          {step.body}
                        </p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

      </main>

      {/* ------------------------------------------------------------- footer */}
      <footer className="border-t border-slate-800/70">
        <div className="mx-auto flex w-full max-w-content flex-col gap-6 px-5 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2.5 text-slate-400">
            <Logo size="sm" className="text-slate-600" />
            <span className="text-sm">Built by Vikram</span>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            <Link href="/about" className="link-draw transition-colors hover:text-slate-200">About</Link>
            <Link href="/contact" className="link-draw transition-colors hover:text-slate-200">Contact</Link>
            <Link href="/privacy" className="link-draw transition-colors hover:text-slate-200">Privacy</Link>
            <Link href="/terms" className="link-draw transition-colors hover:text-slate-200">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Home;
