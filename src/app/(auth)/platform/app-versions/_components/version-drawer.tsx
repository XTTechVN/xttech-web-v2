'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Check, Copy, Download } from 'lucide-react';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, InfoRow, Tag } from '@/components-remake';
import type { AppVersionItem } from '@/types';
import { dateOf, platformOf } from './version-utils';

interface Props {
  version: AppVersionItem | null;
  latest: boolean;
  onClose: () => void;
}

// Chi tiết một bản phát hành: nội dung cập nhật, sao chép / tải liên kết APK
export function VersionDrawer({ version: v, latest, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(v!.apkUrl);
      setCopied(true);
      toast.success('Đã sao chép liên kết tải APK');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không sao chép được liên kết');
    }
  };

  return (
    <Drawer isOpen={!!v} onClose={onClose} label="Chi tiết phiên bản">
      {v && (
        <>
          <DrawerHeader compact title={`Phiên bản ${v.versionName}`} onClose={onClose} />
          <DrawerBody>
            <div className="pt-4">
              <DrawerSection title="Thông tin">
                <InfoRow label="Nền tảng">{platformOf(v.platform)}</InfoRow>
                <InfoRow label="Build">{v.versionCode}</InfoRow>
                <InfoRow label="Phát hành">{dateOf(v.createdAt)}</InfoRow>
                <InfoRow label="Trạng thái">
                  <span className="flex flex-wrap gap-1.5">
                    {latest && <Tag tone="green">Mới nhất</Tag>}
                    <Tag tone={v.forceUpdate ? 'red' : 'slate'}>{v.forceUpdate ? 'Bắt buộc cập nhật' : 'Tùy chọn'}</Tag>
                  </span>
                </InfoRow>
              </DrawerSection>
              <DrawerSection title="Nội dung cập nhật">
                {v.changelog?.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-900 [overflow-wrap:anywhere]">
                    {v.changelog.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Không có ghi chú.</p>
                )}
              </DrawerSection>
            </div>
          </DrawerBody>
          {v.apkUrl && (
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" icon={copied ? <Check size={16} /> : <Copy size={16} />} onClick={copy}>
                  Sao chép liên kết
                </Button>
                <a
                  href={v.apkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-white active:scale-95 md:h-10"
                >
                  <Download size={16} aria-hidden="true" />
                  Tải APK
                </a>
              </div>
            </DrawerFooter>
          )}
        </>
      )}
    </Drawer>
  );
}
