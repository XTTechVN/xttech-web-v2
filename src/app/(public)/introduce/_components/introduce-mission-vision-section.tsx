'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  INTRODUCE_EASE_OUT,
  MISSION_VISION_BLOCKS,
  type MissionVisionBlock,
} from '../_constants/introduce.constants';

function MissionVisionRow({ block }: { block: MissionVisionBlock }) {
  const Icon = block.icon;

  const textCol = (
    <motion.div
      initial={{ opacity: 0, x: block.imageFirst ? 70 : -70 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: block.imageFirst ? 0.1 : 0, ease: INTRODUCE_EASE_OUT }}
      className={`space-y-6 lg:col-span-6 ${block.imageFirst ? 'order-1 lg:order-2' : ''}`}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
        <Icon className="h-3.5 w-3.5" />
        <span>{block.badge}</span>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl lg:text-[42px] lg:leading-[1.18]">
            {block.title}
          </h2>

          <Link
            href="/pricing"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-primary hover:text-primary hover:shadow-sm sm:px-5 sm:py-2"
          >
            <span className="sm:hidden">Khám phá</span>
            <span className="hidden sm:inline">Khám phá giải pháp</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
          {block.summaryLead}{' '}
          <strong className="font-semibold text-slate-900">{block.summaryHighlight}</strong>{' '}
          {block.summaryTail}
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">{block.listTitle}</p>
        <ul className="space-y-3">
          {block.items.map((item) => (
            <li key={item.lead} className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <span>
                <strong className="font-semibold text-slate-800">{item.lead}</strong> {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );

  const imageCol = (
    <motion.div
      initial={{ opacity: 0, x: block.imageFirst ? -70 : 70 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: block.imageFirst ? 0 : 0.1, ease: INTRODUCE_EASE_OUT }}
      className={`lg:col-span-6 ${block.imageFirst ? 'order-2 lg:order-1' : ''}`}
    >
      <div className="group relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
        <div
          aria-hidden="true"
          className={`animate-ambient-glow pointer-events-none absolute -inset-1/4 rounded-full blur-2xl ${block.glowClass}`}
        />

        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={block.imageSrc}
            alt={block.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`${block.imageAnimationClass} object-cover transition-transform duration-700 ease-out group-hover:scale-108`}
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
      {block.imageFirst ? (
        <>
          {imageCol}
          {textCol}
        </>
      ) : (
        <>
          {textCol}
          {imageCol}
        </>
      )}
    </div>
  );
}

export function IntroduceMissionVisionSection() {
  return (
    <section className="overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {MISSION_VISION_BLOCKS.map((block, index) => (
          <React.Fragment key={block.id}>
            {index > 0 && <div className="my-16 border-t border-slate-200/80 sm:my-24" />}
            <MissionVisionRow block={block} />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
