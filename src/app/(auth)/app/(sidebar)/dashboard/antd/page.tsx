'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  Empty,
  Flex,
  List,
  Progress,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import viVN from 'antd/locale/vi_VN';
import { CheckCircle2, ClockAlert, FolderGit2, Users } from 'lucide-react';
import {
  getAuditLogs,
  getDashboardSummary,
  getLiveLocations,
  getStaffTaskSummary,
} from '@/actions';
import { getDocumentRules } from '@/actions/document';
import { useCan } from '@/hooks';
import { RULES_QUERY_KEYS, getFileUrl } from '@/utils';
import { QUICK_ACTIONS_REGISTRY } from '../_components/quick-actions-grid/quick-actions.constants';

const { Title, Text } = Typography;

const THEME = {
  token: {
    colorPrimary: '#045863',
    borderRadius: 8,
    fontFamily: 'var(--font-be-vietnam), sans-serif',
  },
  components: {
    Card: { headerFontSize: 14 },
  },
};

const HEADING = { fontFamily: 'var(--font-lexend), sans-serif' };

const fmtTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <span style={HEADING}>{children}</span>
);

export default function DashboardAntdPage() {
  const router = useRouter();
  const { can, canAny, isReady } = useCan();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary(),
    refetchInterval: 60000,
  });
  const { data: tasks } = useQuery({
    queryKey: ['dashboard-antd-tasks'],
    queryFn: () => getStaffTaskSummary({ scope: 'mine' }),
    enabled: isReady && can('staff_task:read'),
  });
  const { data: rules } = useQuery({
    queryKey: RULES_QUERY_KEYS.list({ scope: 'all', status: 'published', limit: 5, offset: 0 }),
    queryFn: () => getDocumentRules({ scope: 'all', status: 'published', limit: 5, offset: 0 }),
    enabled: isReady && can('rule:read'),
  });
  const { data: live = [] } = useQuery({
    queryKey: ['dashboard-live-locations'],
    queryFn: () => getLiveLocations(),
    enabled: isReady && can('live_map:read'),
    refetchInterval: 30000,
  });
  const { data: audit } = useQuery({
    queryKey: ['dashboard-antd-audit'],
    queryFn: () => getAuditLogs({ limit: 8 }),
    enabled: isReady && can('audit_log:read'),
  });

  if (!isReady) return null;

  const att = data?.myAttendance;
  const pending = (data?.pendingLeavesCount ?? 0) + (data?.pendingAdjustmentsCount ?? 0);
  const weekly = data?.weeklyStats ?? [];
  const weeklyMax = Math.max(1, data?.totalEmployees ?? 0, ...weekly.map((d) => d.presentCount));
  const auditItems = Array.isArray(audit) ? audit : (audit as { items?: unknown[] } | undefined)?.items ?? [];
  const actions = QUICK_ACTIONS_REGISTRY.filter((a) => canAny(a.permissions));

  const stats = [
    { title: 'Tổng nhân sự', value: data?.totalEmployees, icon: <Users size={18} />, href: '/app/employees' },
    { title: 'Chuyên cần hôm nay', value: data?.todayAttendancesCount, icon: <CheckCircle2 size={18} />, href: '/app/attendances' },
    { title: 'Hồ sơ chờ phê duyệt', value: pending, icon: <ClockAlert size={18} />, href: '/app/leave-requests' },
    { title: 'Dự án đang triển khai', value: data?.activeProjectsCount, icon: <FolderGit2 size={18} />, href: '/app/projects' },
  ];

  return (
    <ConfigProvider theme={THEME} locale={viVN}>
      <Flex vertical gap={16} className="p-4">
        <Alert
          type="info"
          showIcon
          title="Bản thử Ant Design"
          description={
            <>
              Trang này chỉ để so sánh. Bản đang dùng vẫn ở <Link href="/app/dashboard">/app/dashboard</Link>.
            </>
          }
        />

        <Row gutter={[16, 16]}>
          {stats.map((s) => (
            <Col key={s.title} xs={12} lg={6}>
              <Card hoverable onClick={() => router.push(s.href)} size="small">
                <Statistic title={s.title} value={s.value ?? 0} loading={isLoading} prefix={s.icon} />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Flex vertical gap={16}>
              <Card title={<CardTitle>Chấm công hôm nay</CardTitle>} extra={
                can(att?.checkIn && !att?.checkOut ? 'attendance:checkout' : 'attendance:checkin') && (
                  <Button type="primary" onClick={() => router.push('/app/attendances')}>
                    {att?.checkIn && !att?.checkOut ? 'Tan ca' : 'Vào ca'}
                  </Button>
                )
              }>
                {isLoading ? <Skeleton active /> : (
                  <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                    <Descriptions.Item label="Ca làm việc">{att?.workShiftName || 'Linh hoạt'}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      {att?.checkIn ? <Tag color={att.isLate ? 'warning' : 'success'}>{att.isLate ? `Đi muộn ${att.lateMinutes ?? 0} phút` : 'Đúng giờ'}</Tag> : <Tag>Chưa vào ca</Tag>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giờ vào">{fmtTime(att?.checkIn)}</Descriptions.Item>
                    <Descriptions.Item label="Giờ ra">{fmtTime(att?.checkOut)}</Descriptions.Item>
                  </Descriptions>
                )}
              </Card>

              {can('staff_task:read') && (
                <Card title={<CardTitle>Công việc của tôi</CardTitle>} extra={<Link href="/app/tasks">Xem tất cả</Link>}>
                  <Row gutter={16}>
                    <Col span={6}><Statistic title="Đang mở" value={tasks?.openCount ?? 0} /></Col>
                    <Col span={6}><Statistic title="Sắp hạn" value={tasks?.dueSoonCount ?? 0} styles={{ content: { color: '#d48806' } }} /></Col>
                    <Col span={6}><Statistic title="Quá hạn" value={tasks?.overdueCount ?? 0} styles={{ content: { color: '#cf1322' } }} /></Col>
                    <Col span={6}><Statistic title="Xong hôm nay" value={tasks?.completedTodayCount ?? 0} styles={{ content: { color: '#389e0d' } }} /></Col>
                  </Row>
                </Card>
              )}

              <Card title={<CardTitle>Chấm công 7 ngày</CardTitle>}>
                {weekly.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" /> : (
                  <Flex vertical gap={8}>
                    {weekly.map((d) => (
                      <Flex key={d.date} align="center" gap={12}>
                        <Text style={{ width: 48 }}>{d.dayName}</Text>
                        <Progress percent={Math.round((d.presentCount / weeklyMax) * 100)} format={() => `${d.presentCount}`} style={{ flex: 1, margin: 0 }} />
                        {d.lateCount > 0 && <Tag color="warning">Muộn {d.lateCount}</Tag>}
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Card>

              {can('leave_request:review') && (
                <Card title={<CardTitle>Yêu cầu chờ bạn phê duyệt <Badge count={pending} /></CardTitle>}>
                  <List
                    locale={{ emptyText: 'Không có yêu cầu nào đang chờ' }}
                    dataSource={[
                      ...(data?.recentPendingLeaves ?? []).map((l) => ({ key: `l${l.id}`, name: l.userFullName, avatar: l.userAvatar, tag: 'Nghỉ phép', text: `${l.totalDays} ngày · ${l.reason}`, href: '/app/leave-requests' })),
                      ...(data?.recentPendingAdjustments ?? []).map((a) => ({ key: `a${a.id}`, name: a.userFullName, avatar: a.userAvatar, tag: 'Điều chỉnh công', text: a.reason, href: '/app/attendances/adjustments' })),
                    ]}
                    renderItem={(it) => (
                      <List.Item key={it.key} actions={[<Link key="go" href={it.href}>Xử lý</Link>]}>
                        <List.Item.Meta
                          avatar={<Avatar src={it.avatar ? getFileUrl(it.avatar) : undefined}>{it.name.charAt(0)}</Avatar>}
                          title={<>{it.name} <Tag>{it.tag}</Tag></>}
                          description={<Text type="secondary" ellipsis>{it.text}</Text>}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              )}
            </Flex>
          </Col>

          <Col xs={24} lg={8}>
            <Flex vertical gap={16}>
              <Card title={<CardTitle>Thao tác nhanh</CardTitle>} size="small">
                <Row gutter={[8, 8]}>
                  {actions.map((a) => (
                    <Col key={a.id} span={12}>
                      <Button block icon={<a.icon size={14} />} onClick={() => router.push(a.href)}>{a.title}</Button>
                    </Col>
                  ))}
                </Row>
              </Card>

              {can('rule:read') && (
                <Card title={<CardTitle>Quy chế mới</CardTitle>} extra={<Link href="/app/rules">Xem tất cả</Link>} size="small">
                  <List
                    size="small"
                    locale={{ emptyText: 'Chưa có quy chế' }}
                    dataSource={rules?.items ?? []}
                    renderItem={(doc) => (
                      <List.Item key={doc.id}>
                        <Link href="/app/rules" style={{ minWidth: 0 }}>
                          <Text ellipsis style={{ maxWidth: '100%' }}>{doc.title}</Text>
                        </Link>
                        {doc.isRead === false && <Tag color="processing">Mới</Tag>}
                      </List.Item>
                    )}
                  />
                </Card>
              )}

              {can('live_map:read') && (
                <Card title={<CardTitle>Nhân sự thực địa</CardTitle>} extra={<Link href="/app/live-map">Bản đồ</Link>} size="small">
                  <List
                    size="small"
                    locale={{ emptyText: 'Chưa có ai đang chấm công' }}
                    dataSource={Array.isArray(live) ? live.slice(0, 6) : []}
                    renderItem={(s) => (
                      <List.Item key={s.userId}>
                        <List.Item.Meta
                          avatar={<Avatar size="small" src={s.avatar ? getFileUrl(s.avatar) : undefined}>{(s.userName || 'N').charAt(0)}</Avatar>}
                          title={s.userName || 'Nhân sự'}
                          description={s.departmentName}
                        />
                        <Text type="secondary">{fmtTime(s.updatedAt)}</Text>
                      </List.Item>
                    )}
                  />
                </Card>
              )}

              {can('audit_log:read') && (
                <Card title={<CardTitle>Lịch sử hệ thống</CardTitle>} size="small">
                  {auditItems.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
                    <Timeline
                      items={(auditItems as { id: number; timestamp: string; actor: { userName?: string; user_name?: string }; action: string; resource: string; status: string }[]).map((l) => ({
                        key: l.id,
                        color: l.status === 'success' ? 'green' : 'red',
                        content: (
                          <>
                            <Text strong>{l.actor?.userName ?? l.actor?.user_name ?? 'Hệ thống'}</Text>{' '}
                            <Text>{l.action} {l.resource}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>{new Date(l.timestamp).toLocaleString('vi-VN')}</Text>
                          </>
                        ),
                      }))}
                    />
                  )}
                </Card>
              )}
            </Flex>
          </Col>
        </Row>
      </Flex>
    </ConfigProvider>
  );
}
