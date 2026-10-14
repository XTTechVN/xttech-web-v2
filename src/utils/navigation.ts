/**
 * Mở Google Maps chỉ đường tới tọa độ đích.
 * Hỗ trợ mở App Google Maps trên thiết bị di động (Android / iOS)
 * hoặc mở tab mới trên trình duyệt máy tính.
 */
export const openGoogleMapsNavigation = (latitude?: number | null, longitude?: number | null) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return;
  if (isNaN(latitude) || isNaN(longitude)) return;
  if (latitude === 0 && longitude === 0) return;

  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
