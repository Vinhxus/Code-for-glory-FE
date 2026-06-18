const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeader(),
  };
  if (options?.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message ?? `API request failed (${response.status})`);
  }
  return payload as T;
}

export type ShopItem = {
  _id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  type: 'cosmetic' | 'booster' | 'utility';
  priceCoins: number;
  imageUrl?: string;
  tags: string[];
};

export type ShopInventoryRow = {
  id: string;
  quantity: number;
  lastUsedAt: string | null;
  item: ShopItem | null;
};

export type ShopPurchase = {
  id: string;
  totalCoins: number;
  createdAt: string | null;
  items: Array<{
    itemId: string;
    sku: string;
    name: string;
    unitPriceCoins: number;
    quantity: number;
  }>;
};

export type ShopMe = {
  coins: number;
  canClaimDailyReward: boolean;
  lastDailyClaimAt: string | null;
  inventory: ShopInventoryRow[];
  purchases: ShopPurchase[];
};

export async function getShopItems(params?: {
  search?: string;
  category?: string;
  sort?: 'priceAsc' | 'priceDesc' | 'newest';
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.sort) query.set('sort', params.sort);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<ShopItem[]>(`/shop/items${suffix}`);
}

export async function getShopCategories() {
  return request<string[]>(`/shop/categories`);
}

export async function getShopMe() {
  return request<ShopMe>(`/shop/me`);
}

export async function checkoutCart(items: Array<{ itemId: string; quantity: number }>) {
  return request<{ coins: number; purchaseId: string; totalCoins: number }>(`/shop/checkout`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function claimDailyReward() {
  return request<{ coins: number; rewardCoins: number }>(`/shop/daily-reward`, {
    method: 'POST',
  });
}

export async function redeemCoupon(code: string) {
  return request<{ coins: number; bonus: number }>(`/shop/redeem`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function useInventoryItem(inventoryId: string) {
  return request<{ ok: boolean; remaining: number }>(`/shop/inventory/use`, {
    method: 'POST',
    body: JSON.stringify({ inventoryId }),
  });
}
