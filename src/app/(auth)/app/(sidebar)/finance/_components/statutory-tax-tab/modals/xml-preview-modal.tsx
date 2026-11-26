'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Download, FileCode2 } from 'lucide-react';
import { Alert, Badge, Button, Modal, Skeleton } from '@/components';
import { downloadStatutoryXml, getStatutoryXmlPreview } from '@/actions';
import { getErrorMessage, showErrorToast, showSuccessToast } from '@/utils';

export interface XmlPreviewModalProps {
  isOpen: boolean;
  filingId: number | null;
  canDownloadXml: boolean;
  downloadBlockedReason?: string | null;
  onClose: () => void;
}

export function XmlPreviewModal({
  isOpen,
  filingId,
  canDownloadXml,
  downloadBlockedReason,
  onClose,
}: XmlPreviewModalProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['finance', 'statutory', 'xml-preview', filingId],
    queryFn: () => getStatutoryXmlPreview(filingId as number),
    enabled: isOpen && Boolean(filingId),
  });

  const handleCopy = async () => {
    if (!data?.xmlContent) return;
    try {
      await navigator.clipboard.writeText(data.xmlContent);
      setCopied(true);
      showSuccessToast('Đã sao chép nội dung XML HTKK');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showErrorToast('Không thể sao chép vào clipboard');
    }
  };

  const handleDownload = async () => {
    if (!filingId) return;
    setDownloading(true);
    try {
      const res = await downloadStatutoryXml(filingId, data?.filename);
      await queryClient.invalidateQueries({ queryKey: ['finance', 'statutory'] });
      showSuccessToast(`Đã tải XML HTKK: ${res.filename}`);
    } catch (err) {
      showErrorToast(err, 'Không thể xuất file XML HTKK');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <FileCode2 size={16} className="text-primary" />
          <span>Xem trước XML HTKK {data ? `— ${data.filename}` : ''}</span>
        </div>
      }
    >
      <div className="space-y-3 text-xs">
        {isError && (
          <Alert variant="danger" title="Không thể tạo bản xem trước XML HTKK">
            {getErrorMessage(error)}
          </Alert>
        )}

        {isLoading || !data ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="sm">{data.formCode}</Badge>
                <Badge variant="info" size="sm">{data.circularCode}</Badge>
                <Badge variant="default" size="sm">HTKK {data.targetHtkkVersion}</Badge>
              </div>
              <div className="font-mono text-[11px] text-slate-600">
                SHA-256: <span className="font-semibold text-slate-900">{data.sha256.slice(0, 20)}...</span>
              </div>
            </div>

            {!canDownloadXml && downloadBlockedReason && (
              <Alert variant="warning" title="Chưa thể xuất file XML chính thức">
                {downloadBlockedReason}
              </Alert>
            )}

            <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] leading-relaxed overflow-auto max-h-[50vh] border border-slate-800">
              {data.xmlContent}
            </pre>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Đóng
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
              >
                {copied ? 'Đã sao chép' : 'Sao chép XML'}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={!canDownloadXml}
                loading={downloading}
                onClick={handleDownload}
                leftIcon={<Download size={14} />}
              >
                Tải xuống .xml
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
