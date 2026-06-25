import axios from 'axios';
import { cookies } from 'next/headers';

/**
 * Helper hỗ trợ prefetch dữ liệu từ API ở phía Server (Server Component) trong Next.js.
 * Tự động phân tích searchParams từ URL và parse các giá trị số (offset, limit) một cách an toàn.
 * 
 * @param url Đường dẫn API cần fetch (vd: '/api/v1/spaces/flat')
 * @param searchParamsPromise Promise chứa các tham số query từ URL (truyền từ props của Page Component)
 */
export async function prefetchData<T>(
  url: string,
  searchParamsPromise: Promise<any>
): Promise<T | undefined> {
  try {
    const searchParams = await searchParamsPromise;

    // Tự động phân tích và chuẩn hóa các tham số lọc, phân trang
    const params: Record<string, any> = {};
    for (const [key, val] of Object.entries(searchParams)) {
      if (key === 'offset') {
        params.offset = val ? parseInt(val as string, 10) : 0;
      } else if (key === 'limit') {
        params.limit = val ? parseInt(val as string, 10) : 10;
      } else {
        params[key] = val;
      }
    }

    // Lấy cookie hiện tại từ request đầu vào của Next.js Server
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    const headers: Record<string, string> = {};
    if (cookieString) {
      headers['Cookie'] = cookieString;
    }

    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://api_vision.bosky.vn'}${url}`,
      {
        params,
        headers,
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error(`Failed to prefetch data for ${url}:`, error);
    return undefined;
  }
}
