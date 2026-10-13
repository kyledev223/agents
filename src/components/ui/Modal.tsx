"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/lib/hooks";
import { CloseIcon } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  dismissable?: boolean;
}

// Rendered into <body> so it escapes the transformed scene layers.
export function Modal({ open, onClose, title, eyebrow, children, dismissable = true }: Props) {
  const mounted = useMounted();

  useEffect(() => {
    if (!open || !dismissable) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissable, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-end bg-ink/45 p-0 backdrop-blur-[3px] sm:place-items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(e) => dismissable && e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="w-full overflow-hidden rounded-t-2xl border border-rule bg-card shadow-[0_24px_80px_rgba(60,30,8,0.28)] sm:max-w-[440px] sm:rounded-2xl"
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-rule px-5 pb-3.5 pt-4">
              <div className="min-w-0">
                {eyebrow && <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">{eyebrow}</p>}
                <h2 className="font-display mt-0.5 text-[20px] font-extrabold leading-tight">{title}</h2>
              </div>
              {dismissable && (
                <button type="button" onClick={onClose} aria-label="Close" className="-mr-1.5 rounded-full p-2 text-[18px] hover:bg-paper-2">
                  <CloseIcon />
                </button>
              )}
            </header>
            <div className="px-5 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
