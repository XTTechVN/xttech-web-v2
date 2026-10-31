// ============================================================================
// BẢNG THÔNG SỐ TỶ LỆ HÌNH HỌC CAD (THEO MM THỰC TẾ & RENDER CHUẨN XÁC)
// ============================================================================
export const CAD_CONFIG = {
  // 1. KHUNG BAO NGOÀI (FRAME)
  FRAME: {
    DEFAULT_MM: 55,       // Kích thước mặt nhìn khung bao tiêu chuẩn (mm)
    MIN_RENDER_PX: 2,     // Độ dày tối thiểu (px) trên canvas để bảo toàn nét vẽ
  },

  // 2. KHUNG CÁNH (SASH)
  SASH: {
    DOOR_DEFAULT_MM: 85,  // Kích thước mặt nhìn cánh cửa đi tiêu chuẩn (mm)
    WINDOW_DEFAULT_MM: 65,// Kích thước mặt nhìn cánh cửa sổ tiêu chuẩn (mm)
    SLIM_DEFAULT_MM: 28,  // Kích thước mặt nhìn cánh hệ Slim thanh mảnh (mm)
    MIN_RENDER_PX: 2,     // Độ dày tối thiểu (px) trên canvas
  },

  // 3. NẸP KÍNH (GLAZING BEAD)
  BEAD: {
    DEFAULT_MM: 18,       // Kích thước mặt nhìn nẹp kính tiêu chuẩn (mm)
    SLIM_DEFAULT_MM: 12,  // Kích thước mặt nhìn nẹp kính hệ Slim (mm)
    MIN_RENDER_PX: 1.5,   // Độ dày tối thiểu nẹp kính khi vẽ trên canvas (px)
    MAX_PANE_PERCENT: 0.15,// Giới hạn nẹp không vượt quá 15% kích thước cạnh ô kính
  },

  // 4. ĐỐ TĨNH (MULLION) & ĐỐ ĐỘNG (ASTRAGAL)
  MULLION: {
    DEFAULT_MM: 55,       // Kích thước bản đố chia tiêu chuẩn (mm)
    MIN_RENDER_PX: 2,     // Độ dày tối thiểu (px) trên canvas
    ASTRAGAL_RATIO: 0.6,  // Bản rộng đố động giữa 2 cánh so với đố tĩnh
    ASTRAGAL_MIN_PX: 2,
    ASTRAGAL_MAX_PX: 15,
  },
};
