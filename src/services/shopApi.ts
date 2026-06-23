import { request } from './apiClient';

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

export async function checkoutCart(
  items: Array<{ itemId: string; quantity: number }>
) {
  return request<{ coins: number; purchaseId: string; totalCoins: number }>(
    `/shop/checkout`,
    {
      method: 'POST',
      body: JSON.stringify({ items }),
    }
  );
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
