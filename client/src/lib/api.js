const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request('/auth/logout'),
    me: () => request('/auth/me'),
    upgradeToHost: () => request('/auth/upgrade', { method: 'POST' }),
  },
  listings: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v != null) qs.set(k, v);
      });
      return request(`/listings?${qs.toString()}`);
    },
    getById: (id) => request(`/listings/${id}`),
    create: (formData) =>
      fetch(`${BASE_URL}/listings`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw Object.assign(new Error(data.error), { status: res.status, data });
        return data;
      }),
    update: (id, formData) =>
      fetch(`${BASE_URL}/listings/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw Object.assign(new Error(data.error), { status: res.status, data });
        return data;
      }),
    delete: (id) => request(`/listings/${id}`, { method: 'DELETE' }),
  },
  reviews: {
    create: (listingId, body) =>
      request(`/listings/${listingId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    delete: (listingId, reviewId) =>
      request(`/listings/${listingId}/reviews/${reviewId}`, { method: 'DELETE' }),
    summary: (listingId) => request(`/listings/${listingId}/reviews-summary`),
  },
  tripPlanner: {
    estimate: (body) =>
      request('/trip-planner/estimate', { method: 'POST', body: JSON.stringify(body) }),
    itinerary: (body) =>
      request('/trip-planner/itinerary', { method: 'POST', body: JSON.stringify(body) }),
  },
  insights: {
    get: (listingId) => request(`/listings/${listingId}/insights`),
  },
  seasonal: {
    get: (location) => request(`/seasonal?location=${encodeURIComponent(location)}`),
  },
  wishlist: {
    getAll: () => request('/wishlist'),
    add: (listingId) =>
      request('/wishlist', { method: 'POST', body: JSON.stringify({ listingId }) }),
    remove: (listingId) => request(`/wishlist/${listingId}`, { method: 'DELETE' }),
    check: (listingId) => request(`/wishlist/check/${listingId}`),
  },
};
