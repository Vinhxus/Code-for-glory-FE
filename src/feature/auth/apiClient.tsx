import { refreshApi } from './authService';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function clientFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  // 1. Lấy access_token hiện tại từ localStorage
  const accessToken = localStorage.getItem('access_token');

  // Chuẩn bị headers, giữ lại các headers cấu hình riêng nếu có
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Nếu có token thì tự động đính kèm vào Header
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // 2. Thực hiện request lần đầu tiên
  let response = await fetch(url, { ...options, headers });

  // 3. Nếu Backend trả về 401 Unauthorized (Token hết hạn)
  if (response.status === 401) {
    try {
      // Gọi hàm refreshApi bạn vừa thêm ở authService để lấy cặp token mới
      const newTokens = await refreshApi();

      // Ghi đè Access Token mới vào Header của request hiện tại
      headers['Authorization'] = `Bearer ${newTokens.accessToken}`;

      // Thực hiện lại chính request này lần thứ 2 với token mới xịn hơn
      response = await fetch(url, { ...options, headers });
    } catch (error) {
      // Nếu ngay cả refresh token cũng hết hạn/lỗi -> Bắt buộc logout, đá về trang login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      window.location.href = '/login';
      return Promise.reject(error);
    }
  }

  return response;
}
