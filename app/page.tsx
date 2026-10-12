"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Bell, UserRound, ShieldCheck, Store, CircleHelp, Plus,
  Heart, Eye, MessageCircle, Flag, ChevronLeft, ChevronRight,
  SlidersHorizontal, MoreHorizontal, LayoutDashboard, X, ArrowUpRight,
  Package, ChartNoAxesCombined, Users, Megaphone, CheckCircle2, Trash2,
  Pencil, RotateCcw, Ban, Settings2, Send, Sparkles, ScrollText,
  ImagePlus, Save, ShieldAlert, UserCog, BarChart3, Megaphone as MegaphoneIcon,
} from "lucide-react";
import {
  Ad, ALL_ROLES, Banner, LogEntry, Report, ReportStatus, Review, Role, Shop, Store as StoreT, User,
  CURRENT_USER_ID, useStore, putPhoto, delPhoto, usePhotoUrl, uid, nowISO, fmtDT,
  money, ratingOf, canModerate, canAdmin, canOwner, findUser,
} from "@/lib/store";

/* ============================================================
   КОНСТАНТЫ КАТАЛОГА
============================================================ */
const CATEGORIES = ["Все", "Vape", "Техника", "Одежда", "Услуги"];
const SUBCATEGORIES: Record<string, string[]> = {
  Vape: ["Подики", "Услуги", "Расходники"],
  Техника: ["Б/у", "Новое"],
  Одежда: ["Б/у", "Новое"],
  Услуги: ["Предоставление услуги", "Поиск услуги"],
};
const TONES = ["lavender", "blue", "peach", "mint", "pink", "sand"];
const EMOJIS = ["📦", "🎧", "🧥", "🛠️", "⌨️", "📸", "☁️", "🎮", "📱"];

/* ============================================================
   ФОТО-КОМПОНЕНТ
============================================================ */
function Photo({
  photoId, fallbackEmoji, className, alt,
}: { photoId: string | null; fallbackEmoji: string; className?: string; alt?: string }) {
  const url = usePhotoUrl(photoId);
  if (!url) {
    return (
      <div className={className} aria-label={alt}>
        <span style={{ fontSize: "inherit" }}>{fallbackEmoji}</span>
      </div>
    );
  }
  return <img src={url} alt={alt || ""} className={className} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
}

/* ============================================================
   ГЛАВНЫЙ КОМПОНЕНТ
============================================================ */
export default function Home() {
  const { store, update, log } = useStore();

  // Навигация
  const [tab, setTab] = useState("Главная");
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [adminPage, setAdminPage] = useState("Обзор");
  const [sellerProfile, setSellerProfile] = useState<string | null>(null);

  // Поиск / фильтры
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [sub, setSub] = useState("Все");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<"new" | "cheap" | "expensive" | "views">("new");
  const [showFilters, setShowFilters] = useState(false);

  // Модалки
  const [showCreate, setShowCreate] = useState(false);
  const [editAdId, setEditAdId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [reportTarget, setReportTarget] = useState<Ad | null>(null);

  // Баннер
  const [bannerIdx, setBannerIdx] = useState(0);

  if (!store) {
    return (
      <main className="app-shell">
        <div style={{ padding: 60, textAlign: "center", color: "#929bb8" }}>
          Загрузка Marketplace…
        </div>
      </main>
    );
  }

  const me = findUser(store, "nukm0") || store.users[0];
  const isAdmin = canAdmin(me.role);
  const isOwner = canOwner(me.role);
  const isMod = canModerate(me.role);

  const activeBanners = store.banners
    .filter((b) => b.active)
    .sort((a, b) => a.order - b.order);

  // Автопрокрутка баннеров
  useEffect(() => {
    if (activeBanners.length < 2) return;
    const t = window.setInterval(() => {
      setBannerIdx((i) => (i + 1) % activeBanners.length);
    }, 5000);
    return () => window.clearInterval(t);
  }, [activeBanners.length]);

  if (bannerIdx >= activeBanners.length) setBannerIdx(0);

  /* ---------- производные данные ---------- */
  const myFavorites = store.favorites
    .filter((f) => f.userId === me.id)
    .map((f) => f.adId);

  const filteredAds = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = store.ads.filter((a) => {
      if (a.sold || !a.approved) return false;
      if (category !== "Все" && a.category !== category) return false;
      if (sub !== "Все" && a.sub !== sub) return false;
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      if (a.price < min || a.price > max) return false;
      if (q) {
        const hay = `${a.title} ${a.description} ${a.seller}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sortBy === "cheap") list = list.slice().sort((a, b) => a.price - b.price);
    else if (sortBy === "expensive") list = list.slice().sort((a, b) => b.price - a.price);
    else if (sortBy === "views") list = list.slice().sort((a, b) => b.views - a.views);
    else list = list.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }, [store.ads, search, category, sub, minPrice, maxPrice, sortBy]);

  const selectedAd = selectedAdId ? store.ads.find((a) => a.id === selectedAdId) || null : null;

  /* ---------- сервисные ---------- */
  const pushLog = (
    draft: StoreT,
    action: string,
    target: string,
    reason: string,
    result: string
  ) => log(draft, me.username, action, target, reason, result);

  const flashRef = useRef<number | null>(null);
  const [toast, setToast] = useState<string>("");
  function flash(msg: string) {
    setToast(msg);
    if (flashRef.current) window.clearTimeout(flashRef.current);
    flashRef.current = window.setTimeout(() => setToast(""), 2600);
  }

  /* ---------- действия: избранное ---------- */
  function toggleFavorite(adId: string) {
    update((d) => {
      const exists = d.favorites.find((f) => f.userId === me.id && f.adId === adId);
      const favorites = exists
        ? d.favorites.filter((f) => !(f.userId === me.id && f.adId === adId))
        : [...d.favorites, { userId: me.id, adId }];
      return pushLog(
        { ...d, favorites },
        exists ? "unfavorite" : "favorite",
        adId,
        "—",
        "OK"
      );
    });
  }

  /* ---------- действия: объявления ---------- */
  async function createAd(payload: {
    title: string; category: string; sub: string; price: number;
    description: string; files: File[]; shopId: string | null;
  }) {
    const photoIds: string[] = [];
    for (const f of payload.files.slice(0, 5)) {
      const id = uid("ph");
      await putPhoto(id, f);
      photoIds.push(id);
    }
    const ad: Ad = {
      id: uid("ad"),
      title: payload.title.trim(),
      category: payload.category,
      sub: payload.sub,
      price: payload.price,
      description: payload.description.trim() || "Описание не добавлено.",
      seller: me.username,
      photoIds,
      views: 0,
      createdAt: nowISO(),
      sold: false,
      approved: true,
      shopId: payload.shopId,
    };
    update((d) => pushLog({ ...d, ads: [ad, ...d.ads] }, "ad.create", ad.id, "—", `OK · ${ad.title}`));
    flash("Объявление опубликовано.");
    setTab("Личный кабинет");
  }

  async function updateAd(adId: string, patch: Partial<Ad>, newFiles: File[], removedPhotoIds: string[]) {
    const added: string[] = [];
    for (const f of newFiles.slice(0, 5)) {
      const id = uid("ph");
      await putPhoto(id, f);
      added.push(id);
    }
    for (const pid of removedPhotoIds) await delPhoto(pid);
    update((d) => {
      const ads = d.ads.map((a) => {
        if (a.id !== adId) return a;
        const kept = a.photoIds.filter((p) => !removedPhotoIds.includes(p));
        return { ...a, ...patch, photoIds: [...kept, ...added] };
      });
      return pushLog({ ...d, ads }, "ad.update", adId, "—", "OK");
    });
    flash("Объявление обновлено.");
  }

  async function deleteAd(adId: string) {
    const ad = store.ads.find((a) => a.id === adId);
    if (!ad) return;
    if (!window.confirm(`Удалить объявление «${ad.title}»?`)) return;
    for (const pid of ad.photoIds) await delPhoto(pid);
    update((d) => pushLog(
      { ...d, ads: d.ads.filter((a) => a.id !== adId) },
      "ad.delete", adId, "—", "OK"
    ));
    flash("Объявление удалено.");
  }

  async function toggleSold(adId: string) {
    update((d) => {
      const ads = d.ads.map((a) => (a.id === adId ? { ...a, sold: !a.sold } : a));
      const ad = ads.find((a) => a.id === adId)!;
      return pushLog({ ...d, ads }, ad.sold ? "ad.markSold" : "ad.markActive", adId, "—", "OK");
    });
  }

  /* ---------- действия: жалобы ---------- */
  function submitReport(target: Ad, reason: string, details: string) {
    const report: Report = {
      id: uid("rep"),
      adId: target.id,
      targetUser: target.seller,
      reason,
      details,
      status: "Новая",
      reporter: me.username,
      createdAt: nowISO(),
      decision: "",
      decisionBy: "",
    };
    update((d) => pushLog(
      { ...d, reports: [report, ...d.reports] },
      "report.create", target.id, reason, "Новая"
    ));
    setReportTarget(null);
    flash("Жалоба отправлена модерации.");
  }

  function resolveReport(id: string, next: ReportStatus, comment: string) {
    update((d) => {
      const reports = d.reports.map((r) =>
        r.id === id ? { ...r, status: next, decision: comment, decisionBy: me.username } : r
      );
      return pushLog({ ...d, reports }, "report.resolve", id, comment || "—", next);
    });
  }

  /* ---------- действия: админ ---------- */
  function setUserRole(username: string, role: Role) {
    if (!isOwner) { flash("Только владелец может менять роли."); return; }
    update((d) => {
      const users = d.users.map((u) => (u.username === username ? { ...u, role } : u));
      return pushLog({ ...d, users }, "user.role", username, "—", role);
    });
  }

  function toggleBan(username: string, reason: string) {
    if (!isAdmin) { flash("Недостаточно прав."); return; }
    update((d) => {
      const users = d.users.map((u) =>
        u.username === username
          ? { ...u, banned: !u.banned, banReason: !u.banned ? reason || "Без причины" : "" }
          : u
      );
      const u = users.find((x) => x.username === username)!;
      return pushLog({ ...d, users }, u.banned ? "user.ban" : "user.unban", username, reason, "OK");
    });
  }

  /* ---------- действия: баннеры ---------- */
  function saveBanner(b: Banner) {
    update((d) => {
      const exists = d.banners.find((x) => x.id === b.id);
      const banners = exists
        ? d.banners.map((x) => (x.id === b.id ? b : x))
        : [...d.banners, b];
      return pushLog({ ...d, banners }, exists ? "banner.update" : "banner.create", b.id, "—", b.title);
    });
    flash("Баннер сохранён.");
  }
  function deleteBanner(id: string) {
    update((d) => pushLog({ ...d, banners: d.banners.filter((b) => b.id !== id) }, "banner.delete", id, "—", "OK"));
  }
  function toggleBanner(id: string) {
    update((d) => {
      const banners = d.banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
      return pushLog({ ...d, banners }, "banner.toggle", id, "—", "OK");
    });
  }

  /* ---------- действия: магазины ---------- */
  function saveShop(s: Shop) {
    update((d) => {
      const exists = d.shops.find((x) => x.id === s.id);
      const shops = exists ? d.shops.map((x) => (x.id === s.id ? s : x)) : [...d.shops, s];
      return pushLog({ ...d, shops }, exists ? "shop.update" : "shop.create", s.id, "—", s.name);
    });
    flash("Магазин сохранён.");
  }
  function deleteShop(id: string) {
    update((d) => pushLog({ ...d, shops: d.shops.filter((s) => s.id !== id) }, "shop.delete", id, "—", "OK"));
  }

  /* ---------- действия: отзывы ---------- */
  function addReview(seller: string, stars: number, text: string) {
    const rev: Review = {
      id: uid("rev"), seller, author: me.username, stars, text, createdAt: nowISO(),
    };
    update((d) => pushLog({ ...d, reviews: [rev, ...d.reviews] }, "review.create", seller, `${stars}★`, text.slice(0, 40)));
    flash("Отзыв добавлен.");
  }

  /* ---------- сброс ---------- */
  function resetDemo() {
    if (!window.confirm("Сбросить все локальные данные и вернуть демо-состояние?")) return;
    const fresh = {
      version: 4,
      users: [], ads: [], reports: [], reviews: [], banners: [], shops: [], logs: [], favorites: [],
      currentUserId: CURRENT_USER_ID,
    } as StoreT;
    // Пересоздаём через resetStore из lib
    // (проще: очистим LS и перезагрузим)
    window.localStorage.removeItem("marketplace-store-v4");
    window.location.reload();
  }

  /* ============================================================
     РЕНДЕР
  ============================================================ */
  return (
    <main className="app-shell">
      <Sidebar
        tab={tab} setTab={(t) => { setTab(t); setSelectedAdId(null); setSellerProfile(null); }}
        favoritesCount={myFavorites.length} isAdmin={isAdmin} me={me}
        onOpenAdmin={() => { setTab("Админ-панель"); setSelectedAdId(null); }}
      />

      <section className="main-area">
        <Topbar
          tab={tab} me={me} notificationsOpen={showNotifications}
          onToggleNotifications={() => setShowNotifications((v) => !v)}
          onOpenProfile={() => { setTab("Личный кабинет"); setSelectedAdId(null); }}
          breadcrumb={selectedAd ? "Объявление" : sellerProfile ? "Профиль продавца" : tab}
        />

        {selectedAd ? (
          <AdDetail
            ad={selectedAd}
            liked={myFavorites.includes(selectedAd.id)}
            seller={findUser(store, selectedAd.seller)}
            reviews={store.reviews.filter((r) => r.seller === selectedAd.seller)}
            onBack={() => setSelectedAdId(null)}
            onToggleFav={() => toggleFavorite(selectedAd.id)}
            onReport={() => setReportTarget(selectedAd)}
            onSeller={() => { setSellerProfile(selectedAd.seller); setSelectedAdId(null); }}
            onView={() => update((d) => ({
              ...d,
              ads: d.ads.map((a) => a.id === selectedAd.id ? { ...a, views: a.views + 1 } : a),
            }))}
          />
        ) : sellerProfile ? (
          <SellerProfile
            username={sellerProfile}
            seller={findUser(store, sellerProfile)}
            ads={store.ads.filter((a) => a.seller === sellerProfile && !a.sold)}
            reviews={store.reviews.filter((r) => r.seller === sellerProfile)}
            rating={ratingOf(store, sellerProfile)}
            likedIds={myFavorites}
            onBack={() => setSellerProfile(null)}
            onOpenAd={(id) => setSelectedAdId(id)}
            onLike={(id) => toggleFavorite(id)}
            onReview={(stars, text) => addReview(sellerProfile, stars, text)}
            onShopOpen={(shopId) => { setTab("Витрина магазина"); setSelectedAdId(null); setAdminPage(shopId); }}
          />
        ) : (
          <div className="content">
            {tab === "Главная" && (
              <HomeTab
                banners={activeBanners}
                bannerIdx={bannerIdx} setBannerIdx={setBannerIdx}
                search={search} setSearch={setSearch}
                category={category} setCategory={(c) => { setCategory(c); setSub("Все"); }}
                sub={sub} setSub={setSub}
                minPrice={minPrice} setMinPrice={setMinPrice}
                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                sortBy={sortBy} setSortBy={setSortBy}
                showFilters={showFilters} setShowFilters={setShowFilters}
                ads={filteredAds}
                likedIds={myFavorites}
                onOpenAd={(id) => { setSelectedAdId(id); update((d) => ({ ...d, ads: d.ads.map((a) => a.id === id ? { ...a, views: a.views + 1 } : a) })); }}
                onLike={(id) => toggleFavorite(id)}
                onReport={(ad) => setReportTarget(ad)}
                onCreate={() => { setEditAdId(null); setShowCreate(true); }}
                flash={flash}
              />
            )}

            {tab === "Личный кабинет" && (
              <MyAccount
                me={me} store={store}
                myAds={store.ads.filter((a) => a.seller === me.username)}
                likedIds={myFavorites}
                onOpenAd={(id) => setSelectedAdId(id)}
                onLike={(id) => toggleFavorite(id)}
                onReport={(ad) => setReportTarget(ad)}
                onCreate={() => { setEditAdId(null); setShowCreate(true); }}
                onEdit={(id) => { setEditAdId(id); setShowCreate(true); }}
                onDelete={(id) => deleteAd(id)}
                onToggleSold={(id) => toggleSold(id)}
                onOpenFav={() => setTab("Избранное")}
                flash={flash}
              />
            )}

            {tab === "Избранное" && (
              <>
                <PageTitle overline="СОХРАНЁННОЕ" title="Избранное" subtitle="Объявления, к которым хочется вернуться." />
                {myFavorites.length === 0 ? (
                  <div className="empty-state">
                    <Heart size={30} />
                    <h3>Пока ничего нет</h3>
                    <p>Нажми на сердечко в понравившемся объявлении.</p>
                  </div>
                ) : (
                  <div className="ad-grid">
                    {store.ads.filter((a) => myFavorites.includes(a.id)).map((ad) => (
                      <AdCard key={ad.id} ad={ad} liked
                        onOpen={() => setSelectedAdId(ad.id)}
                        onLike={() => toggleFavorite(ad.id)}
                        onReport={() => setReportTarget(ad)}
                        shop={store.shops.find((s) => s.id === ad.shopId) || null}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "Магазины" && (
              <ShopsTab
                shops={store.shops}
                ads={store.ads}
                onOpen={(id) => { setAdminPage(id); setTab("Витрина магазина"); }}
                isOwner={isOwner}
                onSave={saveShop}
                onDelete={deleteShop}
              />
            )}

            {tab === "Витрина магазина" && (
              <ShopStorefront
                shopId={adminPage}
                store={store}
                likedIds={myFavorites}
                onBack={() => setTab("Магазины")}
                onOpenAd={(id) => setSelectedAdId(id)}
                onLike={(id) => toggleFavorite(id)}
                onReport={(ad) => setReportTarget(ad)}
              />
            )}

            {tab === "FAQ" && <FAQTab flash={flash} />}

            {tab === "Админ-панель" && isAdmin && (
              <AdminPanel
                page={adminPage} setPage={setAdminPage}
                store={store} me={me} isOwner={isOwner}
                setUserRole={setUserRole}
                toggleBan={toggleBan}
                resolveReport={resolveReport}
                saveBanner={saveBanner}
                deleteBanner={deleteBanner}
                toggleBanner={toggleBanner}
                saveShop={saveShop}
                deleteShop={deleteShop}
                resetDemo={resetDemo}
                flash={flash}
              />
            )}

            {tab === "Админ-панель" && !isAdmin && (
              <div className="empty-state">
                <ShieldAlert size={32} />
                <h3>Нет доступа</h3>
                <p>Раздел доступен администраторам и владельцу.</p>
              </div>
            )}
          </div>
        )}

        <footer className="footer">
          <span>© 2026 MARKETPLACE</span>
          <span>Локальное хранение · IndexedDB для фото</span>
          <button onClick={() => setTab("FAQ")}>Помощь</button>
        </footer>
      </section>

      <MobileNav tab={tab} setTab={(t) => { setTab(t); setSelectedAdId(null); setSellerProfile(null); }} />

      {showCreate && (
        <AdEditor
          ad={editAdId ? store.ads.find((a) => a.id === editAdId) || null : null}
          shops={store.shops}
          isOwner={isOwner}
          onClose={() => { setShowCreate(false); setEditAdId(null); }}
          onCreate={createAd}
          onUpdate={updateAd}
          flash={flash}
        />
      )}

      {reportTarget && (
        <ReportModal
          ad={reportTarget}
          onClose={() => setReportTarget(null)}
          onSubmit={(reason, details) => submitReport(reportTarget, reason, details)}
        />
      )}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />{toast}
        </div>
      )}
    </main>
  );
}

/* ============================================================
   ПОДКОМПОНЕНТЫ
============================================================ */

function Sidebar({
  tab, setTab, favoritesCount, isAdmin, me, onOpenAdmin,
}: {
  tab: string; setTab: (t: string) => void; favoritesCount: number;
  isAdmin: boolean; me: User; onOpenAdmin: () => void;
}) {
  const items = [
    { label: "Главная", icon: Search },
    { label: "Магазины", icon: Store },
    { label: "Избранное", icon: Heart },
    { label: "Личный кабинет", icon: UserRound },
    { label: "FAQ", icon: CircleHelp },
  ];
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => setTab("Главная")} aria-label="На главную">
        <span className="brand-mark">M</span>
        <span>Marketplace<span className="brand-dot">.</span></span>
      </button>
      <div className="side-label">МЕНЮ</div>
      {items.map((it) => (
        <button
          key={it.label}
          className={`nav-item ${tab === it.label ? "active" : ""}`}
          onClick={() => setTab(it.label)}
        >
          <it.icon size={18} />
          <span>{it.label}</span>
          {it.label === "Избранное" && favoritesCount > 0 && (
            <span className="nav-count">{favoritesCount}</span>
          )}
        </button>
      ))}
      <div className="side-bottom">
        <div className="user-mini">
          <div className="avatar avatar-purple">{me.username[0].toUpperCase()}</div>
          <div>
            <strong>@{me.username}</strong>
            <small>{me.role}</small>
          </div>
          <ShieldCheck size={16} className="verified" />
        </div>
        {isAdmin && (
          <button className="nav-item admin-nav" onClick={onOpenAdmin}>
            <LayoutDashboard size={18} /><span>Админ-панель</span>
          </button>
        )}
        <div className="side-foot">МАРКЕТПЛЕЙС <span>локальное хранение</span></div>
      </div>
    </aside>
  );
}

function Topbar({
  tab, me, notificationsOpen, onToggleNotifications, onOpenProfile, breadcrumb,
}: {
  tab: string; me: User; notificationsOpen: boolean;
  onToggleNotifications: () => void; onOpenProfile: () => void; breadcrumb: string;
}) {
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <span className="brand-mark">M</span> Marketplace<span className="brand-dot">.</span>
      </div>
      <div className="breadcrumb">Marketplace <span>/</span> {breadcrumb}</div>
      <div className="top-actions">
        <button className="icon-button notification-button" onClick={onToggleNotifications} aria-label="Уведомления">
          <Bell size={19} /><i />
        </button>
        <button className="profile-pill" onClick={onOpenProfile}>
          <div className="avatar avatar-purple small-avatar">{me.username[0].toUpperCase()}</div>
          <span>@{me.username}</span>
          <ChevronRight size={15} />
        </button>
      </div>
      {notificationsOpen && (
        <div className="notification-pop">
          <div className="pop-title">Уведомления <span className="soft-tag">новые</span></div>
          <div className="notification-line">
            <span className="notification-dot" />
            <div>
              <b>Данные сохраняются локально</b>
              <small>Объявления, фото, жалобы и логи хранятся в этом браузере.</small>
            </div>
          </div>
          <button className="text-button" onClick={onToggleNotifications}>Закрыть</button>
        </div>
      )}
    </header>
  );
}

function PageTitle({ overline, title, subtitle }: { overline: string; title: string; subtitle: string }) {
  return (
    <div className="page-title">
      <span className="section-overline">{overline}</span>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div><span>{label}</span><strong>{value}</strong></div>
    </div>
  );
}

function AdCard({
  ad, liked, onOpen, onLike, onReport, shop,
}: {
  ad: Ad; liked: boolean; onOpen: () => void; onLike: () => void; onReport: () => void;
  shop: Shop | null;
}) {
  const tone = TONES[ad.id.charCodeAt(ad.id.length - 1) % TONES.length];
  const emoji = ad.photoIds.length ? "📷" : EMOJIS[ad.id.charCodeAt(0) % EMOJIS.length];
  return (
    <article className="ad-card">
      <button className={`ad-art ${tone}`} onClick={onOpen} aria-label={`Открыть ${ad.title}`}>
        <Photo photoId={ad.photoIds[0] || null} fallbackEmoji={emoji} className="ad-photo-wrap" alt={ad.title} />
        <span className="art-tag">{ad.category}</span>
        <span className="art-view"><Eye size={13} />{ad.views}</span>
      </button>
      <div className="ad-card-body">
        <div className="ad-card-top">
          <span className="ad-sub">{ad.sub}{shop ? ` · ${shop.name}` : ""}</span>
          <button className={`heart-button ${liked ? "liked" : ""}`} onClick={onLike} aria-label="В избранное">
            <Heart size={17} fill={liked ? "currentColor" : "none"} />
          </button>
        </div>
        <button className="ad-title" onClick={onOpen}>{ad.title}</button>
        <div className="ad-price">{money(ad.price)}</div>
        <div className="ad-card-bottom">
          <button className="seller-link" onClick={onOpen}>
            <span className="seller-dot">{ad.seller[0].toUpperCase()}</span>@{ad.seller}
          </button>
          <button className="report-mini" onClick={onReport} aria-label="Пожаловаться"><Flag size={14} /></button>
        </div>
        <button className="contact-button" onClick={onOpen}>
          <MessageCircle size={15} /> Открыть объявление
        </button>
      </div>
    </article>
  );
}

/* ---------- Главная ---------- */
function HomeTab({
  banners, bannerIdx, setBannerIdx, search, setSearch, category, setCategory,
  sub, setSub, minPrice, setMinPrice, maxPrice, setMaxPrice,
  sortBy, setSortBy, showFilters, setShowFilters, ads, likedIds,
  onOpenAd, onLike, onReport, onCreate, flash,
}: any) {
  const current = banners[bannerIdx] as Banner | undefined;
  return (
    <>
      {current && (
        <div className={`hero ${current.color}`}>
          <div className="hero-copy">
            <span className="hero-kicker"><Sparkles size={13} /> {current.kicker}</span>
            <h1>{current.title.split("\n").map((s: string, i: number) => <span key={i}>{s}<br /></span>)}</h1>
            <p>{current.sub}</p>
            {current.link && (
              <button
                className="hero-button"
                onClick={() => {
                  if (current.link.startsWith("#")) {
                    document.getElementById(current.link.slice(1))?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.open(current.link, "_blank");
                  }
                }}
              >
                Перейти <ArrowUpRight size={16} />
              </button>
            )}
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-cube">М<span>.</span></div>
            <div className="float-card float-one">✦ <b>Новые находки</b></div>
            <div className="float-card float-two"><Heart size={14} fill="currentColor" /> Твоё избранное</div>
          </div>
          {banners.length > 1 && (
            <div className="banner-controls">
              <span>{String(bannerIdx + 1).padStart(2, "0")} <i>/ {String(banners.length).padStart(2, "0")}</i></span>
              <button onClick={() => setBannerIdx((bannerIdx - 1 + banners.length) % banners.length)} aria-label="Предыдущий">
                <ChevronLeft size={17} />
              </button>
              <button onClick={() => setBannerIdx((bannerIdx + 1) % banners.length)} aria-label="Следующий">
                <ChevronRight size={17} />
              </button>
              <div className="banner-progress">
                <span style={{ width: `${((bannerIdx + 1) / banners.length) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="section-heading">
        <div>
          <span className="section-overline">ПОИСК ПО МАРКЕТПЛЕЙСУ</span>
          <h2>Что будем искать?</h2>
        </div>
        <span className="result-count">Объявления рядом с тобой</span>
      </div>

      <div className="search-row">
        <div className="search-field">
          <Search size={19} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Название, категория или продавец..."
          />
          {search && <button onClick={() => setSearch("")}><X size={16} /></button>}
        </div>
        <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={17} /> Фильтры
        </button>
      </div>

      {showFilters && (
        <div className="filters-inline" style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 1fr auto", marginTop: 12 }}>
          <input className="search-field" style={{ paddingLeft: 14 }} type="number" placeholder="Цена от"
            value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <input className="search-field" style={{ paddingLeft: 14 }} type="number" placeholder="Цена до"
            value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <select className="search-field" style={{ paddingLeft: 14 }} value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="new">Сначала новые</option>
            <option value="cheap">Сначала дешёвые</option>
            <option value="expensive">Сначала дорогие</option>
            <option value="views">По просмотрам</option>
          </select>
          <button className="secondary-button" onClick={() => {
            setMinPrice(""); setMaxPrice(""); setSortBy("new");
          }}>Сбросить</button>
        </div>
      )}

      <div className="category-row">
        {CATEGORIES.map((c, i) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`category-chip ${category === c ? "chosen" : ""}`}>
            <span className="category-symbol">{["✳", "☁", "⌘", "◈", "↗"][i]}</span>{c}
          </button>
        ))}
      </div>

      {category !== "Все" && (
        <div className="subcategory-row">
          <button className={sub === "Все" ? "sub-chip chosen-sub" : "sub-chip"} onClick={() => setSub("Все")}>
            Все
          </button>
          {(SUBCATEGORIES[category] || []).map((s) => (
            <button key={s} className={sub === s ? "sub-chip chosen-sub" : "sub-chip"} onClick={() => setSub(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="section-heading listing-heading" id="listing">
        <div>
          <span className="section-overline">СВЕЖЕЕ НА ПЛОЩАДКЕ</span>
          <h2>Лента объявлений <span className="heading-count">{ads.length}</span></h2>
        </div>
      </div>

      {ads.length === 0 ? (
        <div className="empty-state">
          <Search size={30} />
          <h3>Ничего не найдено</h3>
          <p>Попробуй изменить запрос или категорию.</p>
          <button className="secondary-button" onClick={() => {
            setSearch(""); setCategory("Все"); setSub("Все"); setMinPrice(""); setMaxPrice("");
          }}>Сбросить фильтры</button>
        </div>
      ) : (
        <div className="ad-grid">
          {ads.map((ad: Ad) => (
            <AdCard key={ad.id} ad={ad} liked={likedIds.includes(ad.id)}
              onOpen={() => onOpenAd(ad.id)}
              onLike={() => onLike(ad.id)}
              onReport={() => onReport(ad)}
              shop={null}
            />
          ))}
        </div>
      )}

      <div className="bottom-cta">
        <div className="cta-icon"><Plus size={22} /></div>
        <div>
          <h3>Есть что предложить?</h3>
          <p>Опубликуй объявление и найди своего покупателя.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <Plus size={17} /> Подать объявление
        </button>
      </div>
    </>
  );
}

/* ---------- Личный кабинет ---------- */
function MyAccount({
  me, store, myAds, likedIds, onOpenAd, onLike, onReport, onCreate, onEdit, onDelete, onToggleSold, onOpenFav, flash,
}: any) {
  const totalViews = myAds.reduce((s: number, a: Ad) => s + a.views, 0);
  const rating = ratingOf(store, me.username);
  return (
    <>
      <PageTitle overline="ТВОЁ ПРОСТРАНСТВО" title="Личный кабинет"
        subtitle="Управляй объявлениями, избранным и своим профилем." />
      <div className="profile-banner">
        <div className="avatar avatar-purple profile-big">{me.username[0].toUpperCase()}</div>
        <div className="profile-main">
          <div className="profile-name">@{me.username} <ShieldCheck size={17} /></div>
          <p>Роль: {me.role} · данные хранятся в этом браузере</p>
          <span className="soft-tag">{me.role === "Владелец" ? "Владелец сайта" : me.role}</span>
        </div>
        <button className="secondary-button" onClick={() => flash("Редактирование профиля появится с Telegram-авторизацией.")}>
          <Pencil size={15} /> Изменить профиль
        </button>
      </div>
      <div className="stats-grid">
        <Stat icon={<Package />} label="Мои объявления" value={String(myAds.length)} />
        <Stat icon={<Eye />} label="Просмотры" value={String(totalViews)} />
        <Stat icon={<Heart />} label="В избранном" value={String(likedIds.length)} />
      </div>
      <div className="section-heading">
        <div>
          <span className="section-overline">УПРАВЛЕНИЕ</span>
          <h2>Мои объявления</h2>
        </div>
        <button className="primary-button" onClick={onCreate}><Plus size={16} /> Добавить</button>
      </div>
      {myAds.length === 0 ? (
        <div className="empty-state">
          <Package size={30} />
          <h3>Объявлений пока нет</h3>
          <p>Нажми «Добавить», чтобы опубликовать первое.</p>
        </div>
      ) : (
        <div className="ad-grid">
          {myAds.map((ad: Ad) => (
            <div key={ad.id} style={{ position: "relative" }}>
              <AdCard ad={ad} liked={likedIds.includes(ad.id)}
                onOpen={() => onOpenAd(ad.id)} onLike={() => onLike(ad.id)}
                onReport={() => onReport(ad)} shop={null} />
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button className="secondary-button compact" onClick={() => onEdit(ad.id)}><Pencil size={14} /> Изменить</button>
                <button className="secondary-button compact" onClick={() => onToggleSold(ad.id)}>
                  {ad.sold ? <><RotateCcw size={14} /> Вернуть</> : <><CheckCircle2 size={14} /> Продано</>}
                </button>
                <button className="danger-button compact" onClick={() => onDelete(ad.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="settings-list">
        <button onClick={onOpenFav}><Heart /> Избранные объявления <ChevronRight /></button>
        <button onClick={() => flash("История удалённых появится после серверной интеграции.")}>
          <RotateCcw /> История и удалённые <ChevronRight />
        </button>
        <button onClick={() => flash("Настройки аккаунта.")}><Settings2 /> Настройки аккаунта <ChevronRight /></button>
      </div>
    </>
  );
}

/* ---------- Детали объявления ---------- */
function AdDetail({
  ad, liked, seller, reviews, onBack, onToggleFav, onReport, onSeller, onView,
}: any) {
  useEffect(() => { onView(); /* eslint-disable-next-line */ }, [ad.id]);
  const rating = reviews.length
    ? (reviews.reduce((s: number, r: Review) => s + r.stars, 0) / reviews.length).toFixed(1)
    : "—";
  const tone = TONES[ad.id.charCodeAt(ad.id.length - 1) % TONES.length];
  return (
    <div className="content detail-page">
      <button className="back-link" onClick={onBack}><ChevronLeft size={17} /> Назад к объявлениям</button>
      <div className="detail-grid">
        <div>
          <div className={`detail-photo ${tone}`}>
            <Photo photoId={ad.photoIds[0] || null} fallbackEmoji="📷" className="detail-photo-img" alt={ad.title} />
            <div className="photo-count">▧ {ad.photoIds.length || 0} фото</div>
          </div>
          {ad.photoIds.length > 1 && (
            <div className="thumb-row">
              {ad.photoIds.map((pid: string, i: number) => (
                <div key={pid} className={`thumb ${tone}`} style={{ overflow: "hidden" }}>
                  <Photo photoId={pid} fallbackEmoji={`${i + 1}`} className="thumb-img" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="detail-info">
          <div className="eyebrow">{ad.category} <span>·</span> {ad.sub}</div>
          <h1>{ad.title}</h1>
          <div className="detail-price">{money(ad.price)}</div>
          <div className="detail-meta">
            <span><Eye size={16} /> {ad.views} просмотров</span>
            <button className={`favorite-button ${liked ? "liked" : ""}`} onClick={onToggleFav}>
              <Heart size={17} fill={liked ? "currentColor" : "none"} />
              {liked ? "В избранном" : "В избранное"}
            </button>
          </div>
          <div className="line" />
          <h3>Описание</h3>
          <p className="description">{ad.description}</p>
          <div className="line" />
          <h3>Продавец</h3>
          <button className="seller-card" onClick={onSeller}>
            <div className="avatar avatar-blue">{(seller?.username || ad.seller)[0].toUpperCase()}</div>
            <div>
              <strong>@{seller?.username || ad.seller}</strong>
              <small>Рейтинг {rating} ★ · {reviews.length} отзывов</small>
            </div>
            <ChevronRight size={18} />
          </button>
          <a className="primary-button full-button"
            href={`https://t.me/${(seller?.username || ad.seller).replace(/^@/, "")}`}
            target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> Написать продавцу
          </a>
          <button className="report-button full-button" onClick={onReport}>
            <Flag size={16} /> Пожаловаться на объявление
          </button>
          <p className="demo-note">Для связи откроется Telegram-профиль продавца.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Профиль продавца ---------- */
function SellerProfile({
  username, seller, ads, reviews, rating, likedIds, onBack, onOpenAd, onLike, onReview,
}: any) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  return (
    <div className="content">
      <button className="back-link" onClick={onBack}><ChevronLeft size={17} /> Назад</button>
      <PageTitle overline="ПРОФИЛЬ УЧАСТНИКА" title={`@${username}`}
        subtitle={seller ? `Роль: ${seller.role}` : "Профиль продавца"} />
      <div className="profile-banner">
        <div className="avatar avatar-blue profile-big">{username[0].toUpperCase()}</div>
        <div className="profile-main">
          <div className="profile-name">@{username}</div>
          <p>Продавец сообщества</p>
          <div className="rating-line">
            {"★".repeat(Math.round(rating.avg))}{"☆".repeat(5 - Math.round(rating.avg))}
            <b>{rating.avg.toFixed(1)}</b> <span>({rating.count} оценок)</span>
          </div>
        </div>
        <a className="primary-button" href={`https://t.me/${username}`} target="_blank" rel="noopener noreferrer">
          <Send size={16} /> Связаться
        </a>
      </div>
      <div className="stats-grid">
        <Stat icon={<Package />} label="Активные объявления" value={String(ads.length)} />
        <Stat icon={<CheckCircle2 />} label="Оценка продавца" value={rating.avg.toFixed(1)} />
        <Stat icon={<Eye />} label="Отзывов" value={String(rating.count)} />
      </div>
      <div className="section-heading">
        <div><span className="section-overline">ОЦЕНИТЬ</span><h2>Оставить отзыв</h2></div>
      </div>
      <div className="rating-form">
        <p>Как прошла ваша сделка?</p>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} style={{ color: n <= stars ? "#f3b94c" : "#4b4f6a" }}>
              ★
            </button>
          ))}
        </div>
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Расскажи о своём опыте (необязательно)" />
        <button className="primary-button" onClick={() => {
          if (!text.trim()) return;
          onReview(stars, text.trim());
          setText("");
        }}>Отправить оценку</button>
      </div>
      <div className="section-heading">
        <div><span className="section-overline">ОТЗЫВЫ</span><h2>Что говорят покупатели</h2></div>
      </div>
      {reviews.length === 0 ? (
        <div className="empty-state"><MessageCircle size={30} /><h3>Отзывов пока нет</h3><p>Стань первым.</p></div>
      ) : (
        <div className="review-demo-list">
          {reviews.map((r: Review) => (
            <div className="permission-row" key={r.id}>
              <div>
                <b>@{r.author} · {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</b>
                <p>{r.text}</p>
                <p style={{ fontSize: 10, color: "#7a7f99", marginTop: 4 }}>{fmtDT(r.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="section-heading">
        <div><span className="section-overline">В ПРОДАЖЕ</span><h2>Объявления продавца</h2></div>
      </div>
      <div className="ad-grid">
        {ads.map((ad: Ad) => (
          <AdCard key={ad.id} ad={ad} liked={likedIds.includes(ad.id)}
            onOpen={() => onOpenAd(ad.id)} onLike={() => onLike(ad.id)}
            onReport={() => {}} shop={null} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Магазины ---------- */
function ShopsTab({ shops, ads, onOpen, isOwner, onSave, onDelete }: any) {
  const [editing, setEditing] = useState<Shop | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <>
      <PageTitle overline="ВИТРИНЫ СООБЩЕСТВА" title="Магазины"
        subtitle="Подборка магазинов и продавцов Marketplace." />
      {isOwner && (
        <div className="action-row" style={{ marginBottom: 18 }}>
          <button className="primary-button" onClick={() => { setEditing(null); setCreating(true); }}>
            <Plus size={16} /> Создать магазин
          </button>
        </div>
      )}
      <div className="shop-list">
        {shops.map((s: Shop, i: number) => {
          const count = ads.filter((a: Ad) => a.shopId === s.id && !a.sold).length;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="shop-row" style={{ flex: 1 }} onClick={() => onOpen(s.id)}>
                <div className={`shop-small shop-${i % 3}`}>{s.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <strong>{s.name}</strong>
                  <small>{count} товаров · {s.verified ? "Проверенный магазин" : "Магазин сообщества"}</small>
                </div>
                {s.verified && <ShieldCheck size={16} className="verified" />}
                <ChevronRight size={17} />
              </button>
              {isOwner && (
                <>
                  <button className="secondary-button compact" onClick={() => { setEditing(s); setCreating(true); }}>
                    <Pencil size={14} />
                  </button>
                  <button className="danger-button compact" onClick={() => onDelete(s.id)}>
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
      {creating && (
        <ShopEditor
          shop={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={(s) => { onSave(s); setCreating(false); setEditing(null); }}
        />
      )}
    </>
  );
}

function ShopEditor({ shop, onClose, onSave }: { shop: Shop | null; onClose: () => void; onSave: (s: Shop) => void }) {
  const [name, setName] = useState(shop?.name || "");
  const [owner, setOwner] = useState(shop?.owner || "nukm0");
  const [description, setDescription] = useState(shop?.description || "");
  const [verified, setVerified] = useState(shop?.verified ?? false);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="section-overline">{shop ? "РЕДАКТИРОВАНИЕ" : "НОВЫЙ МАГАЗИН"}</span>
            <h2>{shop ? shop.name : "Создать магазин"}</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="form-field">
          <label>Название *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mide shop" />
        </div>
        <div className="form-field">
          <label>Владелец (username)</label>
          <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="nukm0" />
        </div>
        <div className="form-field">
          <label>Описание</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-field">
          <label>
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} style={{ width: "auto", marginRight: 8 }} />
            Проверенный магазин
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Отмена</button>
          <button className="primary-button" onClick={() => {
            if (!name.trim()) return;
            onSave({
              id: shop?.id || uid("s"),
              name: name.trim(),
              owner: owner.trim(),
              description: description.trim(),
              verified,
              createdAt: shop?.createdAt || nowISO(),
            });
          }}><Save size={15} /> Сохранить</button>
        </div>
      </div>
    </div>
  );
}

function ShopStorefront({ shopId, store, likedIds, onBack, onOpenAd, onLike, onReport }: any) {
  const shop = store.shops.find((s: Shop) => s.id === shopId);
  if (!shop) {
    return (
      <div className="content">
        <button className="back-link" onClick={onBack}><ChevronLeft size={17} /> Все магазины</button>
        <div className="empty-state"><Store size={30} /><h3>Магазин не найден</h3></div>
      </div>
    );
  }
  const shopAds = store.ads.filter((a: Ad) => a.shopId === shop.id && !a.sold);
  return (
    <div className="content">
      <button className="back-link" onClick={onBack}><ChevronLeft size={17} /> Все магазины</button>
      <div className="shop-cover">
        <div className="shop-emblem">{shop.name[0]}</div>
        <div>
          <span className="soft-tag">{shop.verified ? "Проверенный магазин" : "Магазин сообщества"}</span>
          <h1>{shop.name}</h1>
          <p>{shop.description || "Товары и услуги от команды магазина."}</p>
        </div>
      </div>
      <div className="section-heading">
        <div><span className="section-overline">КАТАЛОГ</span><h2>Товары магазина <span className="heading-count">{shopAds.length}</span></h2></div>
      </div>
      {shopAds.length === 0 ? (
        <div className="empty-state"><Package size={30} /><h3>Товаров нет</h3></div>
      ) : (
        <div className="ad-grid">
          {shopAds.map((ad: Ad) => (
            <AdCard key={ad.id} ad={ad} liked={likedIds.includes(ad.id)}
              onOpen={() => onOpenAd(ad.id)} onLike={() => onLike(ad.id)}
              onReport={() => onReport(ad)} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- FAQ ---------- */
function FAQTab({ flash }: { flash: (m: string) => void }) {
  const items = [
    { q: "Как найти нужный товар?", a: "Используй поиск, фильтры по цене и категории." },
    { q: "Как разместить объявление?", a: "В личном кабинете нажми «Добавить», заполни поля и загрузи до 5 фото." },
    { q: "Где хранятся фотографии?", a: "В IndexedDB твоего браузера. Они сохраняются после перезагрузки, но не покидают устройство." },
    { q: "Как связаться с продавцом?", a: "Открой объявление и нажми «Написать продавцу» — откроется Telegram." },
    { q: "Как пожаловаться?", a: "Нажми на флаг в карточке или в деталях объявления. Жалоба попадёт в очередь модерации." },
    { q: "Что такое проверенный магазин?", a: "Витрина, которой владелец выдал статус verified в админке." },
  ];
  return (
    <div className="content">
      <PageTitle overline="ПОМОЩЬ И ПОДДЕРЖКА" title="Как пользоваться Marketplace?"
        subtitle="Коротко о главном — от поиска до безопасной сделки." />
      <div className="faq-list">
        {items.map((f, i) => (
          <details className="faq-item" key={f.q} open={i === 0}>
            <summary>
              <span className="faq-number">0{i + 1}</span>{f.q}
              <ChevronRight size={17} />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      <div className="owner-cta">
        <div className="cta-icon"><MessageCircle /></div>
        <div>
          <h3>Есть идея или нашли ошибку?</h3>
          <p>Напиши владельцу в Telegram: @nukm0</p>
        </div>
        <a className="primary-button" href="https://t.me/nukm0" target="_blank" rel="noopener noreferrer">
          Написать владельцу <ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  );
}

/* ---------- Админ-панель ---------- */
function AdminPanel({
  page, setPage, store, me, isOwner, setUserRole, toggleBan,
  resolveReport, saveBanner, deleteBanner, toggleBanner, saveShop, deleteShop, resetDemo, flash,
}: any) {
  const tiles = [
    { name: "Обзор", icon: ChartNoAxesCombined, desc: "Сводка по площадке" },
    { name: "Участники", icon: Users, desc: "Роли и блокировки" },
    { name: "Жалобы", icon: Flag, desc: "Очередь модерации" },
    { name: "Баннеры", icon: MegaphoneIcon, desc: "Слайдер на главной" },
    { name: "Магазины", icon: Store, desc: "Витрины сообщества" },
    { name: "Логи", icon: ScrollText, desc: "Действия и решения" },
  ];
  const userRole = me.role as Role;
  const isOwnerRole = isOwner;

  return (
    <div className="content">
      <PageTitle overline="УПРАВЛЕНИЕ ПЛОЩАДКОЙ" title="Админ-панель"
        subtitle={`Текущая роль: ${userRole}. Изменения сохраняются локально.`} />
      <div className="admin-alert">
        <ShieldCheck size={18} />
        <div>
          <b>Режим администратора</b>
          <span>Все действия записываются в лог. Роли выше твоей изменить нельзя.</span>
        </div>
        <span className="soft-tag">{userRole.toUpperCase()}</span>
      </div>
      <div className="admin-tiles">
        {tiles.map((t, i) => (
          <button key={t.name} className={`admin-tile ${page === t.name ? "tile-active" : ""}`} onClick={() => setPage(t.name)}>
            <div className={`tile-icon tile-${i}`}><t.icon size={21} /></div>
            <strong>{t.name}</strong>
            <span>{t.desc}</span>
            <div className="tile-bottom"><small>→</small><ArrowUpRight size={16} /></div>
          </button>
        ))}
      </div>

      <div className="admin-content">
        <div className="section-heading">
          <div><span className="section-overline">РАЗДЕЛ</span><h2>{page}</h2></div>
        </div>

        {page === "Обзор" && (
          <div className="stats-grid admin-stats">
            <Stat icon={<Package />} label="Объявлений" value={String(store.ads.length)} />
            <Stat icon={<Users />} label="Участников" value={String(store.users.length)} />
            <Stat icon={<Flag />} label="Жалоб" value={String(store.reports.length)} />
            <Stat icon={<Store />} label="Магазинов" value={String(store.shops.length)} />
            <Stat icon={<Heart />} label="Избранных" value={String(store.favorites.length)} />
            <Stat icon={<ScrollText />} label="Записей лога" value={String(store.logs.length)} />
          </div>
        )}

        {page === "Участники" && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Пользователь</th><th>Роль</th><th>Статус</th><th>Действия</th></tr>
              </thead>
              <tbody>
                {store.users.map((u: User) => (
                  <tr key={u.id}>
                    <td><b>@{u.username}</b></td>
                    <td>
                      <select value={u.role}
                        disabled={!isOwnerRole || u.username === me.username}
                        onChange={(e) => setUserRole(u.username, e.target.value as Role)}
                        className="search-field" style={{ paddingLeft: 10, height: 32 }}>
                        {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className={u.banned ? "status-banned" : "status-active"}>
                        {u.banned ? "Забанен" : "Активен"}
                      </span>
                      {u.banned && u.banReason && (
                        <div style={{ fontSize: 10, color: "#a3abc4", marginTop: 4 }}>{u.banReason}</div>
                      )}
                    </td>
                    <td>
                      <button className="dots-button"
                        disabled={u.username === me.username}
                        onClick={() => {
                          const reason = window.prompt(u.banned ? "Причина разбана:" : "Причина бана:");
                          if (reason === null) return;
                          toggleBan(u.username, reason);
                        }}>
                        <Ban size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {page === "Жалобы" && (
          <div className="report-list">
            {store.reports.length === 0 ? (
              <div className="empty-state"><Flag size={28} /><h3>Жалоб нет</h3></div>
            ) : store.reports.map((r: Report) => (
              <div key={r.id} className="report-row" style={{ cursor: "default" }}>
                <div className="report-flag"><Flag size={17} /></div>
                <div style={{ flex: 1 }}>
                  <b>{r.reason} · {store.ads.find((a: Ad) => a.id === r.adId)?.title || r.adId}</b>
                  <small>от @{r.reporter} — {r.details}</small>
                  <small style={{ marginTop: 4 }}>
                    Статус: <b>{r.status}</b>
                    {r.decision && <> · Комментарий: {r.decision} ({r.decisionBy})</>}
                  </small>
                </div>
                <div className="action-row" style={{ marginTop: 0 }}>
                  <button className="secondary-button compact"
                    onClick={() => {
                      const c = window.prompt("Комментарий модератора:", r.decision || "");
                      if (c === null) return;
                      resolveReport(r.id, "На проверке", c);
                    }}>На проверке</button>
                  <button className="primary-button compact"
                    disabled={!isOwnerRole}
                    onClick={() => {
                      const c = window.prompt("Комментарий владельца:", r.decision || "");
                      if (c === null) return;
                      resolveReport(r.id, "Одобрено владельцем", c);
                    }}>Одобрить</button>
                  <button className="danger-button compact"
                    disabled={!isOwnerRole}
                    onClick={() => {
                      const c = window.prompt("Причина отклонения:", r.decision || "");
                      if (c === null) return;
                      resolveReport(r.id, "Отклонено", c);
                    }}>Отклонить</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {page === "Баннеры" && (
          <BannersAdmin
            banners={store.banners}
            onSave={saveBanner}
            onDelete={deleteBanner}
            onToggle={toggleBanner}
            isOwner={isOwnerRole}
            flash={flash}
          />
        )}

        {page === "Магазины" && (
          <div className="report-list">
            {store.shops.map((s: Shop) => (
              <div key={s.id} className="report-row" style={{ cursor: "default" }}>
                <div className="report-flag"><Store size={17} /></div>
                <div style={{ flex: 1 }}>
                  <b>{s.name} {s.verified && "✓"}</b>
                  <small>Владелец: @{s.owner} · {store.ads.filter((a: Ad) => a.shopId === s.id).length} товаров</small>
                </div>
                {isOwnerRole && (
                  <button className="danger-button compact" onClick={() => deleteShop(s.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {page === "Логи" && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Время</th><th>Кто</th><th>Действие</th><th>Объект</th><th>Причина</th><th>Результат</th></tr>
              </thead>
              <tbody>
                {store.logs.slice(0, 200).map((l: LogEntry) => (
                  <tr key={l.id}>
                    <td>{fmtDT(l.ts)}</td>
                    <td>@{l.actor}</td>
                    <td><b>{l.action}</b></td>
                    <td>{l.target}</td>
                    <td>{l.reason || "—"}</td>
                    <td>{l.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {page === "Обзор" && (
          <div className="permission-box danger-zone" style={{ marginTop: 20 }}>
            <h3>Сброс демо-данных</h3>
            <p>Удалит все локальные изменения и вернёт начальное состояние.</p>
            <button className="danger-button" onClick={resetDemo}>
              <RotateCcw size={16} /> Сбросить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BannersAdmin({ banners, onSave, onDelete, onToggle, isOwner, flash }: any) {
  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="action-row" style={{ marginBottom: 14 }}>
        <button className="primary-button" disabled={!isOwner} onClick={() => { setEditing(null); setCreating(true); }}>
          <Plus size={16} /> Создать баннер
        </button>
      </div>
      <div className="report-list">
        {banners.map((b: Banner) => (
          <div key={b.id} className="report-row" style={{ cursor: "default" }}>
            <div className="report-flag"><MegaphoneIcon size={17} /></div>
            <div style={{ flex: 1 }}>
              <b>{b.title.replace("\n", " / ")}</b>
              <small>{b.kicker} · {b.color} · {b.active ? "активен" : "выключен"}</small>
            </div>
            <button className="secondary-button compact" onClick={() => onToggle(b.id)}>
              {b.active ? "Выключить" : "Включить"}
            </button>
            <button className="secondary-button compact" onClick={() => { setEditing(b); setCreating(true); }}>
              <Pencil size={14} />
            </button>
            <button className="danger-button compact" disabled={!isOwner} onClick={() => onDelete(b.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      {creating && (
        <BannerEditor
          banner={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={(b) => { onSave(b); setCreating(false); setEditing(null); }}
        />
      )}
    </>
  );
}

function BannerEditor({ banner, onClose, onSave }: { banner: Banner | null; onClose: () => void; onSave: (b: Banner) => void }) {
  const [kicker, setKicker] = useState(banner?.kicker || "MARKETPLACE");
  const [title, setTitle] = useState(banner?.title || "Заголовок\nбаннера");
  const [sub, setSub] = useState(banner?.sub || "Короткое описание");
  const [color, setColor] = useState<Banner["color"]>(banner?.color || "banner-purple");
  const [link, setLink] = useState(banner?.link || "#listing");
  const [active, setActive] = useState(banner?.active ?? true);
  const [order, setOrder] = useState(banner?.order ?? 1);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="section-overline">{banner ? "РЕДАКТИРОВАНИЕ" : "НОВЫЙ БАННЕР"}</span>
            <h2>{banner ? "Изменить баннер" : "Создать баннер"}</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="form-field"><label>Kicker</label><input value={kicker} onChange={(e) => setKicker(e.target.value)} /></div>
        <div className="form-field">
          <label>Заголовок (можно с \n)</label>
          <textarea rows={2} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-field"><label>Подзаголовок</label><input value={sub} onChange={(e) => setSub(e.target.value)} /></div>
        <div className="form-two">
          <div className="form-field">
            <label>Цвет</label>
            <select value={color} onChange={(e) => setColor(e.target.value as Banner["color"])}>
              <option value="banner-purple">Фиолетовый</option>
              <option value="banner-blue">Синий</option>
              <option value="banner-orange">Оранжевый</option>
            </select>
          </div>
          <div className="form-field"><label>Порядок</label><input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} /></div>
        </div>
        <div className="form-field"><label>Ссылка (URL или #id)</label><input value={link} onChange={(e) => setLink(e.target.value)} /></div>
        <div className="form-field">
          <label>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ width: "auto", marginRight: 8 }} />
            Активен
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Отмена</button>
          <button className="primary-button" onClick={() => onSave({
            id: banner?.id || uid("b"),
            kicker, title, sub, color, link, active, order,
          })}><Save size={15} /> Сохранить</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Создание/редактирование объявления ---------- */
function AdEditor({
  ad, shops, isOwner, onClose, onCreate, onUpdate, flash,
}: any) {
  const [title, setTitle] = useState(ad?.title || "");
  const [category, setCategory] = useState(ad?.category || "Одежда");
  const [sub, setSub] = useState(ad?.sub || SUBCATEGORIES["Одежда"][0]);
  const [price, setPrice] = useState(String(ad?.price ?? ""));
  const [description, setDescription] = useState(ad?.description || "");
  const [shopId, setShopId] = useState<string>(ad?.shopId || "");
  const [files, setFiles] = useState<File[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const list = SUBCATEGORIES[category] || [];
    if (!list.includes(sub)) setSub(list[0] || "—");
  }, [category]); // eslint-disable-line

  async function handleSubmit() {
    if (!title.trim()) { flash("Введите название."); return; }
    if (!ad && files.length === 0) { flash("Добавьте хотя бы одно фото."); return; }
    setBusy(true);
    try {
      if (ad) {
        await onUpdate(ad.id, {
          title: title.trim(), category, sub,
          price: Number(price) || 0,
          description: description.trim() || "Описание не добавлено.",
          shopId: shopId || null,
        }, files, removed);
      } else {
        await onCreate({
          title, category, sub,
          price: Number(price) || 0,
          description, files, shopId: shopId || null,
        });
      }
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="section-overline">{ad ? "РЕДАКТИРОВАНИЕ" : "НОВАЯ ПУБЛИКАЦИЯ"}</span>
            <h2>{ad ? "Изменить объявление" : "Создать объявление"}</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="form-field">
          <label>Название *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, наушники в отличном состоянии" />
        </div>

        <div className="form-two">
          <div className="form-field">
            <label>Категория *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.filter((c) => c !== "Все").map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Подкатегория *</label>
            <select value={sub} onChange={(e) => setSub(e.target.value)}>
              {(SUBCATEGORIES[category] || ["—"]).map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label>Описание <span>(необязательно)</span></label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="form-field">
          <label>Цена, ₽</label>
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 — договорная" />
        </div>

        {isOwner && shops.length > 0 && (
          <div className="form-field">
            <label>Магазин (опционально)</label>
            <select value={shopId} onChange={(e) => setShopId(e.target.value)}>
              <option value="">— Не привязано —</option>
              {shops.map((s: Shop) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        <div className="form-field">
          <label>Фотографии {ad ? "(до 5 всего)" : "*"}</label>
          {ad && ad.photoIds.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {ad.photoIds.map((pid: string) => {
                const isRemoved = removed.includes(pid);
                return (
                  <div key={pid} style={{ position: "relative", width: 68, height: 60, borderRadius: 10, overflow: "hidden", opacity: isRemoved ? 0.3 : 1 }}>
                    <Photo photoId={pid} fallbackEmoji="📷" className="thumb-img" />
                    <button
                      style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,.6)", border: 0, color: "#fff", borderRadius: 6, width: 20, height: 20, cursor: "pointer" }}
                      onClick={() => setRemoved((r) => isRemoved ? r.filter((x) => x !== pid) : [...r, pid])}
                    >{isRemoved ? "+" : "×"}</button>
                  </div>
                );
              })}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden
            onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))} />
          <button className="upload-box" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={20} />
            <b>{files.length ? `Выбрано файлов: ${files.length}` : "Добавить фото"}</b>
            <small>JPG, PNG, WebP. До 5 фото.</small>
          </button>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} disabled={busy}>Отмена</button>
          <button className="primary-button" onClick={handleSubmit} disabled={busy}>
            {busy ? "Сохранение…" : (ad ? <><Save size={15} /> Сохранить</> : <><Plus size={15} /> Опубликовать</>)}
          </button>
        </div>
        <p className="form-hint">Фото хранятся в IndexedDB браузера. Другие устройства их не увидят без серверной синхронизации.</p>
      </div>
    </div>
  );
}

/* ---------- Жалоба ---------- */
function ReportModal({ ad, onClose, onSubmit }: { ad: Ad; onClose: () => void; onSubmit: (reason: string, details: string) => void }) {
  const [reason, setReason] = useState("Не та категория");
  const [details, setDetails] = useState("");
  const tone = TONES[ad.id.charCodeAt(ad.id.length - 1) % TONES.length];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="section-overline">БЕЗОПАСНОСТЬ СООБЩЕСТВА</span>
            <h2>Пожаловаться</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="reported-item">
          <div className={`reported-emoji ${tone}`}><Photo photoId={ad.photoIds[0] || null} fallbackEmoji="📷" className="thumb-img" /></div>
          <div>
            <b>{ad.title}</b>
            <small>{money(ad.price)} · @{ad.seller}</small>
          </div>
        </div>
        <div className="form-field">
          <label>Причина *</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>Не та категория</option>
            <option>Мошенничество</option>
            <option>Мультиаккаунт</option>
            <option>Оскорбления</option>
            <option>Другое нарушение</option>
          </select>
        </div>
        <div className="form-field">
          <label>Опиши ситуацию *</label>
          <textarea rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Что произошло?" />
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Отмена</button>
          <button className="primary-button" onClick={() => { if (!details.trim()) return; onSubmit(reason, details.trim()); }}>
            <Flag size={16} /> Отправить
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Мобильная навигация ---------- */
function MobileNav({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const items = [
    { label: "Главная", icon: Search },
    { label: "Магазины", icon: Store },
    { label: "Избранное", icon: Heart },
    { label: "Личный кабинет", icon: UserRound },
    { label: "FAQ", icon: CircleHelp },
  ];
  return (
    <nav className="mobile-nav">
      {items.map((it) => (
        <button key={it.label} className={tab === it.label ? "mobile-active" : ""} onClick={() => setTab(it.label)}>
          <it.icon size={19} />
          <span>{it.label === "Личный кабинет" ? "Профиль" : it.label}</span>
        </button>
      ))}
    </nav>
  );
}
