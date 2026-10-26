"use client";

import { useState } from "react";

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-2xl",
};

/** Up to two initials from the display name, falling back to the email. */
function initialsFor(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * The account's picture, or its initials on the accent tile when there is no
 * picture (credential accounts) or the picture fails to load.
 */
export default function Avatar({ name, email, image, size = "sm", className = "" }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const base = `inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-md ${SIZES[size]} ${className}`;

  if (image && !failed) {
    return (
      // Google avatars are served from a third-party host that next/image is
      // not configured for, and they reject requests that carry a referrer.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <span aria-hidden className={`${base} bg-accent font-semibold tracking-tight text-slate-950`}>
      {initialsFor(name, email)}
    </span>
  );
}
