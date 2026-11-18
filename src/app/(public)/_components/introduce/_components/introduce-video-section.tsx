'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function IntroduceVideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll-linked scale animation matching antigravity.google (0.5 -> 1.0 on desktop, 0.92 -> 1.0 on mobile)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start center'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 24,
    mass: 0.5,
  });

  const startScale = prefersReducedMotion ? 1 : isMobile ? 0.92 : 0.5;
  const scale = useTransform(smoothProgress, [0, 1], [startScale, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.35, 1], [prefersReducedMotion ? 1 : 0.65, 0.95, 1]);

  // Auto-play muted when in viewport, pause when leaving viewport
  const isInView = useInView(sectionRef, { amount: 0.2 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    if (isInView && !userPaused) {
      video.play().catch(() => {
        // Ignore autoplay restriction errors
      });
    } else if (!isInView && !video.paused) {
      video.pause();
    }
  }, [isInView, userPaused, prefersReducedMotion]);

  // Floating custom cursor following mouse smoothly (like antigravity.google quickTo)
  const rawCursorX = useMotionValue(0);
  const rawCursorY = useMotionValue(0);
  const cursorX = useSpring(rawCursorX, { stiffness: 280, damping: 28, mass: 0.4 });
  const cursorY = useSpring(rawCursorY, { stiffness: 280, damping: 28, mass: 0.4 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawCursorX.set(e.clientX - rect.left);
    rawCursorY.set(e.clientY - rect.top);
  };

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setUserPaused(false);
      video.play().catch(() => {});
      return;
    }

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      return;
    }

    setUserPaused(true);
    video.pause();
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setUserPaused(false);
      video.play().catch(() => {});
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const container = wrapperRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const nextTime = (Number(e.target.value) / 100) * duration;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const cursorLabel = !isPlaying ? 'Phát video' : isMuted ? 'Bật âm thanh' : 'Tạm dừng';

  return (
    <section
      ref={sectionRef}
      aria-label="Video giới thiệu phần mềm XTTECH XMS"
      className="overflow-hidden bg-white py-8 sm:py-12 lg:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={wrapperRef}
          style={{ scale, opacity }}
          onMouseEnter={(e) => {
            setIsHovering(true);
            handleMouseMove(e);
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleVideoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleVideoClick();
            }
          }}
          aria-label={cursorLabel}
          className={`group relative mx-auto aspect-video w-full origin-center overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/10 sm:rounded-3xl ${
            isHovering && !isMobile ? 'cursor-none' : 'cursor-pointer'
          }`}
        >
          <video
            ref={videoRef}
            src="/assets/video/intro.mp4"
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            className="h-full w-full object-cover"
          />

          {/* Subtle gradient vignette at bottom for control readability */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-slate-950/75 via-slate-950/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Floating custom cursor pill on desktop (inspired by antigravity.google) */}
          {!isMobile && (
            <motion.div
              aria-hidden="true"
              style={{ x: cursorX, y: cursorY }}
              initial={false}
              animate={{
                scale: isHovering ? 1 : 0,
                opacity: isHovering ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="pointer-events-none absolute top-0 left-0 z-20 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="flex items-center gap-2 rounded-full border border-white/25 bg-slate-950/80 px-4 py-2 text-xs font-bold whitespace-nowrap text-white shadow-xl backdrop-blur-md">
                {!isPlaying ? (
                  <Play className="h-3.5 w-3.5 fill-current text-hero-accent" />
                ) : isMuted ? (
                  <Volume2 className="h-3.5 w-3.5 text-hero-accent" />
                ) : (
                  <Pause className="h-3.5 w-3.5 fill-current text-hero-accent" />
                )}
                <span>{cursorLabel}</span>
              </div>
            </motion.div>
          )}

          {/* Center play button when paused (especially helpful on mobile/touch) */}
          <div
            className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 ${
              !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-slate-950/55 text-white shadow-xl backdrop-blur-md sm:h-20 sm:w-20">
              <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" />
            </span>
          </div>

          {/* Inline control bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsHovering(false)}
            onMouseLeave={() => setIsHovering(true)}
            className="absolute inset-x-0 bottom-0 z-30 flex cursor-default items-center gap-3 px-4 py-3 text-white opacity-100 transition-opacity duration-300 sm:px-5 sm:py-4 lg:opacity-0 lg:group-hover:opacity-100"
          >
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-colors hover:bg-white/25"
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
            </button>

            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progressPercent}
              onChange={handleSeek}
              aria-label="Tua video"
              className="h-1.5 w-full cursor-pointer accent-hero-accent"
            />

            <span className="shrink-0 font-mono text-[11px] font-medium text-white/85 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-colors hover:bg-white/25"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-colors hover:bg-white/25"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
