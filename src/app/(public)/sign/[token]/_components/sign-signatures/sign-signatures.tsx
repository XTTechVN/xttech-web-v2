import type { ESignature, EvidenceMediaItem } from '@/types';
import { getFileUrl } from '@/utils/string';

export function SignSignatures({ signatures }: { signatures: ESignature[] }) {
  if (signatures.length === 0) return null;
  return (
    <section aria-label="Chữ ký" className="grid grid-cols-2 gap-3">
      {signatures.map((sig) => (
        <div key={sig.id} className="rounded-xl border border-stone-200 bg-white p-2 text-center shadow-sm">
          { }
          <img src={sig.signatureImage} alt={sig.signerName} className="mx-auto h-16 object-contain" />
          <div className="text-xs font-semibold text-stone-900">{sig.signerName}</div>
          <div className="text-[11px] text-stone-600">
            {sig.party === 'company' ? 'Đại diện công ty' : 'Khách hàng'} · {new Date(sig.signedAt).toLocaleString('vi-VN')}
          </div>
        </div>
      ))}
    </section>
  );
}

export function SignPhotos({ photos }: { photos: EvidenceMediaItem[] }) {
  if (photos.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Ảnh nghiệm thu thực tế</h2>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
           
          <img
            key={photo.url}
            src={getFileUrl(photo.url)}
            alt={photo.name ?? 'Ảnh nghiệm thu'}
            className="aspect-square w-full rounded-md border border-stone-200 object-cover"
          />
        ))}
      </div>
    </section>
  );
}
