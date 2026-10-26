"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
  ClockCounterClockwise,
  GoogleLogo,
  Key,
  SignOut,
  Star,
  Trash,
  Warning,
} from "@phosphor-icons/react";
import SiteNav from "../components/SiteNav";
import Avatar from "../components/Avatar";
import Reveal from "../components/Reveal";
import Spotlight from "../components/Spotlight";
import ConfirmationDialog from "../components/ConfirmationDialog";

interface ProfileData {
  user: {
    email: string;
    name: string | null;
    image: string | null;
    memberSince: string | null;
    signInMethod: "password" | "google";
  };
  stats: {
    totalAnalyses: number;
    owners: number;
    lastAnalysis: string | null;
    languages: { name: string; count: number }[];
  };
  recent: {
    repoUrl: string;
    repoName: string;
    repoOwner: string;
    searchDate: string;
    language: string | null;
    stars: number | null;
  }[];
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [31_536_000, "year"],
    [2_592_000, "month"],
    [604_800, "week"],
    [86_400, "day"],
    [3_600, "hour"],
    [60, "minute"],
  ];
  for (const [size, label] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${label}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function monthYear(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<"signout" | "clear" | null>(null);
  const [clearing, setClearing] = useState(false);

  const fetchProfile = useCallback(async (): Promise<ProfileData> => {
    const res = await fetch("/api/profile");
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to load profile");
    return json;
  }, []);

  const load = useCallback(() => {
    fetchProfile()
      .then((profile) => {
        setData(profile);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"));
  }, [fetchProfile]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetchProfile()
      .then((profile) => {
        if (!cancelled) setData(profile);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load profile");
      });
    return () => {
      cancelled = true;
    };
  }, [status, fetchProfile]);

  const handleConfirm = async () => {
    if (confirm === "signout") {
      setConfirm(null);
      await signOut({ redirect: false });
      router.push("/");
      return;
    }
    setConfirm(null);
    setClearing(true);
    try {
      await fetch("/api/search-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchUrl: "all" }),
      });
      setData(await fetchProfile());
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950">
      <SiteNav />

      <main className="mx-auto w-full max-w-content px-5 pb-24 pt-10 lg:px-8 lg:pt-14">
        {status === "unauthenticated" ? (
          <SignedOut />
        ) : error ? (
          <div role="alert" className="mx-auto max-w-md rounded-md border border-red-500/30 bg-red-500/10 p-6 text-red-200">
            <div className="flex items-start gap-3">
              <Warning size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Could not load your profile</p>
                <p className="mt-1 text-sm text-red-300">{error}</p>
                <button
                  onClick={() => {
                    setError("");
                    load();
                  }}
                  className="mt-3 text-sm underline underline-offset-2 hover:text-red-100">
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : !data ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* ------------------------------------------------ identity */}
            <section className="animate-rise-in flex flex-col gap-6 border-b border-slate-800 pb-10 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Avatar
                    name={data.user.name}
                    email={data.user.email}
                    image={data.user.image}
                    size="lg"
                    className="ring-1 ring-slate-700 ring-offset-4 ring-offset-slate-950"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-3xl font-medium tracking-[-0.02em] text-slate-50 sm:text-4xl">
                    {data.user.name || data.user.email.split("@")[0]}
                  </h1>
                  <p className="mt-1 truncate font-mono text-sm text-slate-400">{data.user.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300">
                      {data.user.signInMethod === "google" ? (
                        <GoogleLogo size={13} weight="bold" />
                      ) : (
                        <Key size={13} />
                      )}
                      {data.user.signInMethod === "google" ? "Google account" : "Email and password"}
                    </span>
                    {data.user.memberSince ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300">
                        <CalendarBlank size={13} />
                        Joined {monthYear(data.user.memberSince)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <Link
                href="/explain"
                className="btn-primary inline-flex items-center justify-center gap-2 self-start rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-slate-950 sm:self-auto"
              >
                Analyze a repository
                <ArrowRight size={16} weight="bold" />
              </Link>
            </section>

            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
              {/* --------------------------------------------- main column */}
              <div className="lg:col-span-8">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Repositories analyzed", value: String(data.stats.totalAnalyses) },
                    { label: "Owners explored", value: String(data.stats.owners) },
                    {
                      label: "Last analysis",
                      value: data.stats.lastAnalysis ? timeAgo(data.stats.lastAnalysis) : "Not yet",
                    },
                  ].map((stat, i) => (
                    <Reveal key={stat.label} delay={i * 60}>
                      <Spotlight className="h-full rounded-md border border-slate-800 bg-slate-900/50 p-5">
                        <p className="text-xs text-slate-400">{stat.label}</p>
                        <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-slate-50">
                          {stat.value}
                        </p>
                      </Spotlight>
                    </Reveal>
                  ))}
                </div>

                {/* Recent analyses */}
                <Reveal delay={120}>
                  <div className="mt-10 flex items-end justify-between gap-4">
                    <h2 className="text-xl font-medium tracking-[-0.01em] text-slate-50">Recent analyses</h2>
                    {data.stats.totalAnalyses > 0 ? (
                      <Link href="/history" className="link-draw text-sm text-slate-400 hover:text-slate-200">
                        View all
                      </Link>
                    ) : null}
                  </div>

                  {data.recent.length === 0 ? (
                    <div className="mt-4 rounded-md border border-dashed border-slate-800 px-6 py-12 text-center">
                      <ClockCounterClockwise size={28} className="mx-auto text-slate-600" />
                      <p className="mt-3 text-slate-200">Nothing here yet</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Repositories you analyze while signed in show up here.
                      </p>
                      <Link href="/explain" className="link-draw mt-4 inline-block text-sm text-accent">
                        Analyze your first repository
                      </Link>
                    </div>
                  ) : (
                    <ul className="mt-4 overflow-hidden rounded-md border border-slate-800">
                      {data.recent.map((item, i) => (
                        <li key={item.repoUrl} className={i > 0 ? "border-t border-slate-800" : ""}>
                          <Link
                            href={`/explain?url=${encodeURIComponent(item.repoUrl)}`}
                            className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-slate-900/80"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-mono text-sm">
                                <span className="text-slate-500">{item.repoOwner}/</span>
                                <span className="text-slate-100 transition-colors group-hover:text-accent">
                                  {item.repoName}
                                </span>
                              </p>
                              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                {item.language ? <span>{item.language}</span> : null}
                                {item.stars != null ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Star size={12} />
                                    {item.stars.toLocaleString()}
                                  </span>
                                ) : null}
                                <span>{timeAgo(item.searchDate)}</span>
                              </p>
                            </div>
                            <ArrowUpRight
                              size={16}
                              className="shrink-0 text-slate-600 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              </div>

              {/* -------------------------------------------- side column */}
              <aside className="space-y-6 lg:col-span-4">
                <Reveal delay={80}>
                  <div className="rounded-md border border-slate-800 bg-slate-900/50 p-5">
                    <h2 className="text-sm font-medium text-slate-100">Languages you read</h2>
                    {data.stats.languages.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-400">
                        Shows up once you have analyzed a few repositories.
                      </p>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {data.stats.languages.slice(0, 5).map((lang) => (
                          <li key={lang.name}>
                            <div className="flex items-baseline justify-between text-sm">
                              <span className="text-slate-200">{lang.name}</span>
                              <span className="font-mono text-xs text-slate-400">{lang.count}</span>
                            </div>
                            <div
                              className="mt-1.5 h-1 rounded-full bg-accent/80"
                              style={{ width: `${(lang.count / data.stats.languages[0].count) * 100}%` }}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Reveal>

                <Reveal delay={140}>
                  <div className="rounded-md border border-slate-800 bg-slate-900/50 p-5">
                    <h2 className="text-sm font-medium text-slate-100">Account</h2>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div>
                        <dt className="text-xs text-slate-400">Email</dt>
                        <dd className="mt-0.5 truncate font-mono text-slate-200">{data.user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">Sign-in method</dt>
                        <dd className="mt-0.5 text-slate-200">
                          {data.user.signInMethod === "google" ? "Google" : "Email and password"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5 space-y-2 border-t border-slate-800 pt-5">
                      <button
                        type="button"
                        onClick={() => setConfirm("signout")}
                        className="flex w-full items-center gap-2.5 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800/60"
                      >
                        <SignOut size={16} />
                        Sign out
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirm("clear")}
                        disabled={clearing || data.stats.totalAnalyses === 0}
                        className="flex w-full items-center gap-2.5 rounded-md border border-red-500/30 px-3 py-2 text-sm text-red-300 transition-colors hover:border-red-500/60 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash size={16} />
                        {clearing ? "Clearing history" : "Clear analysis history"}
                      </button>
                    </div>
                  </div>
                </Reveal>
              </aside>
            </div>
          </>
        )}
      </main>

      <ConfirmationDialog
        isOpen={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        title={confirm === "clear" ? "Clear analysis history" : "Sign out"}
        message={
          confirm === "clear"
            ? "This removes every saved analysis from your account. It cannot be undone."
            : "You will need to sign in again to see your analysis history."
        }
        confirmText={confirm === "clear" ? "Clear history" : "Sign out"}
        cancelText="Cancel"
      />
    </div>
  );
}

function SignedOut() {
  return (
    <div className="animate-rise-in mx-auto max-w-md rounded-md border border-slate-800 bg-slate-900/50 p-8 text-center">
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-slate-50">Sign in to see your profile</h1>
      <p className="mt-2 text-sm text-slate-400">
        Your profile keeps your analysis history and the languages you read most.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Link
          href="/login"
          className="btn-primary inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-slate-950"
        >
          Sign in
          <ArrowRight size={16} weight="bold" />
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-slate-700 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800/60"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile">
      <div className="flex items-center gap-5 border-b border-slate-800 pb-10">
        <div className="skeleton h-20 w-20 rounded-md" />
        <div className="flex-1">
          <div className="skeleton h-8 w-56" />
          <div className="skeleton mt-3 h-4 w-40" />
          <div className="skeleton mt-4 h-6 w-64" />
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-24 rounded-md" />
            ))}
          </div>
          <div className="skeleton mt-10 h-6 w-40" />
          <div className="skeleton mt-4 h-64 rounded-md" />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <div className="skeleton h-48 rounded-md" />
          <div className="skeleton h-56 rounded-md" />
        </div>
      </div>
    </div>
  );
}
