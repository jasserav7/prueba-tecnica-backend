// Centralized API client – adds JWT token automatically to every request

const AUTH_URL    = import.meta.env.VITE_AUTH_URL    || 'http://localhost:8000';
const CATALOG_URL = import.meta.env.VITE_CATALOG_URL || 'http://localhost:8001';
const CART_URL    = import.meta.env.VITE_CART_URL    || 'http://localhost:8002';
const ORDERS_URL  = import.meta.env.VITE_ORDERS_URL  || 'http://localhost:8003';

function getToken() {
  return localStorage.getItem('pt_token');
}

async function request(baseUrl, path, options = {}) {
  const token = getToken();
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error de servidor' }));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth Service ──────────────────────────────────────────────
export const authApi = {
  login: (username, password) =>
    request(AUTH_URL, '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => request(AUTH_URL, '/auth/me'),
};

// ── Catalog Service – Categorías ──────────────────────────────
export const categoriesApi = {
  list:   ()         => request(CATALOG_URL, '/categories'),
  create: (data)     => request(CATALOG_URL, '/categories',     { method: 'POST',   body: JSON.stringify(data) }),
  update: (id, data) => request(CATALOG_URL, `/categories/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),
  delete: (id)       => request(CATALOG_URL, `/categories/${id}`, { method: 'DELETE' }),
};

// ── Catalog Service – Productos ───────────────────────────────
export const productsApi = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return request(CATALOG_URL, `/products${qs ? `?${qs}` : ''}`);
  },
  create: (data)     => request(CATALOG_URL, '/products',     { method: 'POST',   body: JSON.stringify(data) }),
  update: (id, data) => request(CATALOG_URL, `/products/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),
  delete: (id)       => request(CATALOG_URL, `/products/${id}`, { method: 'DELETE' }),
};

// ── Cart Service ──────────────────────────────────────────────
export const cartApi = {
  get:       ()              => request(CART_URL, '/cart'),
  addItem:   (product_id, quantity) =>
    request(CART_URL, '/cart/items', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
  updateQty: (product_id, quantity) =>
    request(CART_URL, `/cart/items/${product_id}`, { method: 'PUT', body: JSON.stringify({ product_id, quantity }) }),
  removeItem:(product_id)   => request(CART_URL, `/cart/items/${product_id}`, { method: 'DELETE' }),
  clear:     ()              => request(CART_URL, '/cart', { method: 'DELETE' }),
};

// ── Orders Service ────────────────────────────────────────────
export const ordersApi = {
  create: (payload) => request(ORDERS_URL, '/orders', { method: 'POST', body: JSON.stringify(payload) }),
  list:   ()        => request(ORDERS_URL, '/orders'),
  get:    (id)      => request(ORDERS_URL, `/orders/${id}`),
};
