import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <Toaster />
    </div>
  );
}
