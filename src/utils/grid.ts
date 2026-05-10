export const getGrid = (total: number) => {
  if (total <= 1) return '1x1';
  if (total <= 2) return '1x2';
  if (total <= 3) return '1x3';
  if (total <= 4) return '2x2';
  if (total <= 6) return '2x3';
  if (total <= 9) return '3x3';
  if (total <= 12) return '3x4';
  if (total <= 16) return '4x4';
  if (total <= 20) return '4x5';
  if (total <= 25) return '5x5';
  if (total <= 30) return '5x6';
  if (total <= 36) return '6x6';
  return '6x6';
};

export const getTotalPorts = (total: number) => {
  if (total <= 1) return 1;
  if (total <= 2) return 2;
  if (total <= 3) return 3;
  if (total <= 4) return 4;
  if (total <= 6) return 6;
  if (total <= 9) return 9;
  if (total <= 12) return 12;
  if (total <= 16) return 16;
  if (total <= 20) return 20;
  if (total <= 25) return 25;
  if (total <= 30) return 30;
  if (total <= 36) return 36;
  return 36;
};

export const getGridClass = (total: number) => {
  if (total <= 1) return 'grid-cols-1 grid-rows-1';
  if (total <= 2) return 'grid-cols-2 grid-rows-1';
  if (total <= 3) return 'grid-cols-2 grid-rows-2';
  if (total <= 4) return 'grid-cols-2 grid-rows-2';
  if (total <= 6) return 'grid-cols-3 grid-rows-2';
  if (total <= 9) return 'grid-cols-3 grid-rows-3';
  if (total <= 12) return 'grid-cols-3 grid-rows-4';
  if (total <= 16) return 'grid-cols-4 grid-rows-4';
  if (total <= 20) return 'grid-cols-4 grid-rows-5';
  if (total <= 25) return 'grid-cols-5 grid-rows-5';
  if (total <= 30) return 'grid-cols-5 grid-rows-6';
  if (total <= 36) return 'grid-cols-6 grid-rows-6';
  return 'grid-cols-6 grid-rows-6';
};
