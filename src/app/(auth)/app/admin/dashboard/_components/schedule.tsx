// Heading dùng chung cho toàn bộ trang
import { Heading } from '@/components';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  location: string;
  type: 'training' | 'meeting' | 'event';
  status: 'upcoming' | 'ongoing' | 'finished';
}

// Dữ liệu mockup cho lịch đào tạo
const mockEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Đào tạo nghiệp vụ thiết kế cửa',
    time: '08:30 - 11:30',
    date: '30/07',
    location: 'Phòng họp Lớn - Tầng 3',
    type: 'training',
    status: 'ongoing',
  },
  {
    id: '2',
    title: 'Họp giao ban tuần ban Giám đốc',
    time: '14:00 - 15:30',
    date: '31/07',
    location: 'Phòng Boardroom - Tầng 5',
    type: 'meeting',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Workshop chuyển đổi số doanh nghiệp',
    time: '09:00 - 11:30',
    date: '02/08',
    location: 'Hội trường lớn Tòa nhà',
    type: 'event',
    status: 'finished',
  },
  {
    id: '4',
    title: 'Đào tạo bảo mật thông tin nội bộ',
    time: '15:00 - 17:00',
    date: '04/08',
    location: 'Phòng Đào tạo - Tầng 2',
    type: 'training',
    status: 'upcoming',
  },
  {
    id: '5',
    title: 'Họp tổng kết dự án & vinh danh tháng',
    time: '16:00 - 17:30',
    date: '06/08',
    location: 'Phòng họp Lớn - Tầng 3',
    type: 'meeting',
    status: 'finished',
  },
];

const Schedule = () => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'upcoming':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-red-50 text-red-600 border-red-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'Đang diễn ra';
      case 'upcoming':
        return 'Sắp diễn ra';
      default:
        return 'Đã kết thúc';
    }
  };

  return (
    <div className="bg-white rounded-xl md:rounded-xl shadow-xs p-3 md:p-4 flex flex-col gap-4 border border-gray-100 h-full">
      <Heading size="h2" className="text-primary text-lg">
        Lịch đào tạo và Sự kiện
      </Heading>
      
      <div className="flex flex-col gap-3 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
        {mockEvents.map((event) => (
          <div key={event.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getStatusStyles(event.status)}`}>
                      {getStatusLabel(event.status)}
                    </span>
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{event.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-400 shrink-0" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
