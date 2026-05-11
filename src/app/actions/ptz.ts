'use server';

export async function controlPtz(rtspUrl: string, action: string) {
  try {
    if (!rtspUrl) {
      return { success: false, error: 'Không tìm thấy RTSP URL để kết nối' };
    }

    // @ts-ignore
    const onvif = require('node-onvif');

    // Parse the RTSP URL to extract credentials and host
    const parsedUrl = new URL(rtspUrl);
    const user = parsedUrl.username;
    const pass = parsedUrl.password;
    const host = parsedUrl.hostname;

    if (!host) {
      return { success: false, error: 'Không thể trích xuất host từ RTSP URL' };
    }

    // Khởi tạo thông tin cấu hình từ url
    const cameraConfig = {
      xaddr: `http://${host}:80/onvif/device_service`,
      user: user || 'admin',
      pass: pass || '',
    };

    const device = new onvif.OnvifDevice({
      xaddr: cameraConfig.xaddr,
      user: cameraConfig.user,
      pass: cameraConfig.pass,
    });

    console.log(`[PTZ] Đang kết nối tới ${host}...`);
    await device.init();
    console.log(`[PTZ] Kết nối thành công!`);

    // Map action to PTZ speed vector
    let speed = { x: 0, y: 0, z: 0 };
    switch (action) {
      case 'up':
        speed = { x: 0, y: 0.5, z: 0 };
        break;
      case 'down':
        speed = { x: 0, y: -0.5, z: 0 };
        break;
      case 'left':
        speed = { x: -0.5, y: 0, z: 0 };
        break;
      case 'right':
        speed = { x: 0.5, y: 0, z: 0 };
        break;
      case 'zoom_in':
        speed = { x: 0, y: 0, z: 0.5 };
        break;
      case 'zoom_out':
        speed = { x: 0, y: 0, z: -0.5 };
        break;
      default:
        return { success: false, error: 'Lệnh không hợp lệ' };
    }

    console.log(`[PTZ] Gửi lệnh xoay:`, speed);
    await device.ptzMove(speed);

    // Đợi 500ms (1 nửa giây) để camera xoay một khoảng vừa đủ, sau đó tự động dừng
    // Giữ nó ở 500ms thay vì 2000ms để camera không bị quay quá lố (nếu người dùng spam click)
    await new Promise((resolve) => setTimeout(resolve, 500));
    await device.ptzStop();
    console.log(`[PTZ] Đã dừng chuyển động.`);

    return { success: true };
  } catch (error: any) {
    console.error('Lỗi khi điều khiển camera:', error);
    return { success: false, error: error.message || 'Lỗi không xác định khi gọi ONVIF' };
  }
}
