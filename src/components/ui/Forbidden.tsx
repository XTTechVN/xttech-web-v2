'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from './Button';

interface ForbiddenProps {
  className?: string;
  message?: string;
}

export default function Forbidden({ className = '', message }: ForbiddenProps) {
  const router = useRouter();

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-2xl mx-auto my-8 ${className}`}
    >
      {/* 403 Backdrop Number with Modern Gradient */}
      <div className="relative select-none pointer-events-none mb-4">
        <h1 className="text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-gray-200/80 to-gray-100/60 font-sans">
          403
        </h1>
      </div>

      {/* Primary Message */}
      <h2 className="text-3xl font-extrabold text-[#2E3A59] mb-4">We are Sorry...</h2>

      {/* Description */}
      <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed mb-8">
        {message || "The page you're trying to access has restricted access."}
        <br />
        <span className="font-medium text-gray-400"></span>
      </p>

      {/* Go Back Action Button with premium style matching the reference */}
      <Button
        onClick={() => router.back()}
        className="px-8 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2 cursor-pointer border-none"
      >
        <ArrowLeft size={16} />
        Go Back
      </Button>
    </div>
  );
}
