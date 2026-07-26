import React from 'react';
import { InteractiveButtons } from './_components/interactive-buttons';
import { InteractiveSelects } from './_components/interactive-selects';
import { InteractiveDropdowns } from './_components/interactive-dropdowns';
import { InteractiveTooltips } from './_components/interactive-tooltips';
import { InteractiveModals } from './_components/interactive-modals';
import { InteractiveForms } from './_components/interactive-forms';
import { InteractiveTabsBadges } from './_components/interactive-tabs-badges';
import { InteractiveLoadersAccs } from './_components/interactive-loaders-accs';
import { InteractiveAlerts } from './_components/interactive-alerts';
import { Heading, Breadcrumb, Avatar } from '@/components';
import { Home, Folder, FileText, Slash } from 'lucide-react';

export default function ComponentsPage() {
  const breadcrumbItems = [
    { label: 'Trang chủ', href: '#', icon: <Home size={14} /> },
    { label: 'Tài liệu', href: '#', icon: <Folder size={14} /> },
    { label: 'Thư viện Components', icon: <FileText size={14} /> },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div>
          <Heading size="h1">XTTech Component Library</Heading>
          <p className="text-gray-500 mt-1">Hệ thống UI components dùng chung toàn dự án.</p>
        </div>

        <hr className="border-gray-200" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Cột bên trái */}
          <div className="space-y-8">
            {/* Color Palette Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Color Palette</Heading>
                <p className="text-sm text-gray-500">
                  Bảng màu tiêu chuẩn đang được áp dụng trong hệ thống.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary & Secondary */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Brand Colors</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-100 rounded-lg overflow-hidden shadow-xs">
                      <div className="h-16 bg-primary" />
                      <div className="p-3 bg-white">
                        <p className="text-xs font-semibold text-gray-900">Primary</p>
                        <p className="text-[10px] text-gray-500 font-mono">#0891b2</p>
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-lg overflow-hidden shadow-xs">
                      <div className="h-16 bg-secondary" />
                      <div className="p-3 bg-white">
                        <p className="text-xs font-semibold text-gray-900">Secondary</p>
                        <p className="text-[10px] text-gray-500 font-mono">#E7F9FC</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Semantic Colors */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Semantic Colors</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-100 rounded-lg overflow-hidden shadow-xs">
                      <div className="h-16 bg-success" />
                      <div className="p-3 bg-white">
                        <p className="text-xs font-semibold text-gray-900">Success</p>
                        <p className="text-[10px] text-gray-500 font-mono">#10b981</p>
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-lg overflow-hidden shadow-xs">
                      <div className="h-16 bg-danger" />
                      <div className="p-3 bg-white">
                        <p className="text-xs font-semibold text-gray-900">Danger</p>
                        <p className="text-[10px] text-gray-500 font-mono">#ef4444</p>
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-lg overflow-hidden shadow-xs">
                      <div className="h-16 bg-warning" />
                      <div className="p-3 bg-white">
                        <p className="text-xs font-semibold text-gray-900">Warning</p>
                        <p className="text-[10px] text-gray-500 font-mono">#f59e0b</p>
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-lg overflow-hidden shadow-xs">
                      <div className="h-16 bg-info" />
                      <div className="p-3 bg-white">
                        <p className="text-xs font-semibold text-gray-900">Info</p>
                        <p className="text-[10px] text-gray-500 font-mono">#3b82f6</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Select Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Select Component</Heading>
                <p className="text-sm text-gray-500">
                  Dropdown chọn lựa chọn đơn giản, hỗ trợ label, error states và custom arrow icon.
                </p>
              </div>

              <InteractiveSelects />
            </section>

            <hr className="border-gray-200" />

            {/* Dropdown Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Dropdown Component</Heading>
                <p className="text-sm text-gray-500">
                  Menu thả xuống đa dạng tùy chọn thao tác nhanh, hỗ trợ icon, disabled, và danger
                  styles.
                </p>
              </div>

              <InteractiveDropdowns />
            </section>

            <hr className="border-gray-200" />

            {/* Breadcrumb Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Breadcrumb Component</Heading>
                <p className="text-sm text-gray-500">
                  Thanh điều hướng phân cấp hỗ trợ liên kết và tùy biến ký tự phân tách.
                </p>
              </div>

              <div className="space-y-4 border border-gray-100 p-4 rounded-lg bg-gray-50/50">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase">
                    Mặc định (Chevron)
                  </h3>
                  <Breadcrumb items={breadcrumbItems} />
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase">
                    Custom Separator (Slash)
                  </h3>
                  <Breadcrumb items={breadcrumbItems} separator={<Slash size={10} />} />
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Modal Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Modal Component (Shell)</Heading>
                <p className="text-sm text-gray-500">
                  Khung bọc Modal dùng chung hỗ trợ các tùy chọn kích thước, overlay mờ và lock
                  scroll.
                </p>
              </div>

              <InteractiveModals />
            </section>

            <hr className="border-gray-200" />

            {/* Tabs & Badges Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Tabs & Badges</Heading>
                <p className="text-sm text-gray-500">
                  Thanh chuyển đổi tab nội dung và nhãn trạng thái trực quan.
                </p>
              </div>

              <InteractiveTabsBadges />
            </section>

            <hr className="border-gray-200" />

            {/* Alert Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Alert Component</Heading>
                <p className="text-sm text-gray-500">
                  Dải thông báo ngang hiển thị trạng thái lỗi, thành công hoặc cảnh báo trong trang.
                </p>
              </div>

              <InteractiveAlerts />
            </section>
          </div>

          {/* Cột bên phải */}
          <div className="space-y-8">
            {/* Button Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Button Component</Heading>
                <p className="text-sm text-gray-500">
                  Hỗ trợ đầy đủ các sizes, variants, loading state và icon.
                </p>
              </div>

              <InteractiveButtons />
            </section>

            <hr className="border-gray-200" />

            {/* Heading Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Heading Component</Heading>
                <p className="text-sm text-gray-500">
                  Tiêu đề chuẩn hóa kích thước chữ (typography) từ H1 đến H6.
                </p>
              </div>

              <div className="space-y-4 border border-gray-100 p-6 rounded-lg bg-gray-50/50">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase">Size h1</span>
                  <Heading size="h1">Heading 1 (30px)</Heading>
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase">Size h2</span>
                  <Heading size="h2">Heading 2 (24px)</Heading>
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase">Size h3</span>
                  <Heading size="h3">Heading 3 (18px)</Heading>
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase">Size h4</span>
                  <Heading size="h4">Heading 4 (16px)</Heading>
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase">Size h5</span>
                  <Heading size="h5">Heading 5 (14px)</Heading>
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase">Size h6</span>
                  <Heading size="h6">Heading 6 (12px)</Heading>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Tooltip Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Tooltip Component</Heading>
                <p className="text-sm text-gray-500">
                  Hiển thị chú thích nhỏ khi di chuột vào phần tử, hỗ trợ nhiều hướng hiển thị và
                  delay.
                </p>
              </div>

              <InteractiveTooltips />
            </section>

            <hr className="border-gray-200" />

            {/* Avatar Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Avatar Component</Heading>
                <p className="text-sm text-gray-500">
                  Ảnh đại diện hỗ trợ initials dự phòng, các kích thước, hình dạng và trạng thái.
                </p>
              </div>

              <div className="space-y-4 border border-gray-100 p-4 rounded-lg bg-gray-50/50">
                {/* Sizes */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase">Kích thước</h3>
                  <div className="flex items-end gap-3">
                    <Avatar size="xs" name="John Doe" />
                    <Avatar size="sm" name="John Doe" />
                    <Avatar size="md" name="John Doe" />
                    <Avatar size="lg" name="John Doe" />
                    <Avatar size="xl" name="John Doe" />
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Shapes */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase">Hình dạng</h3>
                  <div className="flex gap-3">
                    <Avatar size="lg" shape="circle" name="Circle Avatar" />
                    <Avatar size="lg" shape="square" name="Square Avatar" />
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Status Indicator */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase">
                    Trạng thái hoạt động
                  </h3>
                  <div className="flex gap-3">
                    <Avatar size="md" status="online" name="Online User" />
                    <Avatar size="md" status="busy" name="Busy User" />
                    <Avatar size="md" status="away" name="Away User" />
                    <Avatar size="md" status="offline" name="Offline User" />
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Form Controls Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Form Controls</Heading>
                <p className="text-sm text-gray-500">
                  Các phần tử nhập liệu cơ bản bao gồm Input văn bản, Checkbox chọn nhiều và Radio
                  chọn một.
                </p>
              </div>

              <InteractiveForms />
            </section>

            <hr className="border-gray-200" />

            {/* Loaders & Accordions Section */}
            <section className="space-y-6">
              <div>
                <Heading size="h2">Loaders & Accordions</Heading>
                <p className="text-sm text-gray-500">
                  Khung tải giả lập Skeleton và khối nội dung xếp gọn Accordion.
                </p>
              </div>

              <InteractiveLoadersAccs />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
