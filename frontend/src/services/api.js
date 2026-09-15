// Arka uç REST API istemcisi.
// Token localStorage'da tutulur; her isteğe Authorization başlığı eklenir.

const TOKEN_KEY = 'event_token';
const API_BASE = '/api';

export const authStore = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('event_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  localStorage.setItem('event_user', JSON.stringify(user));
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = authStore.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    let message = data && data.error ? data.error : `İstek başarısız (${res.status})`;
    if (data && Array.isArray(data.details) && data.details.length > 0) {
      message += ' — ' + data.details.join(', ');
    }
    if (res.status === 401) {
      authStore.clear();
      setCurrentUser(null);
    }
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),

  // Events
  listEvents: (page = 0, size = 12) => request(`/events?page=${page}&size=${size}`),
  searchEvents: (params, page = 0, size = 12) => {
    const qs = new URLSearchParams({ page, size });
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    return request(`/events/search?${qs.toString()}`);
  },
  getEvent: (id) => request(`/events/${id}`),
  eventsByOrganizer: (id) => request(`/events/organizer/${id}`),
  createEvent: (body) => request('/events', { method: 'POST', body }),
  updateEvent: (id, body) => request(`/events/${id}`, { method: 'PUT', body }),
  setEventStatus: (id, status) => request(`/events/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  // Registrations
  registerToEvent: (eventId) => request('/registrations', { method: 'POST', body: { eventId } }),
  myRegistrations: () => request('/registrations/me'),
  eventRegistrations: (eventId) => request(`/registrations/event/${eventId}`),
  cancelRegistration: (eventId) => request(`/registrations/${eventId}`, { method: 'DELETE' }),

  // Users
  listUsers: () => request('/users'),
  me: () => request('/users/me')
};