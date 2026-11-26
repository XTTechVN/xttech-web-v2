import dayjs from 'dayjs';

export const formatRuleDate = (value?: string | null): string => (value ? dayjs(value).format('DD/MM/YYYY') : '—');

export const formatRuleDateTime = (value?: string | null): string => (value ? dayjs(value).format('HH:mm DD/MM/YYYY') : '—');
