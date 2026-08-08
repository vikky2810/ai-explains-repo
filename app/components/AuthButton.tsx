"use client";

import { signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "./ConfirmationDialog";

export default function AuthButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSignOut = async () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSignOut = async () => {
    setShowConfirmDialog(false);
    await signOut({ redirect: false });
    router.push("/");
  };

  const handleCancelSignOut = () => {
    setShowConfirmDialog(false);
  };

  if (!session) {
    return (
      <div className="flex items-center gap-1">
        <a
          href="/login"
          className="rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:text-slate-100"
        >
          Sign in
        </a>
        <a
          href="/register"
          className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-100 transition-colors hover:border-slate-600 hover:bg-slate-900"
        >
          Create account
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="hidden max-w-[18ch] truncate font-mono text-xs text-slate-400 sm:inline">
          {session.user?.email}
        </span>
        <button
          onClick={handleSignOut}
          className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-100 transition-colors hover:border-slate-600 hover:bg-slate-900"
        >
          Sign out
        </button>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelSignOut}
        onConfirm={handleConfirmSignOut}
        title="Sign out"
        message="You will need to sign in again to see your analysis history."
        confirmText="Sign out"
        cancelText="Stay signed in"
      />
    </>
  );
}
