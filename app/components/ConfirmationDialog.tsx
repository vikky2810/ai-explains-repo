"use client";

import React from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes",
  cancelText = "Cancel"
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
        </div>
        
        {/* Message */}
        <div className="mb-6">
          <p className="text-sm text-slate-400">{message}</p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 hover:bg-slate-700 transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg border border-brand-error-red/60 bg-brand-error-red/20 px-4 py-2 text-sm font-medium text-red-200 hover:border-red-500 hover:bg-red-600/30 transition-all duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
