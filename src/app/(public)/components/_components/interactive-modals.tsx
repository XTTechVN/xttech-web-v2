'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@/components';
import { toast } from 'react-hot-toast';

export function InteractiveModals() {
  const [activeModal, setActiveModal] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);

  const handleConfirm = (size: string) => {
    toast.success(`Xác nhận thao tác trên Modal cỡ: ${size}`);
    setActiveModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Small Modal */}
        <Button variant="outline" onClick={() => setActiveModal('sm')}>
          Small Modal (sm)
        </Button>

        {/* Medium Modal */}
        <Button variant="outline" onClick={() => setActiveModal('md')}>
          Medium Modal (md)
        </Button>

        {/* Large Modal */}
        <Button variant="outline" onClick={() => setActiveModal('lg')}>
          Large Modal (lg)
        </Button>

        {/* Extra Large Modal */}
        <Button variant="outline" onClick={() => setActiveModal('xl')}>
          Extra Large (xl)
        </Button>

        {/* Full Modal */}
        <Button variant="outline" onClick={() => setActiveModal('full')}>
          Full Screen Modal
        </Button>
      </div>

      {/* Rendering Modals dynamically based on active state */}
      {['sm', 'md', 'lg', 'xl', 'full'].map((size) => {
        const sizeTyped = size as 'sm' | 'md' | 'lg' | 'xl' | 'full';
        return (
          <Modal
            key={size}
            isOpen={activeModal === sizeTyped}
            onClose={() => setActiveModal(null)}
            size={sizeTyped}
            title={`XTTech Modal Shell (${sizeTyped.toUpperCase()})`}
            footer={
              <>
                <Button variant="outline" onClick={() => setActiveModal(null)}>
                  Hủy thao tác
                </Button>
                <Button variant="primary" onClick={() => handleConfirm(sizeTyped)}>
                  Xác nhận lưu
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <p>
                Đây là nội dung được render linh động truyền qua prop <strong>children</strong>. 
                Khung bên ngoài của Modal chịu trách nhiệm xử lý các tính năng dùng chung (độ rộng tối đa, đóng khi bấm ESC, khóa cuộn trang, căn giữa màn hình, overlay mờ).
              </p>
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg text-xs font-mono text-gray-500">
                &lt;Modal size="{sizeTyped}" isOpen=&#123;isOpen&#125; onClose=&#123;onClose&#125;&gt;<br />
                &nbsp;&nbsp;&lt;div&gt;Nội dung trang nghiệp vụ&lt;/div&gt;<br />
                &lt;/Modal&gt;
              </div>
            </div>
          </Modal>
        );
      })}
    </div>
  );
}
