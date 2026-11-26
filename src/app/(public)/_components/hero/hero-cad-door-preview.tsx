'use client';

import React from 'react';

interface HeroCadDoorPreviewProps {
  viewMode: '2d' | '3d';
  zoom: number;
  frameColor: string;
  frameDark: string;
  sashColor: string;
}

export function HeroCadDoorPreview({
  viewMode,
  zoom,
  frameColor,
  frameDark,
  sashColor,
}: HeroCadDoorPreviewProps) {
  return (
    <div className="relative min-h-95 overflow-hidden rounded-2xl bg-white">
      <div
        className={`flex w-[200%] items-center transition-transform duration-300 ease-out ${
          viewMode === '3d' ? '-translate-x-1/2' : 'translate-x-0'
        }`}
      >
        <div
          className={`order-2 flex w-1/2 shrink-0 items-center justify-center p-4 transition-opacity duration-300 sm:p-6 ${
            viewMode === '3d' ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <svg
            viewBox="0 0 540 620"
            style={{ transform: `scale(${zoom})` }}
            className="w-full max-w-105 select-none transition-transform duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points="88,42 452,32 452,48 88,58" fill={frameDark} stroke="#090d12" strokeWidth="1.5" />
            <polygon points="88,42 104,54 104,536 88,540" fill={frameDark} stroke="#090d12" strokeWidth="1.5" />
            <polygon points="452,32 436,46 436,546 452,550" fill={frameDark} stroke="#090d12" strokeWidth="1.5" />

            <g>
              <polygon points="96,46 232,68 232,576 96,536" fill={frameColor} stroke="#090d12" strokeWidth="2" />
              <polygon points="232,68 242,72 242,572 232,576" fill={frameDark} stroke="#090d12" strokeWidth="1.5" />
              <line x1="96" y1="46" x2="112" y2="62" stroke="#090d12" strokeWidth="1.2" />
              <line x1="232" y1="68" x2="216" y2="82" stroke="#090d12" strokeWidth="1.2" />
              <line x1="96" y1="536" x2="112" y2="520" stroke="#090d12" strokeWidth="1.2" />
              <line x1="232" y1="576" x2="216" y2="554" stroke="#090d12" strokeWidth="1.2" />
              <polygon points="112,64 216,81 216,554 112,519" fill="#4f728e" fillOpacity="0.88" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="164" y1="72" x2="164" y2="537" stroke="#c5a467" strokeWidth="1.5" />
              <line x1="112" y1="176" x2="216" y2="196" stroke="#c5a467" strokeWidth="1.3" />
              <line x1="112" y1="292" x2="216" y2="314" stroke="#c5a467" strokeWidth="1.3" />
              <line x1="112" y1="406" x2="216" y2="432" stroke="#c5a467" strokeWidth="1.3" />
              <polygon points="164,274 176,304 164,334 152,304" fill="#b89454" fillOpacity="0.65" stroke="#d6b87c" strokeWidth="1.2" />
              <circle cx="164" cy="186" r="6" fill="none" stroke="#d6b87c" strokeWidth="1.2" />
              <circle cx="164" cy="419" r="6" fill="none" stroke="#d6b87c" strokeWidth="1.2" />
            </g>

            <g>
              <polygon points="266,54 276,50 276,586 266,582" fill={frameDark} stroke="#090d12" strokeWidth="1.5" />
              <polygon points="276,50 444,34 444,548 276,586" fill={sashColor} stroke="#090d12" strokeWidth="2" />
              <line x1="276" y1="50" x2="294" y2="66" stroke="#090d12" strokeWidth="1.2" />
              <line x1="444" y1="34" x2="426" y2="52" stroke="#090d12" strokeWidth="1.2" />
              <line x1="276" y1="586" x2="294" y2="564" stroke="#090d12" strokeWidth="1.2" />
              <line x1="444" y1="548" x2="426" y2="532" stroke="#090d12" strokeWidth="1.2" />
              <polygon points="294,66 426,52 426,532 294,564" fill="#537996" fillOpacity="0.9" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="360" y1="59" x2="360" y2="548" stroke="#c5a467" strokeWidth="1.5" />
              <line x1="294" y1="186" x2="426" y2="172" stroke="#c5a467" strokeWidth="1.3" />
              <line x1="294" y1="312" x2="426" y2="292" stroke="#c5a467" strokeWidth="1.3" />
              <line x1="294" y1="438" x2="426" y2="412" stroke="#c5a467" strokeWidth="1.3" />
              <polygon points="360,268 375,302 360,336 345,302" fill="#b89454" fillOpacity="0.65" stroke="#d6b87c" strokeWidth="1.2" />
              <circle cx="360" cy="179" r="7" fill="none" stroke="#d6b87c" strokeWidth="1.2" />
              <circle cx="360" cy="425" r="7" fill="none" stroke="#d6b87c" strokeWidth="1.2" />
              <rect x="281" y="314" width="6" height="44" rx="3" fill="#090d12" />
              <rect x="282" y="320" width="24" height="6" rx="3" fill="#090d12" />
            </g>
          </svg>
        </div>

        <div
          className={`order-1 flex w-1/2 shrink-0 items-center justify-center p-4 transition-opacity duration-300 sm:p-6 ${
            viewMode === '2d' ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <svg
            viewBox="0 0 540 620"
            style={{ transform: `scale(${zoom})` }}
            className="w-full max-w-105 drop-shadow-md select-none transition-transform duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <pattern id="dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="#cbd5e1" opacity="0.6" />
            </pattern>
            <rect x="0" y="0" width="540" height="620" fill="url(#dot-grid)" />

            <rect x="70" y="40" width="340" height="480" rx="4" fill={frameColor} stroke="#2d3748" strokeWidth="2.5" />
            <rect x="90" y="60" width="300" height="440" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />

            <rect x="94" y="64" width="144" height="432" fill={sashColor} stroke="#334155" strokeWidth="1.5" />
            <rect x="110" y="80" width="112" height="400" fill="#bbf7d0" fillOpacity="0.45" stroke="#10b981" strokeWidth="1" />
            <line x1="110" y1="80" x2="222" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="222" y1="80" x2="110" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="166" cy="280" r="14" fill="#fbbf24" fillOpacity="0.5" stroke="#b45309" strokeWidth="1" />
            <line x1="166" y1="240" x2="166" y2="320" stroke="#b45309" strokeWidth="1.5" />
            <line x1="130" y1="280" x2="202" y2="280" stroke="#b45309" strokeWidth="1.5" />

            <rect x="242" y="64" width="144" height="432" fill={sashColor} stroke="#334155" strokeWidth="1.5" />
            <rect x="258" y="80" width="112" height="400" fill="#bbf7d0" fillOpacity="0.45" stroke="#10b981" strokeWidth="1" />
            <line x1="258" y1="80" x2="370" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="370" y1="80" x2="258" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="314" cy="280" r="14" fill="#fbbf24" fillOpacity="0.5" stroke="#b45309" strokeWidth="1" />
            <line x1="314" y1="240" x2="314" y2="320" stroke="#b45309" strokeWidth="1.5" />
            <line x1="278" y1="280" x2="350" y2="280" stroke="#b45309" strokeWidth="1.5" />

            <rect x="238" y="270" width="4" height="40" rx="2" fill="#0f172a" />
            <rect x="234" y="282" width="12" height="6" rx="2" fill="#0f172a" />

            <line x1="430" y1="40" x2="430" y2="520" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="410" y1="40" x2="436" y2="40" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="410" y1="520" x2="436" y2="520" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="430" cy="40" r="2.5" fill="#2563eb" />
            <circle cx="430" cy="520" r="2.5" fill="#2563eb" />
            <text x="444" y="285" fill="#2563eb" fontSize="12" fontWeight="bold" transform="rotate(-90 444 285)">
              2400
            </text>

            <line x1="50" y1="290" x2="50" y2="520" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="50" y1="290" x2="70" y2="290" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="50" y1="520" x2="70" y2="520" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="50" cy="290" r="2.5" fill="#2563eb" />
            <circle cx="50" cy="520" r="2.5" fill="#2563eb" />
            <text x="42" y="415" fill="#2563eb" fontSize="11" fontWeight="bold" transform="rotate(-90 42 415)">
              1050
            </text>

            <line x1="70" y1="545" x2="240" y2="545" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="240" y1="545" x2="410" y2="545" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="70" y1="520" x2="70" y2="550" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="240" y1="520" x2="240" y2="550" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="410" y1="520" x2="410" y2="550" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="70" cy="545" r="2.5" fill="#2563eb" />
            <circle cx="240" cy="545" r="2.5" fill="#2563eb" />
            <circle cx="410" cy="545" r="2.5" fill="#2563eb" />
            <text x="145" y="540" fill="#2563eb" fontSize="11" fontWeight="bold">
              1000
            </text>
            <text x="315" y="540" fill="#2563eb" fontSize="11" fontWeight="bold">
              1000
            </text>

            <line x1="70" y1="575" x2="410" y2="575" stroke="#2563eb" strokeWidth="2" />
            <line x1="70" y1="545" x2="70" y2="580" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="410" y1="545" x2="410" y2="580" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="70" cy="575" r="3" fill="#2563eb" />
            <circle cx="410" cy="575" r="3" fill="#2563eb" />
            <text x="225" y="595" fill="#2563eb" fontSize="12" fontWeight="bold">
              2000
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
