'use client';

import React, { useState } from 'react';
import { Smartphone, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StatsCard } from '@/components';
import { useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import { getAppVersions, getLatestAppVersion } from '@/actions';

import { ReleaseModal } from './_components/release-modal';
import { AppVersionTable } from './_components/table';

export default function AppVersionsPage() {
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);

  // Lấy dữ liệu thống kê tổng số bản phát hành
  const { data: listData } = useQuery({
    queryKey: ['app-versions', 'total'],
    queryFn: () => getAppVersions({ limit: 1000 }),
  });

  // Lấy dữ liệu phiên bản mới nhất
  const { data: latestAndroid } = useQuery({
    queryKey: ['app-versions', 'latest', 'android'],
    queryFn: () => getLatestAppVersion('android'),
  });

  const allItems = listData?.items || [];
  const totalReleases = listData?.meta?.total || allItems.length || 0;
  const forceUpdateCount = allItems.filter((item) => item.forceUpdate).length;

  const versionStats = [
    {
      title: 'Bản Android mới nhất',
      value: latestAndroid ? `v${latestAndroid.versionName}` : '--',
      icon: <Smartphone />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Tổng số bản phát hành',
      value: totalReleases,
      icon: <Layers />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Yêu cầu bắt buộc',
      value: forceUpdateCount,
      icon: <AlertTriangle />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Nền tảng hỗ trợ',
      value: 'Android',
      icon: <CheckCircle2 />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  const handleReleaseSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['app-versions'] });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Khối thống kê 4 thẻ chuẩn hệ thống */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {versionStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>

      {/* Bảng danh sách phiên bản */}
      <AppVersionTable
        latestVersionCode={latestAndroid?.versionCode}
        onAddClick={() => setIsReleaseOpen(true)}
      />

      {/* Modal phát hành */}
      <ReleaseModal
        isOpen={isReleaseOpen}
        onClose={() => setIsReleaseOpen(false)}
        onSuccess={handleReleaseSuccess}
      />
    </div>
  );
}
