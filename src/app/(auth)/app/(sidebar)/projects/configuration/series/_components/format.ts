import queryClient from '@/utils/query';

export const JOINTS = [
  { value: 'ke_ep_goc', label: 'Ke ép góc' },
  { value: 'ke_vinh_cuu', label: 'Ke vĩnh cửu' },
  { value: 'ke_nhay', label: 'Ke nhảy' },
  { value: 'ke_bat_vit', label: 'Ke bắt vít' },
];

export const jointLabel = (value?: string | null) => (value ? (JOINTS.find((j) => j.value === value)?.label ?? value) : '–');

export const refreshSeries = () => queryClient.invalidateQueries({ queryKey: ['door-series'] });
