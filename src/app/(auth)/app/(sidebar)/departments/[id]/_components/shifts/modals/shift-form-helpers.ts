import type { WorkShift, WorkShiftCreate } from '@/types';
import type { ShiftFormValues } from './shift-exceptions-section';

export const formatTimeInput = (timeValue?: string): string =>
  timeValue ? timeValue.slice(0, 5) : '';

export const formatToTimeWithSec = (timeValue: string): string =>
  timeValue.length === 5 ? `${timeValue}:00` : timeValue;

export const parseDaysList = (rawDays?: string | null): string[] =>
  rawDays
    ? rawDays
        .split(',')
        .map((day) => day.trim())
        .filter(Boolean)
    : [];

export const buildDefaultShiftFormValues = (
  initialData?: WorkShift | null,
  defaultDepartmentId?: number
): ShiftFormValues => {
  if (!initialData) {
    return {
      name: '',
      startTime: '08:00',
      endTime: '17:30',
      departmentId: defaultDepartmentId ?? '',
      shiftType: 'full_day',
      workDays: ['2', '3', '4', '5', '6'],
      optionalWorkDays: [],
      status: 'active',
      allowedDistance: 200,
      workLatitude: '',
      workLongitude: '',
      exceptions: [],
    };
  }

  return {
    name: initialData.name || '',
    startTime: formatTimeInput(initialData.startTime) || '08:00',
    endTime: formatTimeInput(initialData.endTime) || '17:30',
    departmentId: initialData.departmentId ?? defaultDepartmentId ?? '',
    shiftType: initialData.shiftType || 'full_day',
    workDays: parseDaysList(initialData.workDays),
    optionalWorkDays: parseDaysList(initialData.optionalWorkDays),
    status: initialData.status === 'inactive' ? 'inactive' : 'active',
    workLatitude: initialData.workLatitude ?? '',
    workLongitude: initialData.workLongitude ?? '',
    allowedDistance: initialData.allowedDistance ?? 200,
    exceptions: (initialData.exceptions ?? []).map((ex) => ({
      userId: ex.userId || '',
      checkIn: formatTimeInput(ex.checkIn) || '08:00',
      checkOut: formatTimeInput(ex.checkOut) || '17:30',
      startDate: ex.startDate || '',
      endDate: ex.endDate || '',
    })),
  };
};

export const buildShiftSubmitPayload = (
  formData: ShiftFormValues
): WorkShiftCreate => ({
  name: formData.name.trim(),
  startTime: formatToTimeWithSec(formData.startTime),
  endTime: formatToTimeWithSec(formData.endTime),
  departmentId: Number(formData.departmentId),
  shiftType: formData.shiftType,
  workDays:
    formData.workDays.length > 0 ? [...formData.workDays].sort().join(',') : '',
  optionalWorkDays:
    formData.optionalWorkDays.length > 0
      ? [...formData.optionalWorkDays].sort().join(',')
      : null,
  status: formData.status,
  workLatitude:
    formData.workLatitude !== '' && formData.workLatitude !== undefined
      ? Number(formData.workLatitude)
      : null,
  workLongitude:
    formData.workLongitude !== '' && formData.workLongitude !== undefined
      ? Number(formData.workLongitude)
      : null,
  allowedDistance: formData.allowedDistance
    ? Number(formData.allowedDistance)
    : 200,
  workShiftExceptions: formData.exceptions.map((ex) => ({
    userId: ex.userId,
    checkIn: formatToTimeWithSec(ex.checkIn),
    checkOut: formatToTimeWithSec(ex.checkOut),
    startDate: ex.startDate,
    endDate: ex.endDate,
  })),
});
