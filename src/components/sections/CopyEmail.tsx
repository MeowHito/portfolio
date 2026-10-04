"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

/** Giant email link: click copies it to the clipboard and shows a toast. */
export function CopyEmail({ email, copied, hint }: { email: string; copied: string; hint: string }) {
  const [show, setShow] = useState(false);
  const timer = useRef<number>(undefined);

  const onClick = async (e: React.MouseEvent) => {
    try {
      await navigator.clipboard.writeText(email);
      e.preventDefault(); // copied — don't also open the mail app
      setShow(true);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setShow(false), 1500);
    } catch {
      // Clipboard blocked: fall through to the mailto: link.
    }
  };

  return (
    <div className="relative inline-block">
      <a
        href={`mailto:${email}`}
        onClick={onClick}
        title={hint}
        className="group relative inline-block break-all font-display text-[clamp(1.5rem,5.2vw,4.25rem)] font-semibold tracking-[-0.03em] text-ink transition-colors duration-300 hover:text-primary"
      >
        {email}
        <span
          aria-hidden
          className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
      </a>
      <AnimatePresence>
        {show && (
          <motion.span
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-xs font-medium text-bg"
          >
            {copied}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
