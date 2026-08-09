"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowRight,
  CodeSimple,
  Coffee,
  Lightning,
  ShieldCheck,
  TreeStructure,
} from '@phosphor-icons/react';
import AuthButton from './AuthButton';
import Logo from './Logo';
import Reveal from './Reveal';
import { HomeProps } from '@/types';

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  theme?: { color?: string };
  handler?: () => void;
  modal?: { escape?: boolean; confirm_close?: boolean };
};

interface RazorpayInstance {
  open: () => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

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

const Home: React.FC<HomeProps> = ({ onTryNow }) => {
  // Analysis is free and needs no account. The session is read only to decide
  // whether to nudge the visitor about history, which is the one signed-in perk.
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  const [repoUrl, setRepoUrl] = useState('');
  const [formError, setFormError] = useState('');

  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');

  const presets = useMemo(() => [1, 3, 5], []);
  const unitPrice = 99; // rupees per coffee
  const totalAmount = useMemo(() => Math.max(1, quantity) * unitPrice, [quantity]);

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

  const handleSupport = async (amount: number) => {
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, note, quantity }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to create order');
      }
      const data = await res.json();

      if (!window.Razorpay) {
        alert('The payment SDK is still loading. Please try again in a moment.');
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Support AI Explains This Repo',
        description: 'Thanks for keeping this running.',
        order_id: data.orderId,
        theme: { color: '#a3e635' },
        handler: function () {
          alert('Payment successful. Thank you.');
        },
        modal: { escape: true, confirm_close: true },
      });
      rzp.open();
    } catch (e) {
      console.error(e);
      alert('Unable to start the payment. Please try again.');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950">
      {/* ---------------------------------------------------------------- nav */}
      <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-md">
        <nav className="mx-auto flex h-[68px] w-full max-w-content items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 text-slate-100">
            <Logo size="sm" className="shrink-0 text-accent" />
            {/* The full wordmark does not fit next to the auth buttons on a
                narrow phone, so below `sm` the mark carries the brand alone. */}
            <span className="hidden truncate text-[15px] font-medium tracking-tight sm:inline">
              AI Explains This Repo
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/about"
              className="hidden rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:text-slate-100 sm:inline-block"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="hidden rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:text-slate-100 sm:inline-block"
            >
              Contact
            </Link>
            <AuthButton />
          </div>
        </nav>
      </header>

      <main>
        {/* ------------------------------------------------------------- hero */}
        <section
          id="analyze"
          className="mx-auto w-full max-w-content px-5 pb-16 pt-12 lg:px-8 lg:pb-24 lg:pt-20"
        >
          <div className="grid grid-cols-1 items-start gap-x-16 gap-y-12 lg:grid-cols-12">
            <div className="animate-rise-in lg:col-span-7">
              <h1 className="max-w-[19ch] text-[2.5rem] font-medium leading-[1.06] tracking-[-0.03em] text-slate-50 sm:text-5xl lg:text-[3.5rem]">
                Understand any repo before you clone it.
              </h1>
              <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-slate-300">
                Paste a public GitHub URL. Get a plain-English read on architecture,
                security risks, performance, and technical debt.
              </p>
            </div>

            {/* Real analyzer, not a mockup. This is the product surface. */}
            <div
              className="animate-rise-in lg:col-span-5"
              style={{ animationDelay: '90ms' }}
            >
              <form
                onSubmit={handleAnalyze}
                className="rounded-md border border-slate-800 bg-slate-900/70 p-5"
              >
                <label
                  htmlFor="repo-url"
                  className="block font-mono text-xs text-slate-300"
                >
                  Repository URL
                </label>
                <input
                  id="repo-url"
                  type="text"
                  inputMode="url"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="https://github.com/owner/name"
                  aria-invalid={formError ? true : undefined}
                  aria-describedby={formError ? 'repo-url-error' : undefined}
                  className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3.5 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-accent focus:outline-none"
                />

                {formError ? (
                  <p
                    id="repo-url-error"
                    className="mt-2 text-sm text-brand-error-red"
                  >
                    {formError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-accent-dim active:scale-[0.99]"
                >
                  Analyze repository
                  <ArrowRight size={16} weight={ICON_WEIGHT} />
                </button>

                {/* Rendered only once the session resolves, so the copy never
                    flips from "sign in" to "saved" in front of the visitor. */}
                {sessionStatus === 'unauthenticated' ? (
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Free, no account needed.{' '}
                    <Link
                      href="/login"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      Sign in
                    </Link>{' '}
                    to save your history.
                  </p>
                ) : null}
                {sessionStatus === 'authenticated' ? (
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Saved to your{' '}
                    <Link
                      href="/history"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      history
                    </Link>{' '}
                    automatically.
                  </p>
                ) : null}

                <div className="mt-5 border-t border-slate-800 pt-4">
                  <p className="font-mono text-xs text-slate-400">Try one</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {SAMPLE_REPOS.map((repo) => (
                      <button
                        key={repo}
                        type="button"
                        onClick={() => {
                          setRepoUrl(`https://github.com/${repo}`);
                          setFormError('');
                        }}
                        className="rounded-md border border-slate-800 px-2.5 py-1.5 font-mono text-xs text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
                      >
                        {repo}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
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

            <div className="mt-12 grid grid-cols-1 gap-px border border-slate-800 bg-slate-800 sm:grid-cols-2 lg:grid-cols-4">
              {DIMENSIONS.map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 70} className="h-full">
                  <div className="h-full bg-slate-950 p-6">
                    <Icon size={22} weight={ICON_WEIGHT} className="text-accent" />
                    <h3 className="mt-4 text-base font-medium text-slate-100">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {body}
                    </p>
                  </div>
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
              <div className="overflow-hidden rounded-md border border-slate-800">
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
                        Nearly everything past routing is delegated to middleware,
                        which is why the core stays short and the ecosystem around
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
                        appends to that stack and the router walks it in order
                        until something ends the response. Once that loop makes
                        sense, most of the codebase does too.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-mono text-sm text-accent">
                        What to watch
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-300">
                        The framework sanitises nothing on your behalf. Input
                        validation, output escaping, and rate limiting are all left
                        to the application, so budget for them rather than assuming
                        a default.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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
                    className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-accent-dim active:scale-[0.99]"
                  >
                    Analyze repository
                    <ArrowRight size={16} weight={ICON_WEIGHT} />
                  </button>
                </Reveal>
              </div>
            </div>

            <div className="lg:col-span-8">
              <ol className="divide-y divide-slate-800 border-t border-slate-800">
                {STEPS.map((step, i) => (
                  <li key={step.title}>
                    <Reveal delay={i * 80}>
                      <div className="py-7">
                        <h3 className="text-lg font-medium text-slate-100">
                          {step.title}
                        </h3>
                        <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-slate-400">
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

        {/* ------------------------------------------------------------ support */}
        <section className="border-t border-slate-800/70">
          <div className="mx-auto w-full max-w-content px-5 py-16 lg:px-8 lg:py-24">
            <Reveal>
              <div className="mx-auto max-w-xl">
                <div className="flex items-center gap-2.5">
                  <Coffee size={20} weight={ICON_WEIGHT} className="text-accent" />
                  <h2 className="text-2xl font-medium tracking-[-0.02em] text-slate-50">
                    Support the project
                  </h2>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
                  This runs on a personal API budget. A coffee helps keep it free
                  to use.
                </p>

                <div className="mt-7 rounded-md border border-slate-800 bg-slate-900/50 p-5">
                  <fieldset>
                    <legend className="font-mono text-xs text-slate-300">
                      How many coffees
                    </legend>
                    <div className="mt-3 flex items-center gap-2">
                      {presets.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setQuantity(p)}
                          aria-pressed={quantity === p}
                          className={`h-10 w-10 rounded-md text-sm font-medium transition-colors ${
                            quantity === p
                              ? 'bg-accent text-slate-950'
                              : 'border border-slate-700 text-slate-200 hover:border-slate-600'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        aria-label="Custom number of coffees"
                        onChange={(e) =>
                          setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))
                        }
                        className="h-10 w-20 rounded-md border border-slate-700 bg-slate-950 px-2 text-center font-mono text-sm text-slate-100 transition-colors focus:border-accent focus:outline-none"
                      />
                    </div>
                  </fieldset>

                  <label
                    htmlFor="support-note"
                    className="mt-5 block font-mono text-xs text-slate-300"
                  >
                    Note (optional)
                  </label>
                  <textarea
                    id="support-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Say something nice"
                    className="mt-2 h-20 w-full resize-none rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-accent focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleSupport(totalAmount)}
                    className="mt-4 w-full rounded-md border border-slate-700 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-900"
                  >
                    Send &#8377;{totalAmount}
                  </button>
                </div>
              </div>
            </Reveal>
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
            <Link href="/about" className="transition-colors hover:text-slate-200">About</Link>
            <Link href="/contact" className="transition-colors hover:text-slate-200">Contact</Link>
            <Link href="/privacy" className="transition-colors hover:text-slate-200">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-slate-200">Terms</Link>
            <Link href="/cancellation-refunds" className="transition-colors hover:text-slate-200">Refunds</Link>
            <Link href="/shipping" className="transition-colors hover:text-slate-200">Delivery</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Home;
