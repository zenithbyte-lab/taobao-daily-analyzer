const BASE_URL = 'http://localhost:5001/api';

export async function request(url: string, options?: RequestInit) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  const data = await res.json();
  if (data.code !== 200) throw new Error(data.message);
  return data.data;
}
