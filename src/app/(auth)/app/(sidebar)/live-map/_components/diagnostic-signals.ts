import { StaffDeviceDiagnostics } from '@/types';

export type DiagnosticSeverity = 'danger' | 'warning' | 'info';

export interface DiagnosticSignal {
  id: string;
  severity: DiagnosticSeverity;
  label: string;
}

const SEVERITY_ORDER: Record<DiagnosticSeverity, number> = { danger: 0, warning: 1, info: 2 };

/** Ngưỡng (giây) coi là iOS không đẩy vị trí mới */
const STALE_LOCATION_THRESHOLD_SEC = 120;
/** Tỉ lệ điểm bị lọc tối thiểu để cảnh báo */
const HIGH_FILTER_RATIO = 0.5;
const MIN_LOCATIONS_FOR_RATIO = 10;

const AUTHORIZATION_STATUS_MAP: Record<string, string> = {
  when_in_use: 'Chỉ khi dùng ứng dụng',
  denied: 'Bị từ chối',
  restricted: 'Bị hạn chế',
  not_determined: 'Chưa chọn',
  unknown: 'Không xác định',
};

const FAILURE_REASON_MAP: Record<string, string> = {
  timeout: 'quá thời gian chờ',
  no_network: 'mất mạng',
  dns: 'lỗi DNS',
  connect_failed: 'không kết nối được máy chủ',
  tls: 'lỗi bảo mật kết nối',
  network_error: 'lỗi mạng',
  refresh_failed: 'làm mới phiên đăng nhập thất bại',
};

/** Mã lỗi CLError của iOS (domain kCLErrorDomain) */
const LOCATION_ERROR_MAP: Record<number, string> = {
  0: 'Chưa xác định được vị trí (tạm thời)',
  1: 'Hệ thống từ chối cấp vị trí (quyền bị tắt, hoặc máy chưa mở khóa sau khi khởi động)',
  2: 'Lỗi mạng khi lấy vị trí',
};

const PREVIOUS_EXIT_SIGNAL_MAP: Record<string, Omit<DiagnosticSignal, 'id'>> = {
  background_kill_suspected: {
    severity: 'danger',
    label: 'Lần chạy trước app bị đóng khi đang chạy nền (nghi ngờ iOS kết thúc do thiếu RAM hoặc crash)',
  },
  foreground_kill_suspected: {
    severity: 'danger',
    label: 'Lần chạy trước app bị đóng đột ngột khi đang mở (nghi ngờ crash hoặc thiếu RAM)',
  },
  user_terminated: { severity: 'warning', label: 'Nhân viên đã vuốt tắt ứng dụng' },
  device_rebooted: { severity: 'info', label: 'Máy đã khởi động lại' },
  app_updated: { severity: 'info', label: 'App hoặc iOS vừa được cập nhật' },
};

const EXIT_METRIC_GROUPS: { id: string; keys: string[]; severity: DiagnosticSeverity; buildLabel: (count: number) => string }[] = [
  {
    id: 'exit-memory',
    keys: ['bg_memory_limit', 'bg_memory_pressure', 'fg_memory_limit'],
    severity: 'danger',
    buildLabel: (count) => `iOS đã kết thúc app do thiếu RAM ${count} lần`,
  },
  {
    id: 'exit-watchdog',
    keys: ['bg_watchdog', 'fg_watchdog'],
    severity: 'danger',
    buildLabel: (count) => `App bị watchdog kết thúc ${count} lần`,
  },
  {
    id: 'exit-crash',
    keys: ['bg_bad_access', 'bg_abnormal', 'bg_illegal_instruction', 'fg_bad_access', 'fg_abnormal', 'fg_illegal_instruction', 'crash_diagnostics'],
    severity: 'danger',
    buildLabel: (count) => `App crash hoặc thoát bất thường ${count} lần`,
  },
  {
    id: 'exit-background-limit',
    keys: ['bg_cpu_limit', 'bg_task_timeout', 'bg_locked_file'],
    severity: 'warning',
    buildLabel: (count) => `App bị giới hạn khi chạy nền (CPU, tác vụ nền quá hạn) ${count} lần`,
  },
];

export function formatFailureReason(reason: string): string {
  if (reason.startsWith('http_')) return `HTTP ${reason.slice('http_'.length)}`;
  return FAILURE_REASON_MAP[reason] ?? reason;
}

function buildPermissionSignals(diagnostics: StaffDeviceDiagnostics): DiagnosticSignal[] {
  const signals: DiagnosticSignal[] = [];
  const { authorizationStatus, isPreciseLocation } = diagnostics;

  if (authorizationStatus && authorizationStatus !== 'always') {
    const statusLabel = AUTHORIZATION_STATUS_MAP[authorizationStatus] ?? authorizationStatus;
    signals.push({ id: 'permission', severity: 'danger', label: `Quyền vị trí không phải "Luôn luôn": ${statusLabel}` });
  }
  if (isPreciseLocation === false) {
    signals.push({ id: 'precise', severity: 'warning', label: 'Vị trí chính xác đang tắt' });
  }
  return signals;
}

function buildSystemSignals(diagnostics: StaffDeviceDiagnostics): DiagnosticSignal[] {
  const signals: DiagnosticSignal[] = [];

  if (diagnostics.isLowPowerMode) {
    signals.push({ id: 'low-power', severity: 'warning', label: 'Đang bật chế độ tiết kiệm pin' });
  }
  const refreshStatus = diagnostics.backgroundRefreshStatus;
  if (refreshStatus === 'denied' || refreshStatus === 'restricted') {
    signals.push({ id: 'background-refresh', severity: 'warning', label: 'Làm mới ứng dụng trong nền đang tắt' });
  }
  return signals;
}

function buildLifecycleSignals(diagnostics: StaffDeviceDiagnostics): DiagnosticSignal[] {
  const signals: DiagnosticSignal[] = [];
  const previousExitSignal = diagnostics.previousExit ? PREVIOUS_EXIT_SIGNAL_MAP[diagnostics.previousExit] : undefined;

  if (previousExitSignal) {
    signals.push({ id: 'previous-exit', ...previousExitSignal });
  }
  if (diagnostics.launchReason === 'system_location') {
    signals.push({ id: 'system-relaunch', severity: 'info', label: 'App được iOS tự đánh thức lại do sự kiện vị trí' });
  }
  return signals;
}

function buildTransportSignals(diagnostics: StaffDeviceDiagnostics): DiagnosticSignal[] {
  const { consecutiveFailures, lastFailureReason } = diagnostics;
  if (!consecutiveFailures || consecutiveFailures <= 0) return [];

  const reasonText = lastFailureReason ? ` (${formatFailureReason(lastFailureReason)})` : '';
  return [{ id: 'send-failures', severity: 'danger', label: `Gửi ping thất bại ${consecutiveFailures} lần liên tiếp${reasonText}` }];
}

function buildLocationStreamSignals(diagnostics: StaffDeviceDiagnostics): DiagnosticSignal[] {
  const signals: DiagnosticSignal[] = [];
  const { lastLocationAgeSec, receivedLocationCount = 0, filteredLocationCount = 0, lastLocationErrorCode } = diagnostics;

  if (lastLocationAgeSec !== undefined && lastLocationAgeSec > STALE_LOCATION_THRESHOLD_SEC) {
    signals.push({ id: 'stale-location', severity: 'danger', label: `iOS không đẩy vị trí mới trong ${Math.round(lastLocationAgeSec)} giây` });
  }
  if (receivedLocationCount >= MIN_LOCATIONS_FOR_RATIO && filteredLocationCount / receivedLocationCount >= HIGH_FILTER_RATIO) {
    const percent = Math.round((filteredLocationCount / receivedLocationCount) * 100);
    signals.push({ id: 'high-filter', severity: 'warning', label: `${percent}% điểm vị trí bị loại (sai số lớn hoặc quá cũ)` });
  }
  if (lastLocationErrorCode !== undefined) {
    const errorLabel = LOCATION_ERROR_MAP[lastLocationErrorCode] ?? `Lỗi CoreLocation mã ${lastLocationErrorCode}`;
    signals.push({ id: 'location-error', severity: 'warning', label: errorLabel });
  }
  return signals;
}

function buildExitMetricSignals(diagnostics: StaffDeviceDiagnostics): DiagnosticSignal[] {
  const metrics = diagnostics.exitMetrics;
  if (!metrics) return [];

  return EXIT_METRIC_GROUPS.flatMap((group) => {
    const total = group.keys.reduce((sum, key) => sum + (metrics[key] ?? 0), 0);
    if (total <= 0) return [];
    return [{ id: group.id, severity: group.severity, label: group.buildLabel(total) }];
  });
}

/** Tổng hợp các tín hiệu đáng ngờ từ chẩn đoán thiết bị, sắp xếp mức độ nghiêm trọng giảm dần */
export function buildDiagnosticSignals(
  diagnostics?: StaffDeviceDiagnostics,
  options: { awaitingFirstPing?: boolean } = {},
): DiagnosticSignal[] {
  const awaitingSignals: DiagnosticSignal[] = options.awaitingFirstPing
    ? [{ id: 'awaiting-first-ping', severity: 'warning', label: 'Đã check-in nhưng chưa nhận được tín hiệu nào từ thiết bị' }]
    : [];

  return [
    ...awaitingSignals,
    ...(diagnostics
      ? [
          ...buildPermissionSignals(diagnostics),
          ...buildSystemSignals(diagnostics),
          ...buildLifecycleSignals(diagnostics),
          ...buildTransportSignals(diagnostics),
          ...buildLocationStreamSignals(diagnostics),
          ...buildExitMetricSignals(diagnostics),
        ]
      : []),
  ].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

/** Dòng mô tả phiên bản app và thiết bị, ví dụ: "v1.2.0 (34) · iOS 17.5 · iPhone14,5" */
export function formatDeviceSummary(diagnostics?: StaffDeviceDiagnostics): string | null {
  if (!diagnostics) return null;
  const { appVersion, appBuild, osVersion, deviceModel } = diagnostics;

  const parts = [
    appVersion ? `v${appVersion}${appBuild ? ` (${appBuild})` : ''}` : null,
    osVersion ? `iOS ${osVersion}` : null,
    deviceModel ?? null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(' · ') : null;
}
