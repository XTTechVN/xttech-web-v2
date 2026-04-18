'use client';

import { memo, useMemo } from 'react';
import dayjs from 'dayjs';
import { DatePicker, TimePicker as AntdTimePicker } from 'antd';

interface TimePickerProps {
  date: any;
  setDate: (date: any) => void;
  time: number;
  setTime: (time: number) => void;
}

const TimePicker = memo(({ date, setDate, time, setTime }: TimePickerProps) => {
  const timeValue = useMemo(() => {
    return dayjs().startOf('day').add(time, 'second');
  }, [time]);

  const handleTimeChange = (val: any) => {
    if (val) {
      const startOfDay = val.startOf('day');
      const diffInSeconds = val.diff(startOfDay, 'second');
      setTime(diffInSeconds);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <DatePicker value={date} onChange={setDate} format="DD/MM/YYYY" />
      <AntdTimePicker value={timeValue} onChange={handleTimeChange} format="HH:mm" />
    </div>
  );
});

TimePicker.displayName = 'TimePicker';

export default TimePicker;
