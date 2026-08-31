'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type Phase = 'static' | 'broadcast' | 'leaving';

export function BroadcastIntro() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>('static');
  const [departed, setDeparted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [playing, setPlaying] = useState(false);

  const completeExit = useCallback(() => {
    document.body.classList.remove('broadcast-locked');
    setDeparted(true);
    exitTimerRef.current = null;
    previouslyFocusedRef.current?.focus();
  }, []);

  const finishBroadcast = useCallback(() => {
    if (exitTimerRef.current) return;
    videoRef.current?.pause();
    setPlaying(false);
    setPhase('leaving');
    exitTimerRef.current = window.setTimeout(completeExit, 720);
  }, [completeExit]);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    document.body.classList.add('broadcast-locked');
    const focusTimer = window.setTimeout(
      () => skipButtonRef.current?.focus(),
      0,
    );
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const tuneTimer = window.setTimeout(
      () => {
        if (reducedMotion) completeExit();
        else setPhase('broadcast');
      },
      reducedMotion ? 100 : 950,
    );
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finishBroadcast();
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute('hidden'));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', keyHandler);

    return () => {
      window.clearTimeout(tuneTimer);
      window.clearTimeout(focusTimer);
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
      window.removeEventListener('keydown', keyHandler);
      document.body.classList.remove('broadcast-locked');
    };
  }, [completeExit, finishBroadcast]);

  useEffect(() => {
    if (phase !== 'broadcast' || !videoRef.current) return;
    const video = videoRef.current;
    video.muted = false;
    setMuted(false);
    void video.play().catch(() => {
      video.muted = true;
      setMuted(true);
      setSoundBlocked(true);
      void video.play().catch(() => setPlaying(false));
    });
  }, [phase]);

  useEffect(() => {
    if (phase !== 'broadcast') return;

    const handlePlaybackShortcut = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'button, a, input, textarea, select, [contenteditable="true"]',
        )
      ) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;
      event.preventDefault();
      if (video.paused) {
        void video.play().then(() => setPlaying(true));
      } else {
        video.pause();
        setPlaying(false);
      }
    };

    window.addEventListener('keydown', handlePlaybackShortcut);
    return () => window.removeEventListener('keydown', handlePlaybackShortcut);
  }, [phase]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setPlaying(true));
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    if (soundBlocked) {
      video.currentTime = 0;
      video.muted = false;
      setMuted(false);
      setSoundBlocked(false);
      void video.play().then(() => setPlaying(true));
      return;
    }

    const nextMuted = !muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
    setSoundBlocked(false);
    if (video.paused) void video.play().then(() => setPlaying(true));
  };

  const replayVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().then(() => setPlaying(true));
  };

  return (
    <dialog
      ref={dialogRef}
      open={!departed}
      className={`arrival-broadcast phase-${phase}${departed ? ' is-departed' : ''}`}
      aria-label="The Daily Times Journal Bulletin opening broadcast"
      aria-modal={departed ? undefined : true}
    >
      <div className="arrival-ident" aria-hidden="true">
        <span>THE DAILY TIMES JOURNAL BULLETIN</span>
        <span>TRANSMISSION 001</span>
      </div>

      <div className="tv-photo-stage">
        <Image
          className="tv-photo-frame tv-photo-frame-desktop"
          src="/media/vintage-tv-frame.png"
          alt=""
          fill
          priority
          sizes="(max-width: 700px) 1px, 85vw"
        />
        <Image
          className="tv-photo-frame tv-photo-frame-mobile"
          src="/media/vintage-tv-frame-mobile.png"
          alt=""
          fill
          priority
          sizes="(max-width: 700px) 88vw, 1px"
        />

        <div className="photo-tv-screen">
          {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- the user explicitly requested a caption-free opening film */}
          <video
            ref={videoRef}
            className="arrival-video"
            muted={muted}
            playsInline
            preload="auto"
            aria-label="The Daily Times Journal Bulletin opening film"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={finishBroadcast}
            onError={finishBroadcast}
          >
            <source
              src="/media/wally-world-service-broadcast.mp4"
              type="video/mp4"
            />
            Your browser does not support this video.
          </video>
          <div className="arrival-static" aria-hidden="true" />
          <div className="arrival-scanlines" aria-hidden="true" />
          <div className="arrival-title-card" aria-hidden="true">
            <span>A DAILY TIMES JOURNAL BULLETIN</span>
            <strong>
              THE REAL WORLD
              <br />
              IS COMING ONCHAIN
            </strong>
          </div>
        </div>
      </div>

      <div className="arrival-controls" aria-label="Broadcast controls">
        {phase === 'static' ? (
          <span>ACQUIRING SIGNAL</span>
        ) : (
          <button
            type="button"
            className="arrival-playback"
            onClick={togglePlayback}
          >
            {playing ? 'PAUSE' : 'PLAY'}
          </button>
        )}
        {phase === 'broadcast' && (
          <>
            <button
              type="button"
              className="arrival-sound"
              onClick={toggleSound}
            >
              {soundBlocked
                ? 'START BROADCAST WITH SOUND'
                : muted
                  ? 'TURN SOUND ON'
                  : 'TURN SOUND OFF'}
            </button>
            <button
              type="button"
              className="arrival-replay"
              onClick={replayVideo}
              title="Restart video"
            >
              Restart Video
            </button>
          </>
        )}
        <button
          ref={skipButtonRef}
          type="button"
          className="arrival-skip"
          onClick={finishBroadcast}
        >
          SKIP TO TODAY&apos;S EDITION
        </button>
      </div>
    </dialog>
  );
}
