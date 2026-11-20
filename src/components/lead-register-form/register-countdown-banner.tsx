'use client';

import React, { useSyncExternalStore } from 'react';
import { Flame } from 'lucide-react';
import type { CountdownSnapshot } from './register-form.types';

// Chu kỳ reset ưu đãi sau mỗi 6 ngày (tính bằng ms)
const CYCLE_MS = 6 * 24 * 60 * 60 * 1000;

const SERVER_COUNTDOWN_SNAPSHOT: CountdownSnapshot = {
  days: 5,
  hours: 23,
  minutes: 59,
  seconds: 59,
  progress: 15,
};

let cachedClientSnapshot: CountdownSnapshot = SERVER_COUNTDOWN_SNAPSHOT;

function computeCountdownSnapshot(): CountdownSnapshot {
  if (typeof window === 'undefined') return SERVER_COUNTDOWN_SNAPSHOT;
  const elapsed = Date.now() % CYCLE_MS;
  const remaining = CYCLE_MS - elapsed;

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);
  const progress = Math.min(100, Math.max(0.5, Number(((remaining / CYCLE_MS) * 100).toFixed(1))));

  if (
    cachedClientSnapshot !== SERVER_COUNTDOWN_SNAPSHOT &&
    cachedClientSnapshot.days === days &&
    cachedClientSnapshot.hours === hours &&
    cachedClientSnapshot.minutes === minutes &&
    cachedClientSnapshot.seconds === seconds
  ) {
    return cachedClientSnapshot;
  }

  cachedClientSnapshot = { days, hours, minutes, seconds, progress };
  return cachedClientSnapshot;
}

function subscribeCountdown(onStoreChange: () => void): () => void {
  const timer = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(timer);
}

const getServerCountdownSnapshot = (): CountdownSnapshot => SERVER_COUNTDOWN_SNAPSHOT;

export function RegisterCountdownBanner() {
  const timeLeft = useSyncExternalStore(
    subscribeCountdown,
    computeCountdownSnapshot,
    getServerCountdownSnapshot,
  );

  return (
    <div className="rounded-xl border border-primary/20 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-red-600">
            <Flame className="h-3.5 w-3.5 fill-red-500 animate-pulse" />
          </span>
          <span className="text-xs font-bold text-slate-800">Ưu đãi kết thúc sau:</span>
        </div>

        <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-primary">
          <span className="rounded bg-white px-1.5 py-0.5 shadow-xs border border-primary/20">
            {String(timeLeft.days).padStart(2, '0')}d
          </span>
          <span className="text-slate-400">:</span>
          <span className="rounded bg-white px-1.5 py-0.5 shadow-xs border border-primary/20">
            {String(timeLeft.hours).padStart(2, '0')}h
          </span>
          <span className="text-slate-400">:</span>
          <span className="rounded bg-white px-1.5 py-0.5 shadow-xs border border-primary/20">
            {String(timeLeft.minutes).padStart(2, '0')}m
          </span>
          <span className="text-slate-400">:</span>
          <span className="rounded bg-white px-1.5 py-0.5 shadow-xs border border-primary/20">
            {String(timeLeft.seconds).padStart(2, '0')}s
          </span>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <span>Thời gian ưu đãi còn lại</span>
          <span className="font-mono font-bold text-primary">{Math.round(timeLeft.progress)}%</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
          <div
            className="h-full rounded-full bg-linear-to-r from-primary to-emerald-400 transition-all duration-1000 ease-out"
            style={{ width: `${timeLeft.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
