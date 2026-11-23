import { Suspense } from 'react';
import { AttendanceHub } from './_components/attendance-hub';

export default function RemakeAttendancesPage() {
  return (
    <Suspense>
      <AttendanceHub />
    </Suspense>
  );
}
