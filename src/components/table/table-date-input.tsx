'use client';

import { useState } from 'react';

const COMPLETE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_COMMIT_YEAR = 1900;

interface ITableDateInputProps {
  value?: string;
  onCommit: (value?: string) => void;
  className?: string;
}

// Ô ngày chỉ có năm đủ 4 chữ số và >= 1900 mới được coi là giá trị hoàn chỉnh
// (khi đang gõ năm, trình duyệt phát ra các giá trị trung gian như 0002, 0020, 0202)
function isCommittableDate(dateValue: string): boolean {
  return (
    COMPLETE_DATE_PATTERN.test(dateValue) && Number(dateValue.slice(0, 4)) >= MIN_COMMIT_YEAR
  );
}

/**
 * Ô nhập ngày giữ giá trị đang gõ ở state cục bộ, chỉ báo lên component cha khi
 * giá trị đã hoàn chỉnh hoặc khi rời ô, tránh render/gọi API với giá trị gõ dở.
 */
export function TableDateInput({ value, onCommit, className }: ITableDateInputProps) {
  const [draft, setDraft] = useState(value ?? '');
  const [prevValue, setPrevValue] = useState(value);

  // Đồng bộ khi component cha đổi giá trị (preset, xóa bộ lọc...)
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value ?? '');
  }

  const currentValue = value ?? '';

  return (
    <input
      type="date"
      value={draft}
      onChange={(e) => {
        const nextValue = e.target.value;
        setDraft(nextValue);
        if (isCommittableDate(nextValue) && nextValue !== currentValue) {
          onCommit(nextValue);
        }
      }}
      onBlur={(e) => {
        // Đang gõ dở (badInput) thì không coi là xóa giá trị
        if (e.currentTarget.validity.badInput) return;
        const nextValue = e.currentTarget.value;
        if (nextValue === currentValue) return;
        if (nextValue === '' || isCommittableDate(nextValue)) {
          onCommit(nextValue || undefined);
        }
      }}
      className={className}
    />
  );
}
