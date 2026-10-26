"use client";

import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CaretDown,
  ClockCounterClockwise,
  MagnifyingGlass,
  SignOut,
  UserCircle,
} from "@phosphor-icons/react";
import Avatar from "./Avatar";
import ConfirmationDialog from "./ConfirmationDialog";

const MENU_LINKS = [
  { href: "/profile", label: "Your profile", icon: UserCircle },
  { href: "/history", label: "History", icon: ClockCounterClockwise },
  { href: "/explain", label: "Analyze a repository", icon: MagnifyingGlass },
];

export default function AuthButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click and Escape; Escape hands focus back to the trigger.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Move focus into the menu when it opens, so arrow keys work straight away.
  useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [menuOpen]);

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "ArrowDown" ? index + 1 : index - 1;
    items[(next + items.length) % items.length]?.focus();
  };

  const handleConfirmSignOut = async () => {
    setShowConfirmDialog(false);
    await signOut({ redirect: false });
    router.push("/");
  };

  if (!session) {
    return (
      <div className="flex items-center gap-1">
        <a
          href="/login"
          className="rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800/70 hover:text-slate-50"
        >
          Sign in
        </a>
        <a
          href="/register"
          className="group inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-950 transition-all duration-200 hover:-translate-y-px hover:bg-slate-50 hover:shadow-[0_8px_20px_-8px_rgb(236_236_234/0.45)] active:translate-y-0"
        >
          Create account
          <ArrowRight size={14} weight="bold" className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>
    );
  }

  const { name, email, image } = session.user ?? {};
  const displayName = name || email?.split("@")[0] || "Account";

  return (
    <>
      <div ref={wrapRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Open account menu"
          className={`group flex items-center gap-2 rounded-md border py-1 pl-1 pr-2 transition-colors duration-200 ${
            menuOpen
              ? "border-slate-600 bg-slate-800/70"
              : "border-slate-800 hover:border-slate-600 hover:bg-slate-800/50"
          }`}
        >
          <Avatar name={name} email={email} image={image} size="sm" />
          <span className="hidden max-w-[12ch] truncate text-sm text-slate-200 md:inline">
            {displayName}
          </span>
          <CaretDown
            size={12}
            weight="bold"
            className={`text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          onKeyDown={handleMenuKeyDown}
          className={`absolute right-0 top-[calc(100%+8px)] z-50 w-72 origin-top-right rounded-lg border border-slate-800 bg-slate-900/95 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? "visible scale-100 opacity-100" : "invisible pointer-events-none scale-95 opacity-0"
          }`}
        >
          {/* Identity */}
          <div className="flex items-center gap-3 border-b border-slate-800 p-4">
            <Avatar name={name} email={email} image={image} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-50">{displayName}</p>
              <p className="truncate font-mono text-xs text-slate-400" title={email ?? undefined}>
                {email}
              </p>
            </div>
          </div>

          <div className="p-1.5">
            {MENU_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => setMenuOpen(false)}
                className="group/item flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-slate-300 outline-none transition-colors hover:bg-slate-800/80 hover:text-slate-50 focus-visible:bg-slate-800/80 focus-visible:text-slate-50"
              >
                <Icon size={17} weight="regular" className="text-slate-500 transition-colors group-hover/item:text-accent group-focus-visible/item:text-accent" />
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-800 p-1.5">
            <button
              type="button"
              role="menuitem"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => {
                setMenuOpen(false);
                setShowConfirmDialog(true);
              }}
              className="group/item flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm text-slate-300 outline-none transition-colors hover:bg-red-500/10 hover:text-red-200 focus-visible:bg-red-500/10 focus-visible:text-red-200"
            >
              <SignOut size={17} weight="regular" className="text-slate-500 transition-colors group-hover/item:text-red-300" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSignOut}
        title="Sign out"
        message="You will need to sign in again to see your analysis history."
        confirmText="Sign out"
        cancelText="Stay signed in"
      />
    </>
  );
}
