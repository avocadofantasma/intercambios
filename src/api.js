async function request(path, { token, ...options } = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(body.error || `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return body;
}

export const getMe = (token) => request(`/api/me/${encodeURIComponent(token)}`);
export const reveal = (token) =>
  request(`/api/me/${encodeURIComponent(token)}/reveal`, { method: 'POST' });

export const saveWishes = (token, wishes) =>
  request(`/api/me/${encodeURIComponent(token)}/wishes`, {
    method: 'PUT',
    body: JSON.stringify({ wishes }),
  });

export const adminList = (key) => request('/api/admin', { token: key });
export const adminDraw = (key, names) =>
  request('/api/admin/draw', { token: key, method: 'POST', body: JSON.stringify({ names }) });
