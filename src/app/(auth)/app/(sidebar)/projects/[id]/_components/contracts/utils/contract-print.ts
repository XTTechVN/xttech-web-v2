import { printHtmlDocument } from '@/utils';
import { CONTRACT_DOCUMENT_CSS, CONTRACT_PRINT_CSS } from './contract-document-style';

// In nội dung hợp đồng qua iframe ẩn dùng chung
export const printContractHtml = (documentHtml: string, title: string): Promise<void> =>
  printHtmlDocument(documentHtml, title, `${CONTRACT_DOCUMENT_CSS}${CONTRACT_PRINT_CSS}`);
