/**
 * Cấu hình Hằng số Bản vẽ Kỹ thuật CAD 2D (DoorCadRenderer)
 * Tập trung toàn bộ thông số hình học mặc định và độ dày tối thiểu (px)
 * để dễ dàng hiệu chỉnh tỷ lệ hiển thị đồng nhất trên toàn hệ thống.
 */
export const CAD_CONFIG = {
  FRAME: {
    /** Bản rộng mặt cắt khung bao mặc định (mm) khi chưa gán profile cụ thể */
    DEFAULT_MM: 50,
    /** Độ dày hiển thị tối thiểu trên SVG (px) để không bị mảnh khi thu nhỏ */
    MIN_RENDER_PX: 10,
  },
  SASH: {
    /** Bản rộng cánh cửa đi mặc định (mm) - H >= 1800mm */
    DOOR_DEFAULT_MM: 85,
    /** Bản rộng cánh cửa sổ mặc định (mm) - H < 1800mm */
    WINDOW_DEFAULT_MM: 76,
    /** Bản rộng cánh hệ Slim mặc định (mm) */
    SLIM_DEFAULT_MM: 28,
    /** Độ dày hiển thị tối thiểu trên SVG (px) */
    MIN_RENDER_PX: 10,
  },
  BEAD: {
    /** Bản rộng nẹp kính tiêu chuẩn mặc định (mm) */
    DEFAULT_MM: 18,
    /** Bản rộng nẹp kính hệ Slim mặc định (mm) */
    SLIM_DEFAULT_MM: 10,
    /** Độ dày hiển thị tối thiểu trên SVG (px) */
    MIN_RENDER_PX: 3,
    /** Tỷ lệ tối đa của nẹp so với kích thước lòng kính */
    MAX_PANE_PERCENT: 0.085,
  },
  MULLION: {
    /** Bản rộng đố tĩnh (Đố T) mặc định (mm) */
    DEFAULT_MM: 50,
    /** Độ dày hiển thị tối thiểu trên SVG (px) */
    MIN_RENDER_PX: 9,
    /** Độ dày tối thiểu thanh đố động (astragal) giữa 2 cánh mở quay (px) */
    ASTRAGAL_MIN_PX: 3,
    /** Độ dày tối đa thanh đố động (astragal) giữa 2 cánh mở quay (px) */
    ASTRAGAL_MAX_PX: 7,
    /** Tỷ lệ đố động so với đố tĩnh */
    ASTRAGAL_RATIO: 0.45,
  },
} as const;

/**
 * Tỷ lệ chuẩn hiển thị CAD 2D cân đối cho hệ khung vòm & cửa cong
 */
export const CAD_PROPORTIONS = {
  frameD: 12,
  mullionD: 12,
  sashD: 15,
  slimSashD: 8,
  beadD: 4,
  slimBeadD: 2.5,
} as const;
