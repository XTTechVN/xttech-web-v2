'use client';

import React, { useState } from 'react';
import { Alert, Button } from '@/components';
import { toast } from 'react-hot-toast';

export function InteractiveAlerts() {
  const [showAlert1, setShowAlert1] = useState(true);
  const [showAlert2, setShowAlert2] = useState(true);

  return (
    <div className="space-y-4">
      {/* Success Alert */}
      <Alert variant="success" title="Cập nhật thành công">
        Dữ liệu hồ sơ cá nhân của bạn đã được cập nhật thành công trên máy chủ của hệ thống.
      </Alert>

      {/* Info Alert */}
      <Alert variant="info" title="Thông tin bản cập nhật">
        Hệ thống vừa cập nhật phiên bản v2.4.0 với nhiều tính năng bảo mật mới. Vui lòng xem tài liệu chi tiết.
      </Alert>

      {/* Warning Alert with Close button */}
      {showAlert1 && (
        <Alert
          variant="warning"
          title="Cảnh báo dung lượng ổ đĩa"
          onClose={() => {
            setShowAlert1(false);
            toast.success('Đã đóng thông báo dung lượng');
          }}
        >
          Dung lượng bộ nhớ lưu trữ đám mây của bạn đã sử dụng vượt quá 85%. Vui lòng nâng cấp gói dịch vụ.
        </Alert>
      )}

      {/* Danger Alert with Close button */}
      {showAlert2 && (
        <Alert
          variant="danger"
          title="Kết nối thất bại"
          onClose={() => {
            setShowAlert2(false);
            toast.success('Đã đóng thông báo lỗi kết nối');
          }}
        >
          Không thể kết nối đến máy chủ API Gateway. Vui lòng kiểm tra lại cấu hình đường truyền mạng của bạn.
        </Alert>
      )}

      {/* Button to restore closed alerts */}
      {(!showAlert1 || !showAlert2) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowAlert1(true);
            setShowAlert2(true);
            toast.success('Đã khôi phục các thông báo đã đóng');
          }}
        >
          Khôi phục thông báo
        </Button>
      )}
    </div>
  );
}
