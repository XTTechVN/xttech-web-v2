'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Check, Copy, Download } from 'lucide-react';
import { Badge } from '@/components';
import type { AppVersionItem } from '@/types';
import { Drawer } from '../../_components/drawer';
import { dateOf, platformOf } from './version-utils';

const BTN = 'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium active:scale-95';

// Chi tiết một bản phát hành: nội dung cập nhật, sao chép / tải liên kết APK.
export function VersionDrawer({ version: v, latest, onClose }: { version: AppVersionItem; latest: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(v.apkUrl);
      setCopied(true);
      toast.success('Đã sao chép liên kết tải APK');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không sao chép được liên kết');
    }
  };

  return (
    <Drawer title={`Phiên bản ${v.versionName}`} subtitle={`${platformOf(v.platform)} · Build ${v.versionCode}`} onClose={onClose}>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {latest && (
            <Badge size="sm" variant="success">
              Mới nhất
            </Badge>
          )}
          <Badge size="sm" variant={v.forceUpdate ? 'danger' : 'default'}>
            {v.forceUpdate ? 'Bắt buộc cập nhật' : 'Tùy chọn'}
          </Badge>
          <span className="text-xs text-gray-500">Phát hành {dateOf(v.createdAt)}</span>
        </div>
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Nội dung cập nhật</h3>
          {v.changelog?.length ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 [overflow-wrap:anywhere]">
              {v.changelog.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Không có ghi chú.</p>
          )}
        </section>
        {v.apkUrl && (
          <div className="flex gap-2">
            <button type="button" onClick={copy} className={`${BTN} border-gray-300 bg-white text-gray-700`}>
              {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              Sao chép liên kết
            </button>
            <a href={v.apkUrl} target="_blank" rel="noopener noreferrer" className={`${BTN} border-primary bg-primary text-white`}>
              <Download size={18} aria-hidden="true" />
              Tải APK
            </a>
          </div>
        )}
      </div>
    </Drawer>
  );
}
