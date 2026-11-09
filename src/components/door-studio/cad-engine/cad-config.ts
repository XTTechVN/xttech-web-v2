/**
 * Cấu hình Hằng số Bản vẽ Kỹ thuật CAD 2D (DoorCadRenderer)
 * Toàn bộ kích thước khai báo bằng mm; bản vẽ quy đổi px = mm × scale (tỉ lệ thực tuyệt đối).
 */
export const CAD_CONFIG = {
  FRAME: {
    /** Bản rộng mặt cắt khung bao mặc định (mm) khi chưa gán profile cụ thể */
    DEFAULT_MM: 50,
  },
  SASH: {
    /** Bản rộng cánh cửa đi mặc định (mm) - H >= 1800mm */
    DOOR_DEFAULT_MM: 85,
    /** Bản rộng cánh cửa sổ mặc định (mm) - H < 1800mm */
    WINDOW_DEFAULT_MM: 76,
    /** Bản rộng cánh hệ Slim mặc định (mm) */
    SLIM_DEFAULT_MM: 28,
  },
  BEAD: {
    /** Bản rộng nẹp kính tiêu chuẩn mặc định (mm) */
    DEFAULT_MM: 18,
    /** Bản rộng nẹp kính hệ Slim mặc định (mm) */
    SLIM_DEFAULT_MM: 10,
  },
  MULLION: {
    /** Bản rộng đố tĩnh (Đố T) mặc định (mm) */
    DEFAULT_MM: 50,
    /** Bản rộng đố động (astragal) mặc định giữa 2 cánh mở quay (mm) khi chưa gán profile */
    ASTRAGAL_DEFAULT_MM: 22,
  },
  REVERSAL: {
    /** Bản rộng thanh đảo khung mặc định (mm) khi chưa gán profile */
    DEFAULT_MM: 28,
  },
  /** Ngưỡng độ dày tối thiểu (px) — CHỈ áp dụng cho thumbnail (hideDimensions) để nét không biến mất */
  THUMBNAIL_MIN_PX: 1.5,
  /** Kích thước phụ kiện thực (mm) — nhân scale khi vẽ, có ngưỡng nhìn thấy tối thiểu */
  HARDWARE: {
    /** Ngưỡng nhìn thấy tối thiểu (px) để phụ kiện không biến mất ở cửa rất lớn */
    MIN_VISIBLE_PX: 1.2,
    /** Tay nắm chữ D (cửa lùa) */
    D_HANDLE: { LENGTH_MM: 140, PLATE_WIDTH_MM: 24, REACH_MM: 60 },
    /** Khóa sập âm dài (cửa lùa) */
    SLIDING_LOCK: { LENGTH_MM: 150, WIDTH_MM: 22, CYLINDER_LENGTH_MM: 50, KEY_LENGTH_MM: 25 },
    /** Tay gạt (cửa mở quay / hất / lật) */
    LEVER: { PLATE_LENGTH_MM: 130, PLATE_WIDTH_MM: 26, LEVER_LENGTH_MM: 120, LEVER_THICKNESS_MM: 22 },
    /** Thanh tay nắm ống dài (cửa thủy lực) */
    PULL_BAR: { LENGTH_MM: 750, WIDTH_MM: 32, CAP_LENGTH_MM: 18 },
    /** Tay gạt cánh hất / lật (thanh ngang nhỏ) */
    AWNING_BAR: { LENGTH_MM: 90, THICKNESS_MM: 20 },
  },
} as const;
