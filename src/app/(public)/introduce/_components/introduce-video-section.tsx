'use client';

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { Play } from 'lucide-react';
import { INTRO_VIDEO_URL } from '@/config';
import { INTRODUCE_EASE_OUT } from '../_constants/introduce.constants';
import { IntroduceVideoModal } from './modals';

const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

function subscribeMobileMedia(onChange: () => void): () => void {
  const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

const getMobileSnapshot = (): boolean => window.matchMedia(MOBILE_MEDIA_QUERY).matches;
const getServerMobileSnapshot = (): boolean => false;

export function IntroduceVideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const isMobile = useSyncExternalStore(
    subscribeMobileMedia,
    getMobileSnapshot,
    getServerMobileSnapshot,
  );
  const [isHovering, setIsHovering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSessionKey, setModalSessionKey] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start end', 'center center'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 24,
    mass: 0.5,
  });

  const startScale = prefersReducedMotion ? 1 : isMobile ? 0.96 : 0.88;
  const scale = useTransform(smoothProgress, [0, 1], [startScale, 1.02]);
  const opacity = useTransform(smoothProgress, [0, 0.35, 1], [prefersReducedMotion ? 1 : 0.8, 0.95, 1]);

  const isInView = useInView(sectionRef, { amount: 0.2 });

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video || prefersReducedMotion || videoFailed) return;

    if (isInView && !isModalOpen) {
      video.play().catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  }, [isInView, isModalOpen, prefersReducedMotion, videoFailed]);

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

  const openVideoModal = () => {
    if (videoFailed) return;
    setModalSessionKey((prev) => prev + 1);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Video giới thiệu phần mềm XTTECH XMS"
      className="border-t border-slate-200/80 overflow-hidden bg-white pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20"
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
      </div>

      <div className="mx-auto w-full max-w-[97vw] 2xl:max-w-[1720px] px-1 sm:px-2 lg:px-4">
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
          className={`group relative mx-auto h-[82vh] sm:h-[88vh] lg:h-[94vh] min-h-[520px] sm:min-h-[620px] lg:min-h-[760px] max-h-[1080px] w-full origin-center overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/10 sm:rounded-3xl lg:rounded-[36px] ${
            isHovering && !isMobile ? 'cursor-none' : 'cursor-pointer'
          }`}
        >
          {videoFailed ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-linear-to-br from-[#072b28] via-primary to-[#0d1e2e] px-6 text-center text-white">
              <Play className="h-12 w-12 text-hero-accent opacity-80" />
              <p className="text-base font-bold sm:text-lg">Video giới thiệu hệ sinh thái XTTECH ERP</p>
              <p className="max-w-md text-xs text-teal-100/80">
                Video giới thiệu đang được đồng bộ từ máy chủ media MinIO.
              </p>
            </div>
          ) : (
            <video
              ref={previewVideoRef}
              src={INTRO_VIDEO_URL}
              loop
              muted
              playsInline
              preload="metadata"
              onError={() => setVideoFailed(true)}
              className="h-full w-full object-cover"
            />
          )}

          {!isMobile && !videoFailed && (
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

          {!videoFailed && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center md:hidden">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-slate-950/55 text-white shadow-xl backdrop-blur-md">
                <Play className="ml-0.5 h-6 w-6 fill-current" />
              </span>
            </div>
          )}
        </motion.div>
      </div>

      <IntroduceVideoModal
        key={modalSessionKey}
        isOpen={isModalOpen}
        videoUrl={INTRO_VIDEO_URL}
        onClose={handleCloseModal}
      />
    </section>
  );
}
