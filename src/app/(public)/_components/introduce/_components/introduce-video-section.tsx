'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { Maximize2, Minimize2, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX, X } from 'lucide-react';
import { INTRODUCE_EASE_OUT } from './introduce.constants';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function IntroduceVideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const modalVideoContainerRef = useRef<HTMLDivElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // State cho video trong modal
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animation phóng to theo cuộn trang giống antigravity.google
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

  // Video nền tự chạy tắt tiếng khi vào viewport, tạm dừng khi ra khỏi viewport hoặc khi đang mở modal
  const isInView = useInView(sectionRef, { amount: 0.2 });

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video || prefersReducedMotion) return;

    if (isInView && !isModalOpen) {
      video.play().catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  }, [isInView, isModalOpen, prefersReducedMotion]);

  // Con trỏ nổi bám theo chuột trên desktop
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

  // Khóa cuộn trang & hỗ trợ phím ESC khi mở modal
  useEffect(() => {
    if (!isModalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipBy(-5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipBy(5);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Tự động phát video trong modal (nếu trình duyệt chặn autoplay có tiếng thì tự chuyển muted rồi phát)
  useEffect(() => {
    if (!isModalOpen) return;
    const video = modalVideoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {});
    });
  }, [isModalOpen]);

  const openVideoModal = () => {
    setCurrentTime(0);
    setDuration(0);
    setIsMuted(false);
    setIsPlaying(true);
    setIsModalOpen(true);
  };

  const togglePlayPause = () => {
    const video = modalVideoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = modalVideoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = () => {
    const container = modalVideoContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = modalVideoRef.current;
    const targetDuration = duration || video?.duration || 0;
    if (!video || !Number.isFinite(targetDuration) || targetDuration <= 0) return;
    const nextTime = (Number(e.target.value) / 100) * targetDuration;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const skipBy = (deltaSeconds: number) => {
    const video = modalVideoRef.current;
    if (!video) return;
    const targetDuration = duration || video.duration || 0;
    const nextTime = Math.max(
      0,
      targetDuration > 0 ? Math.min(targetDuration, video.currentTime + deltaSeconds) : video.currentTime + deltaSeconds,
    );
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <section
      ref={sectionRef}
      aria-label="Video giới thiệu phần mềm XTTECH XMS"
      className="border-t border-slate-200/80 overflow-hidden bg-white pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: INTRODUCE_EASE_OUT }}
          className="mx-auto mb-6 max-w-3xl text-center sm:mb-8"
        >
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
            Giới thiệu <span className="text-primary">công ty XTTECH</span>
          </h2>
        </motion.div>

        {/* Khung video preview sạch gọn, không có thanh điều khiển, click để mở modal */}
        <motion.div
          ref={wrapperRef}
          style={{ scale, opacity }}
          onMouseEnter={(e) => {
            setIsHovering(true);
            handleMouseMove(e);
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsHovering(false)}
          onClick={openVideoModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openVideoModal();
            }
          }}
          aria-label="Xem video giới thiệu"
          className={`group relative mx-auto aspect-video w-full origin-center overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/10 sm:rounded-3xl ${
            isHovering && !isMobile ? 'cursor-none' : 'cursor-pointer'
          }`}
        >
          <video
            ref={previewVideoRef}
            src="/assets/video/intro.mp4"
            loop
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />

          {/* Con trỏ nổi "Xem video" trên desktop */}
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
                <Play className="h-3.5 w-3.5 fill-current text-hero-accent" />
                <span>Xem video</span>
              </div>
            </motion.div>
          )}

          {/* Nút Xem video gọn trên mobile */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center md:hidden">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-slate-950/55 text-white shadow-xl backdrop-blur-md">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </div>
        </motion.div>
      </div>

      {/* Modal xem video gần tràn màn hình (render qua Portal để không bị kẹt z-index / transform) */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-md sm:p-6"
              >
            <motion.div
              ref={modalVideoContainerRef}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: INTRODUCE_EASE_OUT }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex h-[86vh] w-[95vw] max-w-7xl items-center justify-center overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/15"
            >
              {/* Nút đóng modal */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Đóng video"
                className="absolute top-3 right-3 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-slate-950 sm:top-4 sm:right-4"
              >
                <X className="h-5 w-5" />
              </button>

              <video
                ref={modalVideoRef}
                src="/assets/video/intro.mp4"
                autoPlay
                playsInline
                preload="auto"
                onClick={togglePlayPause}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => {
                  const vid = e.currentTarget;
                  setCurrentTime(vid.currentTime);
                  if (duration === 0 && Number.isFinite(vid.duration) && vid.duration > 0) {
                    setDuration(vid.duration);
                  }
                }}
                onLoadedMetadata={(e) => {
                  if (Number.isFinite(e.currentTarget.duration)) {
                    setDuration(e.currentTarget.duration);
                  }
                }}
                onDurationChange={(e) => {
                  if (Number.isFinite(e.currentTarget.duration)) {
                    setDuration(e.currentTarget.duration);
                  }
                }}
                className="h-full w-full cursor-pointer object-contain"
              />

              {/* Thanh điều khiển đầy đủ trong modal */}
              <div className="absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/85 via-black/45 to-transparent px-4 pt-8 pb-4 text-white sm:px-6 sm:pb-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-colors hover:bg-white/25"
                  >
                    {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => skipBy(-10)}
                    aria-label="Tua lùi 10 giây"
                    title="Tua lùi 10s"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-colors hover:bg-white/25"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => skipBy(10)}
                    aria-label="Tua tới 10 giây"
                    title="Tua tới 10s"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-colors hover:bg-white/25"
                  >
                    <RotateCw className="h-4 w-4" />
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

                  <span className="shrink-0 font-mono text-xs font-medium text-white/90 tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-colors hover:bg-white/25"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-colors hover:bg-white/25"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}
