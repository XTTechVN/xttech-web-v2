'use client';

import React from 'react';
import { Button } from '@/components';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function InteractiveButtons() {
  const handleClick = (name: string) => {
    toast.success(`Bạn vừa ấn nút: ${name}`);
  };

  return (
    <div className="space-y-6">
      {/* Variants */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">1. Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => handleClick('Primary Button')}>
            Primary Button
          </Button>
          <Button variant="secondary" onClick={() => handleClick('Secondary Button')}>
            Secondary Button
          </Button>
          <Button variant="outline" onClick={() => handleClick('Outline Button')}>
            Outline Button
          </Button>
          <Button variant="ghost" onClick={() => handleClick('Ghost Button')}>
            Ghost Button
          </Button>
          <Button variant="danger" onClick={() => handleClick('Danger Button')}>
            Danger Button
          </Button>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">2. Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs" onClick={() => handleClick('Extra Small')}>
            Extra Small (xs)
          </Button>
          <Button size="sm" onClick={() => handleClick('Small')}>
            Small (sm)
          </Button>
          <Button size="md" onClick={() => handleClick('Medium')}>
            Medium (md)
          </Button>
          <Button size="lg" onClick={() => handleClick('Large')}>
            Large (lg)
          </Button>
          <Button size="xl" onClick={() => handleClick('Extra Large')}>
            Extra Large (xl)
          </Button>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">3. With Icons</h3>
        <div className="flex flex-wrap gap-3">
          <Button leftIcon={<Plus size={16} />} onClick={() => handleClick('Create New')}>
            Create New
          </Button>
          <Button
            variant="outline"
            rightIcon={<ArrowRight size={16} />}
            onClick={() => handleClick('Next Step')}
          >
            Next Step
          </Button>
          <Button
            variant="danger"
            leftIcon={<Trash2 size={16} />}
            onClick={() => handleClick('Delete item')}
          >
            Delete item
          </Button>
        </div>
      </div>

      {/* States */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">4. Loading & Disabled States</h3>
        <div className="flex flex-wrap gap-3">
          <Button loading onClick={() => handleClick('Processing')}>
            Processing
          </Button>
          <Button variant="outline" loading onClick={() => handleClick('Loading data')}>
            Loading data
          </Button>
          <Button disabled onClick={() => handleClick('Disabled Button')}>
            Disabled Button
          </Button>
        </div>
      </div>

      {/* Full Width */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">5. Full Width</h3>
        <div className="max-w-xs">
          <Button fullWidth onClick={() => handleClick('Submit Form')}>
            Submit Form
          </Button>
        </div>
      </div>
    </div>
  );
}
