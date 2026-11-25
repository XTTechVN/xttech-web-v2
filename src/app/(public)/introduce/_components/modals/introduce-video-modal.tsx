'use client';

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Maximize2, Minimize2, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX, X } from 'lucide-react';
import { INTRODUCE_EASE_OUT } from '../../_constants/introduce.constants';

interface IntroduceVideoModalProps {
  isOpen: boolean;
  videoUrl: string;
  onClose: () => void;
}

const subscribeNoop = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function IntroduceVideoModal({ isOpen, videoUrl, onClose }: IntroduceVideoModalProps) {
  const modalVideoContainerRef = useRef<HTMLDivElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const isMounted = useSyncExternalStore(subscribeNoop, getClientMounted, getServerMounted);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const skipBy = useCallback(
    (deltaSeconds: number) => {
      const video = modalVideoRef.current;
      if (!video) return;
      const targetDuration = duration || video.duration || 0;
      const nextTime = Math.max(
        0,
        targetDuration > 0 ? Math.min(targetDuration, video.currentTime + deltaSeconds) : video.currentTime + deltaSeconds,
      );
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [duration],
  );

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
  }, [isOpen, onClose, skipBy]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const video = modalVideoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {});
    });
  }, [isOpen]);

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

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
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
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng video"
              className="absolute top-3 right-3 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-slate-950 sm:top-4 sm:right-4"
            >
              <X className="h-5 w-5" />
            </button>

            <video
              ref={modalVideoRef}
              src={videoUrl}
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
  );
}
