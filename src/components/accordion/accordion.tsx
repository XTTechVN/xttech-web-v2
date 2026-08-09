'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AccordionItemProps {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemProps[];
  allowMultiple?: boolean;
  className?: string;
  defaultExpandedIds?: string[];
}

const Accordion: React.FC<AccordionProps> = ({
  items = [],
  allowMultiple = false,
  className,
  defaultExpandedIds = [],
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      if (expandedIds.includes(id)) {
        setExpandedIds(expandedIds.filter((itemId) => itemId !== id));
      } else {
        setExpandedIds([...expandedIds, id]);
      }
    } else {
      if (expandedIds.includes(id)) {
        setExpandedIds([]);
      } else {
        setExpandedIds([id]);
      }
    }
  };

  return (
    <div className={cn('divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white', className)}>
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);

        return (
          <div key={item.id} className="flex flex-col">
            {/* Header Trigger */}
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-gray-800 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
            >
              <span className="text-sm font-semibold">{item.title}</span>
              <ChevronDown
                size={16}
                className={cn(
                  'text-gray-500 transition-transform duration-200',
                  isExpanded && 'transform rotate-180 text-primary'
                )}
              />
            </button>

            {/* Content Body */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 py-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/30">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

Accordion.displayName = 'Accordion';

export default Accordion;
export { Accordion };
