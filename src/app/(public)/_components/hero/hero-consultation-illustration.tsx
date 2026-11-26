import React from 'react';

/** Hình minh họa tư vấn viên (SVG tĩnh) của khối đăng ký tư vấn. */
export function HeroConsultationIllustration() {
  return (
      <svg
        viewBox="0 0 400 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-md select-none"
      >
        {/* Nền mây trang trí nhẹ */}
        <circle cx="280" cy="180" r="110" fill="#f0fdf4" />
        <ellipse cx="200" cy="270" rx="170" ry="20" fill="#f1f5f9" />
  
        {/* Họa tiết lá cây xanh nền */}
        <path
          d="M320 220C340 180 370 190 380 260C340 260 320 250 320 220Z"
          fill="#38bdf8"
          opacity="0.3"
        />
        <path
          d="M290 240C300 200 330 210 340 270C300 270 290 260 290 240Z"
          fill="#0ea5e9"
          opacity="0.5"
        />
  
        {/* Bong bóng chat câu hỏi (?) màu vàng */}
        <g>
          <rect x="290" y="45" width="46" height="38" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="306" y="71" fill="#f59e0b" fontSize="20" fontWeight="bold">?</text>
        </g>
  
        {/* Bong bóng tin nhắn văn bản */}
        <g>
          <rect x="210" y="25" width="56" height="42" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <rect x="220" y="37" width="36" height="4" rx="2" fill="#fcd34d" />
          <rect x="220" y="46" width="28" height="4" rx="2" fill="#fcd34d" />
        </g>
  
        {/* Bong bóng cuộc gọi điện thoại vàng */}
        <g>
          <rect x="180" y="95" width="46" height="40" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <path
            d="M206 120C202 120 197 115 197 111C197 109 198 107 200 106L202 108C201 109 201 110 201 111C201 113 203 115 205 115C206 115 207 115 208 114L210 116C209 118 207 120 206 120Z"
            fill="#f59e0b"
          />
        </g>
  
        {/* Nhân vật nữ tư vấn viên */}
        <path
          d="M260 145C260 95 210 95 210 145C210 175 220 185 235 185C250 185 260 175 260 145Z"
          fill="#0f172a"
        />
        <ellipse cx="235" cy="145" rx="20" ry="24" fill="#fed7aa" />
        <rect x="231" y="165" width="8" height="15" fill="#fdba74" />
  
        {/* Kính mắt */}
        <circle cx="228" cy="142" r="6" stroke="#0f172a" strokeWidth="1.5" fill="none" />
        <circle cx="242" cy="142" r="6" stroke="#0f172a" strokeWidth="1.5" fill="none" />
        <line x1="234" y1="142" x2="236" y2="142" stroke="#0f172a" strokeWidth="1.5" />
  
        {/* Nụ cười */}
        <path d="M231 156Q235 160 239 156" stroke="#ea580c" strokeWidth="1.5" fill="none" />
  
        {/* Tai nghe Headset màu xanh dương */}
        <path
          d="M212 145C212 120 258 120 258 145"
          stroke="#0284c7"
          strokeWidth="3.5"
          fill="none"
        />
        <rect x="210" y="138" width="6" height="14" rx="3" fill="#0284c7" />
        <rect x="254" y="138" width="6" height="14" rx="3" fill="#0284c7" />
        <path d="M215 148L228 158" stroke="#0284c7" strokeWidth="1.5" fill="none" />
        <circle cx="229" cy="159" r="2.5" fill="#0284c7" />
  
        {/* Áo vàng */}
        <path
          d="M210 180C190 195 190 270 190 270L280 270C280 270 280 195 260 180C250 190 220 190 210 180Z"
          fill="#f59e0b"
        />
  
        {/* Cốc cà phê xanh mint */}
        <rect x="145" y="240" width="16" height="22" rx="3" fill="#06b6d4" />
        <path d="M161 245H166C168 245 168 252 166 252H161" stroke="#06b6d4" strokeWidth="2" fill="none" />
        <path d="M150 234Q152 230 150 226" stroke="#94a3b8" strokeWidth="1" fill="none" />
        <path d="M155 235Q157 231 155 227" stroke="#94a3b8" strokeWidth="1" fill="none" />
  
        {/* Laptop */}
        <polygon points="180,270 270,270 260,205 190,205" fill="#cbd5e1" />
        <polygon points="183,268 267,268 258,208 192,208" fill="#e2e8f0" />
        <polygon points="160,270 290,270 295,273 155,273" fill="#1e293b" />
        <circle cx="225" cy="236" r="4.5" fill="#38bdf8" />
  
        {/* Cạnh bàn làm việc */}
        <rect x="120" y="270" width="220" height="6" rx="2" fill="#1e293b" />
      </svg>
  );
}
