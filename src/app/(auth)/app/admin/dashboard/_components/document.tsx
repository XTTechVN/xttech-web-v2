import React from 'react';

// import heading dùng chung cho toàn bộ trang
import { Heading } from '@/components';
import { FileText, Eye, Download } from 'lucide-react';

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  updatedAt: string;
  fileType: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX';
}

// Dữ liệu mockup cho tài liệu
const mockDocuments: DocumentItem[] = [
  {
    id: '1',
    title: 'Quy trình làm việc phòng Tech 2026',
    description: 'Hướng dẫn quy trình Scrum/Agile mới áp dụng cho dự án nội bộ.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=120&auto=format&fit=crop&q=60',
    updatedAt: '28/07/2026',
    fileType: 'PDF',
  },
  {
    id: '2',
    title: 'Báo cáo doanh thu Q2/2026',
    description: 'Báo cáo chi tiết tài chính doanh nghiệp quý 2 năm 2026.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&auto=format&fit=crop&q=60',
    updatedAt: '25/07/2026',
    fileType: 'XLSX',
  },
  {
    id: '3',
    title: 'Sách hướng dẫn Onboarding',
    description: 'Tài liệu đào tạo và làm quen cho nhân sự mới tại XTTECH.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=120&auto=format&fit=crop&q=60',
    updatedAt: '20/07/2026',
    fileType: 'PDF',
  },
  {
    id: '4',
    title: 'Slide giới thiệu doanh nghiệp',
    description: 'Slide thuyết trình giới thiệu năng lực doanh nghiệp và dự án tiêu biểu.',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=120&auto=format&fit=crop&q=60',
    updatedAt: '15/07/2026',
    fileType: 'PPTX',
  },
  {
    id: '5',
    title: 'Slide giới thiệu doanh nghiệp',
    description: 'Slide thuyết trình giới thiệu năng lực doanh nghiệp và dự án tiêu biểu.',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=120&auto=format&fit=crop&q=60',
    updatedAt: '15/07/2026',
    fileType: 'PPTX',
  },
];

const Document = () => {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'DOCX':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'XLSX':
        return 'bg-green-50 text-green-600 border-green-100';
      default:
        return 'bg-orange-50 text-orange-600 border-orange-100';
    }
  };

  return (
    <div className="bg-white rounded-xl md:rounded-xl shadow-xs p-3 md:p-4 flex flex-col gap-4 border border-gray-100 h-full">
      <Heading size="h2" className="text-primary text-lg">
        Tài liệu và Cơ chế mới
      </Heading>

      <div className="flex flex-col max-h-40 overflow-y-auto pr-1 scrollbar-hide">
        {mockDocuments.map((doc) => (
          <div key={doc.id} className="flex gap-2 p-2 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
            <img src={doc.imageUrl} alt={doc.title} className="w-14 h-14 rounded-md object-cover shrink-0 border border-gray-100" />
            <div className="flex-1 min-w-0 flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-1 py-0.5 rounded border ${getBadgeColor(doc.fileType)}`}>{doc.fileType}</span>
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{doc.title}</h3>
                </div>
                <p className="text-gray-500 text-[10px] line-clamp-1">{doc.description}</p>
                <span className="text-[10px] text-gray-400">Cập nhật: {doc.updatedAt}</span>
              </div>
              <div className="flex gap-1.5 text-gray-500 shrink-0 mt-1">
                <button className="hover:text-primary p-0.5 transition" title="Xem chi tiết">
                  <Eye size={14} />
                </button>
                <button className="hover:text-primary p-0.5 transition" title="Tải xuống">
                  <Download size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Document;
