import type { TagTone } from '@/components-remake';
import type { Glass } from '@/types';

export const GLASS_TYPES: Record<string, { label: string; tone: TagTone }> = {
  cuong_luc: { label: 'Cường lực', tone: 'blue' },
  dan_an_toan: { label: 'Dán an toàn', tone: 'green' },
  kinh_hop: { label: 'Kính hộp', tone: 'violet' },
  trang: { label: 'Kính phôi/sống', tone: 'slate' },
  panel_alu: { label: 'Panel Alu', tone: 'amber' },
  luoi_muoi: { label: 'Lưới muỗi', tone: 'teal' },
  nan_chop: { label: 'Nan chớp', tone: 'blue' },
  tam_to_ong: { label: 'Tổ ong', tone: 'orange' },
  kinh_hop_rem: { label: 'Kính rèm', tone: 'pink' },
  polycarbonate: { label: 'Polycarbonate', tone: 'teal' },
};

export const glassTypeOf = (g: Glass) => GLASS_TYPES[g.glassType] ?? { label: g.glassType || '–', tone: 'slate' as TagTone };
