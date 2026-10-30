// ============================================================================
// BẢNG THÔNG SỐ TỶ LỆ HÌNH HỌC CAD (DỄ DÀNG CHỈNH SỬA TẠI ĐÂY)
// ============================================================================
export const CAD_CONFIG = {
  // 1. KHUNG BAO NGOÀI (FRAME)
  FRAME: {
    SCALE_RATIO: 0.026, // Tỷ lệ độ dày khung bao theo kích thước tổng thể
    MIN_D: 7,           // Độ dày tối thiểu (px)
    MAX_D: 10,          // Độ dày tối đa (px)
  },

  // 2. KHUNG CÁNH (SASH)
  SASH: {
    DOOR_RATIO: 1.4,    // Cánh cửa đi so với khung bao (85-90mm vs 55-66mm)
    WINDOW_RATIO: 1.15, // Cánh cửa sổ so với khung bao
    SLIM_RATIO: 0.75,   // Hệ cánh Slim thanh mảnh
    DOOR_MIN_D: 14,     // Độ dày tối thiểu cánh cửa đi (px)
    DOOR_MAX_D: 18,     // Độ dày tối đa cánh cửa đi (px)
    WINDOW_MIN_D: 11,   // Độ dày tối thiểu cánh cửa sổ (px)
    WINDOW_MAX_D: 14,   // Độ dày tối đa cánh cửa sổ (px)
    SLIM_MIN_D: 7,      // Độ dày tối thiểu cánh slim (px)
  },

  // 3. NẸP KÍNH (GLAZING BEAD) - ĐÃ TĂNG ĐỘ DÀY ĐẸP MẮT
  BEAD: {
    NORMAL_RATIO: 0.28,     // Tỷ lệ nẹp so với bản cánh (cũ: 0.20 -> mới: 0.28)
    SLIM_RATIO: 0.22,       // Tỷ lệ nẹp hệ Slim (cũ: 0.18 -> mới: 0.22)
    FIXED_RATIO: 0.35,      // Tỷ lệ nẹp vách kính cố định so với khung bao (cũ: 0.25 -> mới: 0.35)
    MIN_W: 4,               // Độ dày nẹp tối thiểu (px) (cũ: 2px -> mới: 4px)
    MAX_W: 6.5,             // Độ dày nẹp tối đa (px) (cũ: 2.8-5px -> mới: 6.5px)
    MAX_PANE_PERCENT: 0.10, // Giới hạn diện tích nẹp chiếm tối đa 10% lòng cánh
  },

  // 4. ĐỐ TĨNH (MULLION) & ĐỐ ĐỘNG (ASTRAGAL)
  MULLION: {
    SCALE_RATIO: 1.0,       // Độ dày đố tĩnh T so với khung bao
    MIN_T: 7,
    MAX_T: 10,
    ASTRAGAL_RATIO: 0.5,    // Đố động giữa 2 cánh so với đố tĩnh
    ASTRAGAL_MIN: 4,
    ASTRAGAL_MAX: 7,
  },
};
