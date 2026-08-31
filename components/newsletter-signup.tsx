'use client';

import { type SyntheticEvent, useId, useState } from 'react';

type NewsletterSignupProps = {
  compact?: boolean;
  onSuccess?: () => void;
};

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function NewsletterSignup({
  compact = false,
  onSuccess,
}: NewsletterSignupProps) {
  const inputId = useId();
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState('submitting');
    setMessage('Sending your request to the news desk…');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Unable to subscribe.');
      }

      setFormState('success');
      setMessage(
        'Welcome to the Herd. Check your inbox: your first briefing is on its way.',
      );
      setEmail('');
      try {
        window.localStorage.setItem('wally-newsletter-subscribed', 'true');
      } catch {
        // A successful signup should not depend on browser storage access.
      }
      onSuccess?.();
    } catch (error) {
      setFormState('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    }
  }

  return (
    <form
      className={`newsletter-form${compact ? ' newsletter-form-compact' : ''}`}
      onSubmit={handleSubmit}
    >
      <label htmlFor={inputId}>Email address</label>
      <div>
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@future.finance"
          required
          disabled={formState === 'submitting' || formState === 'success'}
        />
        <button
          type="submit"
          disabled={formState === 'submitting' || formState === 'success'}
        >
          {formState === 'submitting' ? 'Joining…' : 'Join the Herd'}
        </button>
      </div>
      <output
        className={`newsletter-status status-${formState}`}
        aria-live="polite"
        htmlFor={inputId}
      >
        {message || 'No spam. Just the dispatches worth reading.'}
      </output>
    </form>
  );
}
