'use client';
import React, { useState } from 'react';
import Intro from './intro';
import Form from './form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const Container = () => {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 lg:border-r lg:border-gray-200 lg:pr-10 justify-center">
      <Intro step={step} />
      <Form step={step} setStep={setStep} />
      <div className="mt-4 flex justify-center text-sm">
        <Link href="/signin" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default Container;
