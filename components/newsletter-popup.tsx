'use client';

import { useEffect, useRef, useState } from 'react';

import { NewsletterSignup } from '@/components/newsletter-signup';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    let shouldShow = true;

    try {
      shouldShow =
        window.localStorage.getItem('wally-newsletter-subscribed') !== 'true' &&
        window.sessionStorage.getItem('wally-newsletter-dismissed') !== 'true';
    } catch {
      // If storage is unavailable, the timed invitation may still appear.
    }

    if (!shouldShow) return;

    const timer = window.setTimeout(() => {
      try {
        const alreadySubscribed =
          window.localStorage.getItem('wally-newsletter-subscribed') === 'true';
        const alreadyDismissed =
          window.sessionStorage.getItem('wally-newsletter-dismissed') ===
          'true';
        if (alreadySubscribed || alreadyDismissed) return;
      } catch {
        // If storage is unavailable, the timed invitation may still appear.
      }
      setOpen(true);
    }, 30_000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      try {
        window.sessionStorage.setItem('wally-newsletter-dismissed', 'true');
      } catch {
        // Closing the dialog should never depend on browser storage access.
      }
    }
  }

  function handleSuccess() {
    closeTimer.current = window.setTimeout(() => setOpen(false), 1800);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="edition-dialog newsletter-dialog">
        <DialogTitle>Heard from the Herd.</DialogTitle>
        <DialogDescription>
          Stay informed as Wally brings the real world onchain with one clear,
          useful dispatch at a time.
        </DialogDescription>
        <NewsletterSignup compact onSuccess={handleSuccess} />
        <a
          className="newsletter-social-link"
          href="https://x.com/WALLYCollection"
          target="_blank"
          rel="noreferrer"
        >
          Follow @WALLYCollection on X / Twitter
        </a>
      </DialogContent>
    </Dialog>
  );
}
