import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';
import {
  checkoutCart,
  claimDailyReward,
  getShopCategories,
  getShopItems,
  getShopMe,
  redeemCoupon,
  useInventoryItem,
  type ShopItem,
  type ShopMe,
} from '../services/shopApi';

// Áp dụng / xóa neon theme
function applyNeonTheme(active: boolean) {
  if (active) {
    document.documentElement.classList.add('theme-neon');
    localStorage.setItem('shopTheme', 'neon');
  } else {
    document.documentElement.classList.remove('theme-neon');
    localStorage.removeItem('shopTheme');
  }
}

// Tính thời gian còn lại của XP boost
function xpBoostCountdown(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const mins = Math.ceil(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.ceil(mins / 60)}h ${mins % 60}m`;
}

type TabKey = 'store' | 'inventory' | 'history';

type CartLine = {
  item: ShopItem;
  quantity: number;
};

function formatDate(value: string | null, language: string) {
  if (!value) return language === 'vi' ? 'N/A' : 'N/A';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US');
}

export default function Shop() {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const text = useMemo(
    () =>
      isVi
        ? {
          title: 'Shop',
          subtitle: 'Nơi đổi coin lấy boost / cosmetic / công cụ hỗ trợ học tập.',
          back: 'Quay lại',
          tabStore: 'Cửa hàng',
          tabInventory: 'Kho đồ',
          tabHistory: 'Lịch sử mua',
          balance: 'Số dư coin',
          daily: 'Nhận thưởng ngày',
          dailyHint: 'Thưởng 120 coin mỗi 24h.',
          redeem: 'Nhập mã',
          redeemPlaceholder: 'VD: WELCOME100',
          apply: 'Áp dụng',
          search: 'Tìm item...',
          category: 'Danh mục',
          sort: 'Sắp xếp',
          newest: 'Mới nhất',
          priceAsc: 'Giá tăng dần',
          priceDesc: 'Giá giảm dần',
          addToCart: 'Thêm vào giỏ',
          inCart: 'Trong giỏ',
          cart: 'Giỏ hàng',
          checkout: 'Thanh toán',
          total: 'Tổng',
          empty: 'Chưa có dữ liệu.',
          notEnough: 'Không đủ coin.',
          use: 'Dùng',
          qty: 'SL',
        }
        : {
          title: 'Shop',
          subtitle: 'Spend coins on boosters, cosmetics, and learning utilities.',
          back: 'Back',
          tabStore: 'Store',
          tabInventory: 'Inventory',
          tabHistory: 'Purchase history',
          balance: 'Coin balance',
          daily: 'Claim daily reward',
          dailyHint: '120 coins every 24h.',
          redeem: 'Redeem code',
          redeemPlaceholder: 'e.g. WELCOME100',
          apply: 'Apply',
          search: 'Search items...',
          category: 'Category',
          sort: 'Sort',
          newest: 'Newest',
          priceAsc: 'Price ↑',
          priceDesc: 'Price ↓',
          addToCart: 'Add to cart',
          inCart: 'In cart',
          cart: 'Cart',
          checkout: 'Checkout',
          total: 'Total',
          empty: 'No data yet.',
          notEnough: 'Not enough coins.',
          use: 'Use',
          qty: 'Qty',
        },
    [isVi]
  );

  const [tab, setTab] = useState<TabKey>('store');
  const [me, setMe] = useState<ShopMe | null>(null);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [xpCountdown, setXpCountdown] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [sort, setSort] = useState<'newest' | 'priceAsc' | 'priceDesc'>('newest');

  const [cart, setCart] = useState<CartLine[]>([]);
  const cartTotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.item.priceCoins * line.quantity, 0),
    [cart]
  );

  const [coupon, setCoupon] = useState('');
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 2500);
  };

  const refreshMe = async () => {
    const next = await getShopMe();
    setMe(next);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cates, meRes] = await Promise.all([getShopCategories(), getShopMe()]);
      setCategories(cates);
      setMe(meRes);
      const itemsRes = await getShopItems({ search, category: category || undefined, sort });
      setItems(itemsRes);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // Restore neon theme nếu đã bật trước đó
    if (localStorage.getItem('shopTheme') === 'neon') {
      document.documentElement.classList.add('theme-neon');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cập nhật countdown XP boost mỗi 30 giây
  useEffect(() => {
    const update = () => setXpCountdown(xpBoostCountdown(me?.xpBoostExpiresAt ?? null));
    update();
    const t = window.setInterval(update, 30000);
    return () => window.clearInterval(t);
  }, [me?.xpBoostExpiresAt]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void getShopItems({ search, category: category || undefined, sort })
        .then(setItems)
        .catch((e) => setError((e as Error).message));
    }, 250);
    return () => window.clearTimeout(t);
  }, [search, category, sort]);

  const addToCart = (item: ShopItem) => {
    setCart((prev) => {
      const found = prev.find((x) => x.item._id === item._id);
      if (found) {
        return prev.map((x) =>
          x.item._id === item._id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCartQty = (itemId: string, nextQty: number) => {
    setCart((prev) =>
      prev
        .map((x) => (x.item._id === itemId ? { ...x, quantity: nextQty } : x))
        .filter((x) => x.quantity > 0)
    );
  };

  const handleCheckout = async () => {
    if (!cart.length) return;
    try {
      const payload = cart.map((line) => ({ itemId: line.item._id, quantity: line.quantity }));
      const res = await checkoutCart(payload);
      showToast('ok', isVi ? `Thanh toán thành công (-${res.totalCoins} coin)` : `Checkout success (-${res.totalCoins} coins)`);
      setCart([]);
      await refreshMe();
      setTab('inventory');
    } catch (e) {
      showToast('err', (e as Error).message);
    }
  };

  const handleClaimDaily = async () => {
    try {
      const res = await claimDailyReward();
      showToast('ok', isVi ? `+${res.rewardCoins} coin` : `+${res.rewardCoins} coins`);
      await refreshMe();
    } catch (e) {
      showToast('err', (e as Error).message);
    }
  };

  const handleRedeem = async () => {
    if (!coupon.trim()) return;
    try {
      const res = await redeemCoupon(coupon);
      showToast('ok', isVi ? `Đã cộng +${res.bonus} coin` : `Added +${res.bonus} coins`);
      setCoupon('');
      await refreshMe();
    } catch (e) {
      showToast('err', (e as Error).message);
    }
  };

  const handleUseInventory = async (inventoryId: string) => {
    try {
      const res = await useInventoryItem(inventoryId);

      // Áp dụng effect phía FE theo SKU
      if (res.sku === 'SKIN_NEON') {
        applyNeonTheme(true);
      }

      // Hiển thị toast với message effect chi tiết
      const effectMsg = isVi ? res.effectVi : res.effectEn;
      const remainMsg = isVi ? ` (Còn lại: ${res.remaining})` : ` (Remaining: ${res.remaining})`;
      showToast('ok', effectMsg + remainMsg);

      await refreshMe();
    } catch (e) {
      showToast('err', (e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 22% 10%, rgba(255,126,95,0.18), transparent 55%), radial-gradient(circle at 78% 22%, rgba(167,139,250,0.16), transparent 58%), radial-gradient(circle at 30% 88%, rgba(74,222,128,0.14), transparent 58%)',
          }}
        />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Back */}
          <div className="mb-6 flex justify-end">
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-5 py-2.5 text-sm font-bold transition hover:bg-[color:var(--cg-container-a22)] hover:border-[#ff7e5f]/40 group animate-fade-in-up"
            >
              <span className="material-symbols-outlined text-[18px] text-[#ff7e5f] transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              {text.back}
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between animate-fade-in-up">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-1 text-xs font-semibold text-[color:var(--cg-text-muted)]">
                <span className="material-symbols-outlined text-[16px] text-[#ff7e5f]">
                  storefront
                </span>
                {text.title}
              </div>
              <h1 className="mt-3 font-['Lexend'] text-4xl font-bold tracking-tight">
                <span className="gradient-text">{text.title}</span>
              </h1>
              <p className="mt-2 text-sm text-[color:var(--cg-text-muted)]">{text.subtitle}</p>
            </div>

            {/* Wallet / tools */}
            <div className="mt-4 flex flex-col gap-3 md:mt-0 md:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3">
                  <div className="text-[11px] font-semibold text-[color:var(--cg-text-muted)]">
                    {text.balance}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#fbbf24]">
                      star
                    </span>
                    <span className="text-xl font-bold">{me?.coins ?? '—'}</span>
                  </div>
                </div>

                <button
                  disabled={!me?.canClaimDailyReward}
                  onClick={handleClaimDaily}
                  className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3 text-sm font-semibold transition hover:bg-[color:var(--cg-container-a22)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#4ade80]">
                    redeem
                  </span>
                  <span>{text.daily}</span>
                  <span className="text-[11px] text-[color:var(--cg-text-muted)]">
                    {text.dailyHint}
                  </span>
                </button>
              </div>

              <div className="flex w-full max-w-md items-center gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder={text.redeemPlaceholder}
                  className="w-full rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3 text-sm outline-none focus:border-[#ff7e5f]/60"
                />
                <button
                  onClick={handleRedeem}
                  className="rounded-xl bg-[#ff7e5f] px-4 py-3 text-sm font-bold text-black transition hover:brightness-110"
                >
                  {text.apply}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex flex-wrap items-center gap-2 animate-fade-in-up delay-200">
            {[
              { key: 'store' as const, label: text.tabStore, icon: 'shopping_bag' },
              { key: 'inventory' as const, label: text.tabInventory, icon: 'inventory_2' },
              { key: 'history' as const, label: text.tabHistory, icon: 'receipt_long' },
            ].map((tItem) => (
              <button
                key={tItem.key}
                onClick={() => setTab(tItem.key)}
                className={[
                  'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition',
                  tab === tItem.key
                    ? 'border-[#ff7e5f]/60 bg-[#ff7e5f]/10 text-[#ff7e5f]'
                    : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a22)]',
                ].join(' ')}
              >
                <span className="material-symbols-outlined text-[18px]">{tItem.icon}</span>
                {tItem.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] animate-fade-in-up delay-300">
            <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a10)] p-5">
              {loading ? (
                <div className="text-sm text-[color:var(--cg-text-muted)]">
                  {isVi ? 'Đang tải…' : 'Loading…'}
                </div>
              ) : error ? (
                <div className="text-sm text-red-300">
                  {error}
                  <button
                    onClick={() => void load()}
                    className="ml-3 rounded-lg border border-[color:var(--cg-border)] px-3 py-1 text-xs font-semibold text-[color:var(--cg-text)] hover:bg-[color:var(--cg-container-a16)]"
                  >
                    {isVi ? 'Thử lại' : 'Retry'}
                  </button>
                </div>
              ) : tab === 'store' ? (
                <>
                  {/* Filters */}
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={text.search}
                        className="w-full rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3 text-sm outline-none focus:border-[#ff7e5f]/60"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-3 text-sm outline-none"
                      >
                        <option value="">{text.category}: {isVi ? 'Tất cả' : 'All'}</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>

                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as typeof sort)}
                        className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-3 text-sm outline-none"
                      >
                        <option value="newest">
                          {text.sort}: {text.newest}
                        </option>
                        <option value="priceAsc">
                          {text.sort}: {text.priceAsc}
                        </option>
                        <option value="priceDesc">
                          {text.sort}: {text.priceDesc}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Items grid */}
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((it) => {
                      const inCart = cart.find((x) => x.item._id === it._id)?.quantity ?? 0;
                      return (
                        <div
                          key={it._id}
                          className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4 hover:bg-[color:var(--cg-container-a22)] transition animate-fade-in-up"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[color:var(--cg-text-muted)]">
                                {it.category} • {it.type.toUpperCase()}
                              </div>
                              <div className="mt-1 truncate text-base font-bold">{it.name}</div>
                            </div>
                            <div className="flex items-center gap-1 rounded-full border border-[color:var(--cg-border)] bg-black/20 px-2 py-1 text-xs font-bold">
                              <span className="material-symbols-outlined text-[16px] text-[#fbbf24]">
                                star
                              </span>
                              {it.priceCoins}
                            </div>
                          </div>

                          <p className="mt-2 line-clamp-3 text-sm text-[color:var(--cg-text-muted)]">
                            {it.description}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {it.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-[color:var(--cg-border)] bg-black/20 px-2 py-1 text-[11px] font-semibold text-[color:var(--cg-text-muted)]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-2">
                            <button
                              onClick={() => addToCart(it)}
                              className="rounded-xl bg-[#ff7e5f] px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
                            >
                              {text.addToCart}
                            </button>
                            {inCart > 0 && (
                              <div className="text-xs font-semibold text-[color:var(--cg-text-muted)]">
                                {text.inCart}: {inCart}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : tab === 'inventory' ? (
                <div className="space-y-3">
                  {/* Active effects banner */}
                  {(xpCountdown || me?.badges?.includes('gold-name-tag') || (me?.bonusSubmitAttempts ?? 0) > 0) && (
                    <div className="rounded-2xl border border-[#fbbf24]/30 bg-[#fbbf24]/10 p-4 space-y-2">
                      <div className="text-xs font-bold text-[#fbbf24] mb-2">
                        {isVi ? '⚡ Hiệu ứng đang active' : '⚡ Active Effects'}
                      </div>
                      {xpCountdown && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">🚀</span>
                          <span className="font-semibold">{isVi ? 'XP Boost x2' : 'XP Boost x2'}</span>
                          <span className="ml-auto rounded-full bg-[#fbbf24]/20 px-2 py-0.5 text-xs font-bold text-[#fbbf24]">
                            {isVi ? `còn ${xpCountdown}` : `${xpCountdown} left`}
                          </span>
                        </div>
                      )}
                      {(me?.bonusSubmitAttempts ?? 0) > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">✅</span>
                          <span className="font-semibold">{isVi ? 'Lượt submit bonus' : 'Bonus Submissions'}</span>
                          <span className="ml-auto rounded-full bg-[#4ade80]/20 px-2 py-0.5 text-xs font-bold text-[#4ade80]">
                            +{me?.bonusSubmitAttempts}
                          </span>
                        </div>
                      )}
                      {me?.badges?.includes('gold-name-tag') && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">🏅</span>
                          <span className="font-semibold">{isVi ? 'Gold Name Tag đang active' : 'Gold Name Tag Active'}</span>
                          <span className="ml-auto rounded-full bg-[#fbbf24]/20 px-2 py-0.5 text-xs font-bold text-[#fbbf24]">
                            {isVi ? 'Vĩnh viễn' : 'Permanent'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inventory items */}
                  {me?.inventory?.length ? (
                    me.inventory.map((row) => {
                      const sku = row.item?.sku ?? '';
                      const isXpActive = sku === 'BOOST_XP_1H' && !!xpCountdown;
                      const isNeonActive = sku === 'SKIN_NEON' && localStorage.getItem('shopTheme') === 'neon';
                      const isGoldActive = sku === 'NAME_TAG_GOLD' && me?.badges?.includes('gold-name-tag');
                      const isActive = isXpActive || isNeonActive || isGoldActive;

                      return (
                        <div
                          key={row.id}
                          className={[
                            'flex items-center justify-between gap-4 rounded-2xl border p-4 transition',
                            isActive
                              ? 'border-[#fbbf24]/40 bg-[#fbbf24]/5'
                              : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)]',
                          ].join(' ')}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="text-xs font-semibold text-[color:var(--cg-text-muted)]">
                                {row.item?.category ?? '—'}
                              </div>
                              {isActive && (
                                <span className="rounded-full bg-[#4ade80]/20 px-2 py-0.5 text-[10px] font-bold text-[#4ade80]">
                                  {isVi ? 'ĐANG ACTIVE' : 'ACTIVE'}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 truncate text-base font-bold">
                              {row.item?.name ?? '—'}
                            </div>
                            <div className="mt-1 text-xs text-[color:var(--cg-text-muted)]">
                              {isVi ? 'Dùng gần nhất:' : 'Last used:'} {formatDate(row.lastUsedAt, language)}
                            </div>
                            {/* Effect hint */}
                            {sku === 'BOOST_XP_1H' && (
                              <div className="mt-1 text-[11px] text-[#fbbf24]">
                                {isVi ? '🚀 Kích hoạt XP x2 trong 1 giờ (có thể cộng dồn)' : '🚀 Activates 2x XP for 1 hour (stackable)'}
                              </div>
                            )}
                            {sku === 'SKIN_NEON' && (
                              <div className="mt-1 text-[11px] text-[#a78bfa]">
                                {isVi ? '✨ Bật/tắt Neon Theme cho giao diện' : '✨ Toggle Neon Theme for the UI'}
                              </div>
                            )}
                            {sku === 'EXTRA_SUBMISSIONS_5' && (
                              <div className="mt-1 text-[11px] text-[#4ade80]">
                                {isVi ? '✅ Thêm 5 lượt submit bài tập' : '✅ Adds 5 extra exercise submission attempts'}
                              </div>
                            )}
                            {sku === 'NAME_TAG_GOLD' && (
                              <div className="mt-1 text-[11px] text-[#fbbf24]">
                                {isVi ? '🏅 Gắn viền vàng vào tên trong forum/battle' : '🏅 Adds a gold border to your name in forum/battle'}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="rounded-xl border border-[color:var(--cg-border)] bg-black/20 px-3 py-2 text-sm font-bold">
                              {text.qty}: {row.quantity}
                            </div>
                            {/* Neon toggle riêng */}
                            {sku === 'SKIN_NEON' && row.quantity > 0 ? (
                              <button
                                onClick={() => {
                                  const isOn = localStorage.getItem('shopTheme') === 'neon';
                                  if (isOn) {
                                    applyNeonTheme(false);
                                    // không consume khi tắt
                                    showToast('ok', isVi ? '✨ Neon Theme đã tắt' : '✨ Neon Theme turned off');
                                    refreshMe(); // re-render
                                  } else {
                                    handleUseInventory(row.id);
                                  }
                                }}
                                className={[
                                  'rounded-xl border px-4 py-2 text-sm font-bold transition',
                                  isNeonActive
                                    ? 'border-[#a78bfa]/60 bg-[#a78bfa]/10 text-[#a78bfa] hover:bg-[#a78bfa]/20'
                                    : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] hover:bg-[color:var(--cg-container-a22)]',
                                ].join(' ')}
                              >
                                {isNeonActive
                                  ? (isVi ? 'Tắt' : 'Disable')
                                  : (isVi ? 'Bật' : 'Enable')}
                              </button>
                            ) : (
                              <button
                                disabled={row.quantity <= 0}
                                onClick={() => handleUseInventory(row.id)}
                                className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2 text-sm font-bold transition hover:bg-[color:var(--cg-container-a22)] disabled:opacity-50"
                              >
                                {text.use}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-[color:var(--cg-text-muted)]">{text.empty}</div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {me?.purchases?.length ? (
                    me.purchases.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-bold">
                            {isVi ? 'Đơn' : 'Order'} #{p.id.slice(-6)}
                          </div>
                          <div className="text-xs text-[color:var(--cg-text-muted)]">
                            {formatDate(p.createdAt, language)}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[color:var(--cg-text-muted)]">
                          <span className="material-symbols-outlined text-[16px] text-[#fbbf24]">
                            star
                          </span>
                          {text.total}: {p.totalCoins}
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {p.items.map((line) => (
                            <div
                              key={line.sku + line.itemId}
                              className="rounded-xl border border-[color:var(--cg-border)] bg-black/20 px-3 py-2"
                            >
                              <div className="text-sm font-bold">{line.name}</div>
                              <div className="mt-1 text-xs text-[color:var(--cg-text-muted)]">
                                {line.unitPriceCoins} × {line.quantity}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-[color:var(--cg-text-muted)]">{text.empty}</div>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a10)] p-5 h-fit sticky top-6">
              <div className="flex items-center justify-between">
                <div className="text-base font-bold">{text.cart}</div>
                <button
                  onClick={() => setCart([])}
                  className="text-xs font-semibold text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]"
                >
                  {isVi ? 'Xoá' : 'Clear'}
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {cart.length ? (
                  cart.map((line) => (
                    <div
                      key={line.item._id}
                      className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold">{line.item.name}</div>
                          <div className="mt-1 text-xs text-[color:var(--cg-text-muted)]">
                            {line.item.priceCoins} coin
                          </div>
                        </div>
                        <button
                          onClick={() => updateCartQty(line.item._id, 0)}
                          className="text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]"
                          aria-label="Remove"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => updateCartQty(line.item._id, Math.max(0, line.quantity - 1))}
                          className="rounded-lg border border-[color:var(--cg-border)] bg-black/20 px-2 py-1 text-sm font-bold"
                        >
                          −
                        </button>
                        <div className="min-w-[40px] text-center text-sm font-bold">
                          {line.quantity}
                        </div>
                        <button
                          onClick={() => updateCartQty(line.item._id, line.quantity + 1)}
                          className="rounded-lg border border-[color:var(--cg-border)] bg-black/20 px-2 py-1 text-sm font-bold"
                        >
                          +
                        </button>
                        <div className="ml-auto text-xs font-semibold text-[color:var(--cg-text-muted)]">
                          {text.total}: {line.item.priceCoins * line.quantity}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-[color:var(--cg-text-muted)]">
                    {isVi ? 'Giỏ đang trống.' : 'Cart is empty.'}
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-xl border border-[color:var(--cg-border)] bg-black/20 p-4">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{text.total}</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px] text-[#fbbf24]">
                      star
                    </span>
                    {cartTotal}
                  </span>
                </div>
                <div className="mt-2 text-xs text-[color:var(--cg-text-muted)]">
                  {me && cartTotal > me.coins ? text.notEnough : ' '}
                </div>
                <button
                  disabled={!cart.length || (me ? cartTotal > me.coins : false)}
                  onClick={handleCheckout}
                  className="mt-4 w-full rounded-xl bg-[#ff7e5f] px-4 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {text.checkout}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[100]">
            <div
              className={[
                'rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl',
                toast.type === 'ok'
                  ? 'border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80]'
                  : 'border-red-400/40 bg-red-400/10 text-red-200',
              ].join(' ')}
            >
              {toast.msg}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}