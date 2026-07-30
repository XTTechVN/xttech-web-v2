/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/utils/api';
import { Suggestion, SuggestionCreate, SuggestionQueryParams, SuggestionReviewSchema, SuggestionUpdate } from '@/types';

// Dữ liệu Mock ban đầu đầy đủ cấu trúc Premium
const INITIAL_MOCK_SUGGESTIONS: Suggestion[] = [
  {
    id: 1,
    title: 'Nâng cấp máy tính làm việc cho lập trình viên',
    content:
      'Trang thiết bị ||| Máy tính của các lập trình viên cấu hình quá thấp (chỉ có 8GB RAM), thường xuyên bị giật lag và đơ máy khi chạy môi trường ảo hóa Docker và gõ lệnh. ||| Đề xuất nâng cấp tối thiểu lên 16GB RAM hoặc cung cấp thêm màn hình phụ 24 inch để tăng hiệu suất làm việc.',
    anonymous: false,
    status: 'pending',
    priority: 'high',
    category: 'technology',
    createdAt: '2026-07-28T09:00:00.000Z',
    user: {
      id: 'user_1',
      email: 'minhnv@xttech.vn',
      username: 'minhnv',
      fullName: 'Nguyễn Văn Minh',
      phoneNumber: '0987654321',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      gender: 'male',
      birthday: '1998-01-01T00:00:00.000Z',
      address: 'Hà Nội',
      joinedAt: '2023-01-01T00:00:00.000Z',
      identifyCode: 'XT123',
      attendancePolicy: 'administrative',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      department: 'Kỹ thuật',
      role: 'Lập trình viên',
    } as any,
    review: null,
    updatedAt: '2026-07-28T09:00:00.000Z',
    userId: '',
    reviewById: null,
    attachments: [],
    reviewBy: null,
  },
  {
    id: 2,
    title: 'Tăng chi phí hỗ trợ tiền ăn trưa',
    content:
      'Chế độ đãi ngộ ||| Chi phí ăn trưa hiện tại (30.000đ/ngày) quá thấp so với vật giá đắt đỏ tại khu vực văn phòng trung tâm hiện nay. ||| Đề xuất điều chỉnh nâng mức hỗ trợ ăn trưa lên 50.000đ/ngày áp dụng từ quý sau.',
    anonymous: true,
    status: 'approve',
    priority: 'medium',
    category: 'other',
    createdAt: '2026-07-27T03:30:00.000Z',
    user: {
      id: 'anonymous_user',
      email: 'anonymous@xttech.vn',
      username: 'anonymous',
      fullName: 'Thành viên ẩn danh',
      phoneNumber: '',
      avatar: null,
      gender: 'other',
      birthday: '',
      address: '',
      joinedAt: '',
      identifyCode: '',
      attendancePolicy: '',
      createdAt: '',
      updatedAt: '',
      department: 'Hành chính Nhân sự',
      role: 'Nhân viên',
    } as any,
    review: 'Đã duyệt. Công ty đồng ý điều chỉnh mức phụ cấp ăn trưa lên 45.000đ/ngày bắt đầu từ ngày 01 của tháng kế tiếp.',
    updatedAt: '2026-07-28T02:00:00.000Z',
    userId: '',
    reviewById: null,
    attachments: [],
    reviewBy: null,
  },
  {
    id: 3,
    title: 'Tổ chức workshop đào tạo kỹ năng mềm hàng tháng',
    content:
      'Đào tạo & Phát triển ||| Nhân sự phòng Kinh doanh mới tuyển dụng còn thiếu nhiều kỹ năng xử lý từ chối và thương thuyết khách hàng lớn. ||| Tổ chức các buổi chia sẻ kinh nghiệm nội bộ (workshop) vào chiều thứ Bảy tuần thứ 3 mỗi tháng.',
    anonymous: false,
    status: 'pending',
    priority: 'low',
    category: 'process',
    createdAt: '2026-07-26T08:15:00.000Z',
    user: {
      id: 'user_2',
      email: 'huongtt@xttech.vn',
      username: 'huongtt',
      fullName: 'Trần Thị Hương',
      phoneNumber: '0912345678',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      gender: 'female',
      birthday: '1995-05-15T00:00:00.000Z',
      address: 'Hải Phòng',
      joinedAt: '2022-06-01T00:00:00.000Z',
      identifyCode: 'XT456',
      attendancePolicy: 'administrative',
      createdAt: '2022-06-01T00:00:00.000Z',
      updatedAt: '2022-06-01T00:00:00.000Z',
      department: 'Kinh doanh',
      role: 'Trưởng nhóm kinh doanh',
    } as any,
    review: null,
    updatedAt: '2026-07-26T08:15:00.000Z',
    userId: '',
    reviewById: null,
    attachments: [],
    reviewBy: null,
  },
  {
    id: 4,
    title: 'Quy trình phê duyệt ngân sách mua sắm quá rườm rà',
    content:
      'Quy trình làm việc ||| Việc xin phê duyệt kinh phí mua văn phòng phẩm nhỏ lẻ tốn quá nhiều thời gian (7-10 ngày) do phải ký qua quá nhiều cấp quản lý. ||| Đề xuất phân quyền phê duyệt cho trưởng bộ phận đối với các khoản phát sinh dưới 1.000.000đ.',
    anonymous: false,
    status: 'reject',
    priority: 'high',
    category: 'process',
    createdAt: '2026-07-25T10:00:00.000Z',
    user: {
      id: 'user_3',
      email: 'namlh@xttech.vn',
      username: 'namlh',
      fullName: 'Lê Hoàng Nam',
      phoneNumber: '0909090909',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
      gender: 'male',
      birthday: '1993-10-20T00:00:00.000Z',
      address: 'Đà Nẵng',
      joinedAt: '2021-03-15T00:00:00.000Z',
      identifyCode: 'XT789',
      attendancePolicy: 'administrative',
      createdAt: '2021-03-15T00:00:00.000Z',
      updatedAt: '2021-03-15T00:00:00.000Z',
      department: 'Hành chính',
      role: 'Nhân viên hành chính',
    } as any,
    review:
      'Không phê duyệt vì lý do kiểm soát ngân sách tập trung của tập đoàn. Ban giám đốc sẽ yêu cầu rút ngắn quy trình ký số nội bộ xuống tối đa 2 ngày làm việc.',
    updatedAt: '2026-07-26T04:00:00.000Z',
    userId: '',
    reviewById: null,
    attachments: [],
    reviewBy: null,
  },
  {
    id: 5,
    title: 'Setup tủ cafe pantry tự phục vụ ở ban công',
    content:
      'Văn hóa doanh nghiệp ||| Công sở thiếu không gian thư giãn ngắn khiến nhân sự mệt mỏi, giảm khả năng sáng tạo trong các giờ làm việc cao điểm. ||| Đặt tủ pantry nhỏ trang bị trà, cafe gói và 2 ghế lười hạt đậu tại góc ban công thoáng mát.',
    anonymous: true,
    status: 'pending',
    priority: 'medium',
    category: 'environment',
    createdAt: '2026-07-28T02:45:00.000Z',
    user: {
      id: 'anonymous_user',
      email: 'anonymous@xttech.vn',
      username: 'anonymous',
      fullName: 'Thành viên ẩn danh',
      phoneNumber: '',
      avatar: null,
      gender: 'other',
      birthday: '',
      address: '',
      joinedAt: '',
      identifyCode: '',
      attendancePolicy: '',
      createdAt: '',
      updatedAt: '',
      department: 'Thiết kế',
      role: 'Nhân viên',
    } as any,
    review: null,
    updatedAt: '2026-07-28T02:45:00.000Z',
    userId: '',
    reviewById: null,
    attachments: [],
    reviewBy: null,
  },
  {
    id: 6,
    title: 'Trang bị bản quyền công cụ AI trợ lý lập trình',
    content:
      'Nâng cấp công nghệ ||| Lập trình viên phải tự viết các đoạn code boilerplate lặp đi lặp lại và thiếu hỗ trợ gợi ý code thông minh từ AI khiến tốc độ hoàn thành dự án chậm. ||| Cấp tài khoản bản quyền Copilot/Gemini cho đội ngũ Dev để tối ưu hóa thời gian phát triển và tăng 30% hiệu suất.',
    anonymous: false,
    status: 'approve',
    priority: 'high',
    category: 'technology',
    createdAt: '2026-07-29T10:00:00.000Z',
    user: {
      id: 'user_1',
      email: 'minhnv@xttech.vn',
      username: 'minhnv',
      fullName: 'Nguyễn Văn Minh',
      phoneNumber: '0987654321',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      gender: 'male',
      birthday: '1998-01-01T00:00:00.000Z',
      address: 'Hà Nội',
      joinedAt: '2023-01-01T00:00:00.000Z',
      identifyCode: 'XT123',
      attendancePolicy: 'administrative',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      department: 'Kỹ thuật',
      role: 'Lập trình viên',
    } as any,
    review: 'Phê duyệt. Bộ phận IT sẽ tiến hành mua và cấp phát tài khoản Copilot cho toàn bộ lập trình viên từ tuần tới.',
    updatedAt: '2026-07-29T15:00:00.000Z',
    userId: '',
    reviewById: null,
    attachments: [],
    reviewBy: null,
  },
  {
    id: 7,
    title: 'Chuẩn hóa quy trình onboarding cho lập trình viên mới',
    content:
      'Cải tiến quy trình ||| Nhân sự mới vào mất 1-2 tuần đầu tiên bối rối vì không có tài liệu hướng dẫn setup môi trường dự án thống nhất, mất thời gian của Mentor hỏi đi hỏi lại. ||| Xây dựng tài liệu GitBook hướng dẫn Onboarding chuẩn và checklist setup tự động qua Docker Compose cho toàn bộ dự án.',
    anonymous: false,
    status: 'pending',
    priority: 'medium',
    category: 'process',
    createdAt: '2026-07-29T08:15:00.000Z',
    user: {
      id: 'user_2',
      email: 'huongtt@xttech.vn',
      username: 'huongtt',
      fullName: 'Trần Thị Hương',
      phoneNumber: '0912345678',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      gender: 'female',
      birthday: '1995-05-15T00:00:00.000Z',
      address: 'Hải Phòng',
      joinedAt: '2022-06-01T00:00:00.000Z',
      identifyCode: 'XT456',
      attendancePolicy: 'administrative',
      createdAt: '2022-06-01T00:00:00.000Z',
      updatedAt: '2022-06-01T00:00:00.000Z',
      department: 'Kinh doanh',
      role: 'Trưởng nhóm kinh doanh',
    } as any,
    review: null,
    updatedAt: '2026-07-29T08:15:00.000Z',
    userId: '',
    reviewById: null,
    attachments: [],
    reviewBy: null,
  },
  {
    id: 8,
    title: 'Lắp đặt thêm máy lọc không khí và bổ sung cây xanh',
    content:
      'Môi trường làm việc ||| Văn phòng khép kín đông người vào mùa hè thường bị ngột ngạt, lượng CO2 cao gây buồn ngủ và giảm sự tập trung của nhân viên. ||| Trang bị 2 máy lọc không khí Hepa công suất lớn tại phòng làm việc chung và mua thêm một số chậu cây xanh lọc khí.',
    anonymous: true,
    status: 'approve',
    priority: 'low',
    category: 'environment',
    createdAt: '2026-07-29T02:45:00.000Z',
    user: {
      id: 'anonymous_user',
      email: 'anonymous@xttech.vn',
      username: 'anonymous',
      fullName: 'Thành viên ẩn danh',
      phoneNumber: '',
      avatar: null,
      gender: 'other',
      birthday: '',
      address: '',
      joinedAt: '',
      identifyCode: '',
      attendancePolicy: '',
      createdAt: '',
      updatedAt: '',
      department: 'Hành chính Nhân sự',
      role: 'Nhân viên',
    } as any,
    review: 'Đã mua và lắp đặt 2 máy lọc không khí mới tại khu vực làm việc chung.',
    updatedAt: '2026-07-29T04:00:00.000Z',
    userId: '',
    reviewById: null,
    attachments: [],
    reviewBy: null,
  },
  {
    id: 9,
    title: 'Tổ chức giải chạy bộ online kết nối nội bộ',
    content:
      'Ý kiến đóng góp khác ||| Nhân viên ngồi máy tính nhiều ít vận động, tinh thần uể oải và thiếu hoạt động gắn kết tập thể giữa các phòng ban xa nhau. ||| Tổ chức giải chạy trực tuyến "XTTech Run" thông qua ứng dụng Strava có trao giải hàng tuần để khuyến khích tinh thần rèn luyện sức khỏe.',
    anonymous: false,
    status: 'reject',
    priority: 'low',
    category: 'other',
    createdAt: '2026-07-28T10:00:00.000Z',
    user: {
      id: 'user_3',
      email: 'namlh@xttech.vn',
      username: 'namlh',
      fullName: 'Lê Hoàng Nam',
      phoneNumber: '0909090909',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
      gender: 'male',
      birthday: '1993-10-20T00:00:00.000Z',
      address: 'Đà Nẵng',
      joinedAt: '2021-03-15T00:00:00.000Z',
      identifyCode: 'XT789',
      attendancePolicy: 'administrative',
      createdAt: '2021-03-15T00:00:00.000Z',
      updatedAt: '2021-03-15T00:00:00.000Z',
      department: 'Hành chính',
      role: 'Nhân viên hành chính',
    } as any,
    review: 'Không phê duyệt ở quy mô công ty tại thời điểm này. Khuyến khích các phòng ban tự tổ chức nội bộ.',
    updatedAt: '2026-07-28T16:00:00.000Z',
    userId: '',
    reviewById: null,
    attachments: [],
    reviewBy: null,
  },
  {
    id: 10,
    title: 'Nâng cấp đường truyền Internet cáp quang dự phòng',
    content:
      'Nâng cấp công nghệ ||| Đường truyền mạng chính thỉnh thoảng bị quá tải hoặc rớt kết nối đột ngột làm gián đoạn các cuộc gọi họp trực tuyến quan trọng với đối tác nước ngoài. ||| Lắp đặt thêm một line cáp quang dự phòng của nhà mạng khác và cấu hình thiết bị router gộp băng thông/chuyển mạch tự động (Failover).',
    anonymous: false,
    status: 'pending',
    priority: 'high',
    category: 'technology',
    createdAt: '2026-07-28T09:00:00.000Z',
    user: {
      id: 'user_1',
      email: 'minhnv@xttech.vn',
      username: 'minhnv',
      fullName: 'Nguyễn Văn Minh',
      phoneNumber: '0987654321',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      gender: 'male',
      birthday: '1998-01-01T00:00:00.000Z',
      address: 'Hà Nội',
      joinedAt: '2023-01-01T00:00:00.000Z',
      identifyCode: 'XT123',
      attendancePolicy: 'administrative',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      department: 'Kỹ thuật',
      role: 'Lập trình viên',
    } as any,
    review: null,
    updatedAt: '2026-07-28T09:00:00.000Z',
    userId: '',
    reviewById: null,
    attachments: [],
    reviewBy: null,
  },
];

// Hàm bổ trợ thao tác với localStorage để lưu lại các cập nhật mẫu
const getMockSuggestions = (): Suggestion[] => {
  if (typeof window === 'undefined') return INITIAL_MOCK_SUGGESTIONS;
  const stored = localStorage.getItem('mock_suggestions_v3');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_SUGGESTIONS;
    }
  }
  localStorage.setItem('mock_suggestions_v3', JSON.stringify(INITIAL_MOCK_SUGGESTIONS));
  return INITIAL_MOCK_SUGGESTIONS;
};

const saveMockSuggestions = (items: Suggestion[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_suggestions_v3', JSON.stringify(items));
  }
};

export const getSuggestions = async (params?: SuggestionQueryParams) => {
  try {
    const response = await api.get('/api/v1/suggestions', { params });
    const { items, pagination } = response.data;
    return {
      items: items || [],
      meta: {
        total: pagination?.total ?? 0,
        offset: pagination?.offset ?? 0,
        limit: pagination?.limit ?? 10,
        next: pagination?.next ?? false,
      },
    };
  } catch (error: any) {
    console.warn('API error, using localStorage mock data:', error.message || error);

    // Giả lập filter logic cho Mock Data
    let filtered = getMockSuggestions();

    if (params?.status) {
      filtered = filtered.filter((item) => item.status === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (item) => item.title?.toLowerCase().includes(q) || item.content?.toLowerCase().includes(q) || item.user?.fullName?.toLowerCase().includes(q),
      );
    }

    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;
    const slicedItems = filtered.slice(offset, offset + limit);

    return {
      items: slicedItems,
      meta: {
        total: filtered.length,
        offset,
        limit,
        next: offset + limit < filtered.length,
      },
    };
  }
};

export const getSuggestion = async (id: number): Promise<Suggestion> => {
  try {
    const response = await api.get(`/api/v1/suggestions/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn('API error, fetching single suggestion from mock data:', error.message || error);
    const item = getMockSuggestions().find((s) => s.id === id);
    if (!item) throw new Error('Suggestion not found');
    return item;
  }
};

export const createSuggestion = async (data: SuggestionCreate, files?: File[]): Promise<Suggestion> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    const response = await api.post('/api/v1/suggestions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.warn('API error, creating suggestion in mock data:', error.message || error);
    const mockList = getMockSuggestions();
    const newId = mockList.length > 0 ? Math.max(...mockList.map((s) => s.id)) + 1 : 1;

    const newSuggestion: Suggestion = {
      id: newId,
      title: data.title,
      content: data.content,
      anonymous: data.anonymous,
      status: 'pending',
      priority: data.priority || 'medium',
      category: data.category || 'other',
      createdAt: new Date().toISOString(),
      user: data.anonymous
        ? ({
            id: 'anonymous_user',
            email: 'anonymous@xttech.vn',
            username: 'anonymous',
            fullName: 'Thành viên ẩn danh',
            phoneNumber: '',
            avatar: null,
            gender: 'other',
            birthday: '',
            address: '',
            joinedAt: '',
            identifyCode: '',
            attendancePolicy: '',
            createdAt: '',
            updatedAt: '',
            department: 'Hành chính Nhân sự',
            role: 'Nhân viên',
          } as any)
        : ({
            id: 'logged_user',
            email: 'admin@xttech.vn',
            username: 'admin',
            fullName: 'Nguyễn Văn Admin',
            phoneNumber: '0987654321',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
            gender: 'male',
            birthday: '1990-01-01T00:00:00.000Z',
            address: 'Hà Nội',
            joinedAt: '2020-01-01T00:00:00.000Z',
            identifyCode: 'XT001',
            attendancePolicy: 'administrative',
            createdAt: '2020-01-01T00:00:00.000Z',
            updatedAt: '2020-01-01T00:00:00.000Z',
            department: 'Kỹ thuật',
            role: 'Quản trị viên',
          } as any),
      review: null,
      updatedAt: new Date().toISOString(),
      userId: '',
      reviewById: null,
      attachments:
        files && files.length > 0
          ? files.map((file, idx) => ({
              id: idx + 1,
              suggestionId: newId,
              path: URL.createObjectURL(file),
              createdAt: new Date().toISOString(),
            }))
          : [],
      reviewBy: null,
    };

    mockList.unshift(newSuggestion); // Đưa lên đầu danh sách
    saveMockSuggestions(mockList);
    return newSuggestion;
  }
};

export const reviewSuggestion = async (id: number, data: SuggestionReviewSchema): Promise<Suggestion> => {
  try {
    const response = await api.post(`/api/v1/suggestions/${id}/review`, data);
    return response.data;
  } catch (error: any) {
    console.warn('API error, reviewing suggestion in mock data:', error.message || error);
    const mockList = getMockSuggestions();
    const index = mockList.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Suggestion not found');

    const isPending = data.status === 'pending';
    mockList[index] = {
      ...mockList[index],
      status: data.status,
      review: isPending ? null : data.review,
      reviewById: isPending ? null : 'logged_user',
      reviewBy: isPending
        ? null
        : ({
            id: 'logged_user',
            email: 'admin@xttech.vn',
            username: 'admin',
            fullName: 'Nguyễn Văn Admin',
            phoneNumber: '0987654321',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
            gender: 'male',
            birthday: '1990-01-01T00:00:00.000Z',
            address: 'Hà Nội',
            joinedAt: '2020-01-01T00:00:00.000Z',
            identifyCode: 'XT001',
            attendancePolicy: 'administrative',
            createdAt: '2020-01-01T00:00:00.000Z',
            updatedAt: '2020-01-01T00:00:00.000Z',
            department: 'Kỹ thuật',
            role: 'Quản trị viên',
          } as any),
      updatedAt: new Date().toISOString(),
    };

    saveMockSuggestions(mockList);
    return mockList[index];
  }
};

export const updateSuggestion = async (id: number, data: SuggestionUpdate, files?: File[]): Promise<Suggestion> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    const response = await api.put(`/api/v1/suggestions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.warn('API error, updating suggestion in mock data:', error.message || error);
    const mockList = getMockSuggestions();
    const index = mockList.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Suggestion not found');

    mockList[index] = {
      ...mockList[index],
      title: data.title !== undefined ? data.title : mockList[index].title,
      content: data.content !== undefined ? data.content : mockList[index].content,
      anonymous: data.anonymous !== undefined ? data.anonymous : mockList[index].anonymous,
      priority: data.priority !== undefined ? data.priority : mockList[index].priority,
      category: data.category !== undefined ? data.category : mockList[index].category,
      attachments:
        files !== undefined
          ? files.map((file, idx) => ({
              id: idx + 1,
              suggestionId: id,
              path: URL.createObjectURL(file),
              createdAt: new Date().toISOString(),
            }))
          : mockList[index].attachments,
      updatedAt: new Date().toISOString(),
    };

    saveMockSuggestions(mockList);
    return mockList[index];
  }
};

export const deleteSuggestion = async (id: number): Promise<Suggestion> => {
  try {
    const response = await api.delete(`/api/v1/suggestions/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn('API error, deleting suggestion in mock data:', error.message || error);
    const mockList = getMockSuggestions();
    const index = mockList.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Suggestion not found');

    const deleted = mockList[index];
    const updatedList = mockList.filter((s) => s.id !== id);
    saveMockSuggestions(updatedList);
    return deleted;
  }
};
