import type {
  DiagAuthStatus,
  DiagGpsErrorCode,
  DiagGpsSource,
  HybridLocationFailure,
} from '@/types';

export const ATTENDANCE_GPS_ACCEPTABLE_ACCURACY_METERS = 35;
export const ATTENDANCE_GPS_COARSE_WARNING_METERS = 150;
export const ATTENDANCE_GPS_NATIVE_TIMEOUT_MS = 8000;
export const ATTENDANCE_GPS_NATIVE_MAX_AGE_MS = 20000;
export const ATTENDANCE_GPS_DESIRED_ACCURACY_METERS = 50;
export const ATTENDANCE_GPS_WEBVIEW_BUDGET_MS = 20000;
export const ATTENDANCE_GPS_REFINE_BUDGET_MS = 8000;
export const ATTENDANCE_GPS_ASSIST_DELAY_MS = 4000;
export const ATTENDANCE_GPS_FRESHNESS_TTL_MS = 30000;
export const ATTENDANCE_GPS_STAGE3_COOLDOWN_MS = 2000;
export const TRACKER_QUICK_PING_MAX_ACCURACY_METERS = 80;

export const DIAG_EVENT_LABELS: Record<string, string> = {
  attendance_gps_failed: 'Lỗi lấy GPS chấm công',
  attendance_gps_coarse: 'GPS chấm công độ chính xác thấp',
  attendance_gps_fallback: 'Chuyển dự phòng WebView GPS',
  attendance_gps_recovered: 'Khôi phục GPS sau khi quay lại app',
  native_method_unsupported: 'Phiên bản app cũ chưa hỗ trợ bridge GPS mới',
  checkin_coarse_coordinates: 'Tọa độ check-in độ chính xác thấp',
  app_launched: 'Khởi động ứng dụng',
  send_recovered_after_failures: 'Khôi phục gửi vị trí sau lỗi',
  ping_without_open_shift: 'Ping vị trí khi không có ca mở',
  ping_ignored_no_baseline: 'Bỏ qua ping do thiếu mốc vị trí',
};

export const DIAG_ERROR_CODE_LABELS: Record<DiagGpsErrorCode, string> = {
  permission_denied: 'Quyền vị trí bị từ chối',
  location_services_disabled: 'Định vị hệ thống đang tắt',
  coarse_accuracy_only: 'Chỉ có vị trí gần đúng',
  timeout: 'Quá thời gian kết nối GPS',
  position_unavailable: 'Không xác định được vị trí',
  battery_saver_restricted: 'Tiết kiệm pin đang hạn chế GPS',
  unsupported: 'Thiết bị không hỗ trợ định vị',
  native_unimplemented: 'App bản cũ chưa có API GPS native',
  unknown: 'Lỗi định vị không xác định',
};

export const DIAG_SOURCE_LABELS: Record<DiagGpsSource, string> = {
  native_fused: 'Native Fused (GMS)',
  native_gps: 'Native GPS vệ tinh',
  native_network: 'Native Mạng/Wi-Fi',
  native_passive: 'Native Passive',
  native_corelocation: 'Native CoreLocation (iOS)',
  native_cache: 'Bộ nhớ đệm Native',
  native_unknown: 'Native không xác định',
  webview_watch: 'WebView WatchPosition',
  webview_low_accuracy: 'WebView Mạng/Wi-Fi',
  webview_cached: 'Bộ nhớ đệm WebView',
  none: 'Không có nguồn',
};

export const DIAG_AUTH_STATUS_LABELS: Record<DiagAuthStatus, string> = {
  always: 'Luôn luôn',
  when_in_use: 'Chỉ khi dùng ứng dụng',
  denied: 'Bị từ chối',
  restricted: 'Bị hạn chế',
  not_determined: 'Chưa chọn',
  unknown: 'Không xác định',
};

export const WHEN_IN_USE_CHECKIN_BANNER =
  'Quyền vị trí đang ở mức "Khi dùng ứng dụng". Bạn vẫn có thể chấm công bình thường; nên bật "Luôn luôn" trong Cài đặt để ghi nhận lộ trình khi khóa màn hình.';

export const COARSE_ACCURACY_BANNER =
  'Độ chính xác vị trí hiện đang thấp (vị trí gần đúng). Hãy bật "Vị trí chính xác" trong Cài đặt để cải thiện tọa độ.';

export type DiagGuidePlatform = 'android' | 'ios' | 'desktop';

export type LocationPrimaryAction =
  | 'open_settings'
  | 'open_location_settings'
  | 'request_permission'
  | 'retry';

export interface LocationDiagGuidance {
  title: string;
  description: string;
  steps: Record<DiagGuidePlatform, string>;
  primaryAction: LocationPrimaryAction;
  primaryActionLabel: string;
}

const MANUFACTURER_BATTERY_HINTS: Array<{ match: string; hint: string }> = [
  {
    match: 'xiaomi',
    hint: 'Trên Xiaomi/Redmi: vào Bảo mật → Pin → Tắt Tiết kiệm pin và bật Tự khởi chạy cho XTTech.',
  },
  {
    match: 'redmi',
    hint: 'Trên Xiaomi/Redmi: vào Bảo mật → Pin → Tắt Tiết kiệm pin và bật Tự khởi chạy cho XTTech.',
  },
  {
    match: 'oppo',
    hint: 'Trên OPPO/Realme: vào Cài đặt → Pin → Tắt Tiết kiệm pin và cho phép XTTech chạy nền.',
  },
  {
    match: 'realme',
    hint: 'Trên OPPO/Realme: vào Cài đặt → Pin → Tắt Tiết kiệm pin và cho phép XTTech chạy nền.',
  },
  {
    match: 'vivo',
    hint: 'Trên Vivo: vào Cài đặt → Pin → Chế độ bình thường & cho phép XTTech tiêu thụ pin nền cao.',
  },
  {
    match: 'samsung',
    hint: 'Trên Samsung: vào Cài đặt → Pin → Tắt Tiết kiệm pin và đưa XTTech khỏi danh sách ứng dụng ngủ.',
  },
  {
    match: 'huawei',
    hint: 'Trên Huawei/Honor: vào Cài đặt → Pin → Khởi chạy ứng dụng → Quản lý thủ công cho XTTech.',
  },
];

function getManufacturerBatteryHint(manufacturer?: string): string | null {
  if (!manufacturer) return null;
  const lower = manufacturer.toLowerCase();
  const matched = MANUFACTURER_BATTERY_HINTS.find((item) => lower.includes(item.match));
  return matched ? matched.hint : null;
}

export function getLocationErrorGuidance(failure: HybridLocationFailure): LocationDiagGuidance {
  switch (failure.errorCode) {
    case 'permission_denied': {
      const canRequest = failure.canRequestPermission;
      return {
        title: 'Quyền vị trí đang bị tắt',
        description: 'Ứng dụng chưa được cấp quyền truy cập vị trí để xác nhận điểm danh.',
        steps: {
          android:
            'Cài đặt → Ứng dụng → XTTech → Quyền → Vị trí → Chọn "Cho phép khi dùng ứng dụng" và bật "Vị trí chính xác".',
          ios:
            'Cài đặt iPhone → Quyền riêng tư & Bảo mật → Dịch vụ định vị → XTTech → Chọn "Khi dùng ứng dụng" và bật "Vị trí chính xác".',
          desktop:
            'Bấm biểu tượng Ổ khóa bên trái thanh địa chỉ trình duyệt → Bật Cho phép Vị trí (Location).',
        },
        primaryAction: canRequest
          ? 'request_permission'
          : failure.canOpenSettings
            ? 'open_settings'
            : 'retry',
        primaryActionLabel: canRequest
          ? 'Cấp quyền vị trí'
          : failure.canOpenSettings
            ? 'Mở Cài đặt'
            : 'Thử lại',
      };
    }

    case 'location_services_disabled':
      return {
        title: 'Định vị hệ thống (GPS) đang tắt',
        description: 'Thiết bị đang tắt dịch vụ định vị chung, nên không thể lấy tọa độ chấm công.',
        steps: {
          android: 'Kéo thanh thông báo xuống và bật "Vị trí" (Location), hoặc vào Cài đặt → Vị trí → Bật.',
          ios: 'Cài đặt iPhone → Quyền riêng tư & Bảo mật → Dịch vụ định vị → Bật công tắc trên cùng.',
          desktop: 'Kiểm tra cài đặt Dịch vụ vị trí (Location Services) của hệ điều hành và bật lên.',
        },
        primaryAction: failure.canOpenLocationSettings ? 'open_location_settings' : 'retry',
        primaryActionLabel: failure.canOpenLocationSettings ? 'Mở Cài đặt vị trí' : 'Thử lại',
      };

    case 'battery_saver_restricted': {
      const oemHint = getManufacturerBatteryHint(failure.manufacturer);
      return {
        title: 'Chế độ Tiết kiệm pin đang hạn chế GPS',
        description:
          oemHint ||
          'Thiết bị đang bật Tiết kiệm pin hoặc hạn chế định vị nền khiến GPS không phản hồi kịp.',
        steps: {
          android:
            oemHint ||
            'Tắt chế độ Tiết kiệm pin trên thanh trạng thái, bật Wi-Fi và bấm "Thử lại".',
          ios: 'Vào Cài đặt → Pin → Tắt "Chế độ nguồn điện thấp" (Low Power Mode) rồi bấm "Thử lại".',
          desktop: 'Tắt chế độ tiết kiệm pin trên laptop và bật Wi-Fi để cải thiện định vị.',
        },
        primaryAction: 'retry',
        primaryActionLabel: 'Thử lại',
      };
    }

    case 'coarse_accuracy_only':
      return {
        title: 'Chỉ lấy được vị trí gần đúng',
        description: 'Vị trí chính xác (Precise Location) đang tắt hoặc tín hiệu vệ tinh quá yếu.',
        steps: {
          android: 'Cài đặt → Ứng dụng → XTTech → Quyền → Vị trí → Bật "Sử dụng vị trí chính xác".',
          ios: 'Cài đặt iPhone → XTTech → Vị trí → Bật "Vị trí chính xác" (Precise Location).',
          desktop: 'Kết nối Wi-Fi ổn định để trình duyệt cải thiện độ chính xác.',
        },
        primaryAction: failure.canOpenSettings ? 'open_settings' : 'retry',
        primaryActionLabel: failure.canOpenSettings ? 'Mở Cài đặt' : 'Thử lại',
      };

    case 'timeout':
    case 'position_unavailable':
      return {
        title:
          failure.errorCode === 'timeout'
            ? 'Quá thời gian kết nối GPS'
            : 'Chưa xác định được vị trí hiện tại',
        description:
          'Tín hiệu GPS trong nhà kín hoặc tầng hầm yếu. Hãy bật Wi-Fi để hỗ trợ định vị hoặc bước ra gần cửa sổ/nơi thoáng.',
        steps: {
          android: 'Bật Wi-Fi (không cần kết nối mạng) và đặt chế độ định vị Độ chính xác cao, sau đó bấm "Thử lại".',
          ios: 'Bật Wi-Fi để hỗ trợ định vị trong nhà, kiểm tra Dịch vụ định vị đang bật và bấm "Thử lại".',
          desktop: 'Bật Wi-Fi và cho phép trình duyệt truy cập vị trí, sau đó bấm "Thử lại".',
        },
        primaryAction: 'retry',
        primaryActionLabel: 'Thử lại',
      };

    case 'unsupported':
      return {
        title: 'Thiết bị không hỗ trợ định vị',
        description: 'Trình duyệt hoặc thiết bị hiện tại không cung cấp dịch vụ Geolocation.',
        steps: {
          android: 'Vui lòng mở bằng ứng dụng XTTech hoặc trình duyệt Chrome mới nhất.',
          ios: 'Vui lòng mở bằng ứng dụng XTTech hoặc Safari phiên bản mới nhất.',
          desktop: 'Sử dụng Chrome, Edge hoặc Safari qua kết nối HTTPS bảo mật.',
        },
        primaryAction: 'retry',
        primaryActionLabel: 'Thử lại',
      };

    default:
      return {
        title: 'Không thể lấy tọa độ GPS',
        description: failure.errorMessage || 'Đã xảy ra lỗi khi lấy vị trí hiện tại. Vui lòng thử lại.',
        steps: {
          android: 'Kiểm tra bật Vị trí, bật Wi-Fi và quyền Vị trí cho XTTech, sau đó bấm "Thử lại".',
          ios: 'Kiểm tra Dịch vụ định vị và quyền Vị trí cho XTTech, sau đó bấm "Thử lại".',
          desktop: 'Kiểm tra quyền Vị trí của trình duyệt và bấm "Thử lại".',
        },
        primaryAction: failure.canOpenSettings ? 'open_settings' : 'retry',
        primaryActionLabel: failure.canOpenSettings ? 'Mở Cài đặt' : 'Thử lại',
      };
  }
}
