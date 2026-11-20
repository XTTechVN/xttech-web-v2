'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { TARGET_AUDIENCES } from './introduce.constants';

export function IntroduceAudienceSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="border-b border-slate-100 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Đối tượng sử dụng
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
            XTTECH phù hợp với <span className="text-primary">những ai?</span>
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Linh hoạt cho mọi quy mô từ xưởng gia công, đội thợ hiện trường đến tổng thầu lớn.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {TARGET_AUDIENCES.map((aud, idx) => {
            const Icon = aud.icon;
            const isActive = idx === activeIdx;

            return (
              <div
                key={aud.title}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-primary shadow-md shadow-primary/5'
                    : 'border-slate-200/90 shadow-2xs hover:border-primary/40 hover:shadow-sm'
                }`}
              >
                {isActive && (
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-hero-accent to-primary" />
                )}

                <div>
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className={`text-base font-extrabold transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-900'}`}>
                        {aud.title}
                      </h3>
                      <p className="text-xs font-medium text-primary/85">{aud.subtitle}</p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    {aud.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
