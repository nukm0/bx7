"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search, Bell, UserRound, ShieldCheck, Store, CircleHelp, Plus,
  Heart, Eye, MessageCircle, Flag, ChevronLeft, ChevronRight,
  SlidersHorizontal, MoreHorizontal, LayoutDashboard, X, ArrowUpRight,
  Package, ChartNoAxesCombined, Users, Megaphone, CheckCircle2, Trash2,
  Pencil, RotateCcw, Ban, Settings2, Send, Sparkles
} from "lucide-react";

type Ad = {
  id: number; title: string; category: string; sub: string; price: number;
  views: number; seller: string; emoji: string; tone: string; description: string;
  sold?: boolean; photos: number;
};
const initialAds: Ad[] = [
  { id: 1, title: "Vape kit — почти новый", category: "Vape", sub: "Подики", price: 3500, views: 248, seller: "cloudboy", emoji: "☁️", tone: "lavender", description: "Состояние отличное, использовался аккуратно. Комплект на фото.", photos: 2 },
  { id: 2, title: "Наушники Studio Pro", category: "Техника", sub: "Б/у", price: 6200, views: 186, seller: "mike.wav", emoji: "🎧", tone: "blue", description: "Отличный звук, всё работает. Возможна встреча в городе.", photos: 3 },
  { id: 3, title: "Худи oversize", category: "Одежда", sub: "Новое", price: 2400, views: 91, seller: "sasha.jpg", emoji: "🧥", tone: "peach", description: "Новое худи, размер M/L. Приятный плотный материал.", photos: 1 },
  { id: 4, title: "Помощь с настройкой ПК", category: "Услуги", sub: "Предоставление услуги", price: 1500, views: 320, seller: "bytefix", emoji: "🛠️", tone: "mint", description: "Помогу собрать, настроить и оптимизировать компьютер.", photos: 1 },
  { id: 5, title: "Клавиатура механическая", category: "Техника", sub: "Б/у", price: 4100, views: 74, seller: "keycap", emoji: "⌨️", tone: "pink", description: "Механика с приятным ходом клавиш. Полностью исправна.", photos: 2 },
  { id: 6, title: "Ищу фотографа на съёмку", category: "Услуги", sub: "Поиск услуги", price: 0, views: 52, seller: "mari", emoji: "📸", tone: "sand", description: "Ищу фотографа на небольшую уличную съёмку.", photos: 1 },
];
const categories = ["Все", "Vape", "Техника", "Одежда", "Услуги"];
const subcategories: Record<string, string[]> = {
  Vape: ["Подики", "Услуги", "Расходники"],
  Техника: ["Б/у", "Новое"],
  Одежда: ["Б/у", "Новое"],
  Услуги: ["Предоставление услуги", "Поиск услуги"],
};
const money = (n: number) => n === 0 ? "Договорная" : n.toLocaleString("ru-RU") + " ₽";

export default function Home() {
  const [tab, setTab] = useState("Главная");
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [sub, setSub] = useState("Все");
  const [favorites, setFavorites] = useState<number[]>([2]);
  const [selected, setSelected] = useState<Ad | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [banner, setBanner] = useState(0);
  const [notice, setNotice] = useState("");
  const [adminPage, setAdminPage] = useState("Обзор");
  const [reportTarget, setReportTarget] = useState<Ad | null>(null);
  const [reportReason, setReportReason] = useState("Мошенничество");
  const [reportText, setReportText] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("Одежда");
  const [newSub, setNewSub] = useState("Б/у");
  const [newDescription, setNewDescription] = useState("");
  const [newPhoto, setNewPhoto] = useState(false);
  const [shopName, setShopName] = useState("Mide shop");
  const [reports, setReports] = useState<{id:number; title:string; seller:string; reason:string; details:string; status:string; decisionComment:string}[]>([
    {id:101,title:"Наушники Studio Pro",seller:"mike.wav",reason:"Не та категория",details:"Проверка процесса рассмотрения жалобы.",status:"Новая",decisionComment:""},
    {id:102,title:"Худи oversize",seller:"sasha.jpg",reason:"Мошенничество",details:"Продавец не отвечает после договорённости.",status:"На проверке",decisionComment:""}
  ]);
  const [reviews, setReviews] = useState<{seller:string; stars:number; text:string}[]>([{seller:"cloudboy",stars:5,text:"Быстрая сделка, всё соответствует описанию."}]);
  const [demoRole, setDemoRole] = useState("Владелец");
  const [moderationComment, setModerationComment] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [persistReady, setPersistReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("marketplace-demo-state-v3");
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.ads)) setAds(data.ads);
        if (Array.isArray(data.favorites)) setFavorites(data.favorites);
        if (Array.isArray(data.reports)) setReports(data.reports);
        if (Array.isArray(data.reviews)) setReviews(data.reviews);
        if (typeof data.demoRole === "string") setDemoRole(data.demoRole);
      }
    } catch { /* corrupted demo state is ignored */ }
    setPersistReady(true);
  }, []);
  useEffect(() => {
    if (!persistReady) return;
    localStorage.setItem("marketplace-demo-state-v3", JSON.stringify({ads,favorites,reports,reviews,demoRole}));
  }, [ads,favorites,reports,reviews,demoRole,persistReady]);

  function resetDemo() {
    setAds(initialAds); setFavorites([2]);
    setReports([
      {id:101,title:"Наушники Studio Pro",seller:"mike.wav",reason:"Не та категория",details:"Проверка процесса рассмотрения жалобы.",status:"Новая",decisionComment:""},
      {id:102,title:"Худи oversize",seller:"sasha.jpg",reason:"Мошенничество",details:"Продавец не отвечает после договорённости.",status:"На проверке",decisionComment:""}
    ]);
    setReviews([{seller:"cloudboy",stars:5,text:"Быстрая сделка, всё соответствует описанию."}]);
    setDemoRole("Владелец"); setModerationComment(""); setReviewText("");
    localStorage.removeItem("marketplace-demo-state-v3"); flash("Локальные данные сброшены.");
  }

  const filtered = useMemo(() => ads.filter(a =>
    !a.sold &&
    (category === "Все" || a.category === category) &&
    (sub === "Все" || a.sub === sub) &&
    (a.title + " " + a.description + " " + a.seller).toLowerCase().includes(search.toLowerCase())
  ), [ads, category, sub, search]);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }
  function changeCategory(c: string) {
    setCategory(c); setSub("Все");
  }
  function toggleFavorite(id: number) {
    setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  }
  function createAd() {
    if (!newTitle.trim() || !newPhoto) { flash("Добавьте название и хотя бы одно фото."); return; }
    const ad: Ad = {
      id: Date.now(), title: newTitle, category: newCategory, sub: newSub,
      price: Number(newPrice) || 0, views: 0, seller: "you", emoji: "📦",
      tone: "lavender", description: newDescription || "Описание не добавлено.",
      photos: 1
    };
    setAds(old => [ad, ...old]); setShowCreate(false); setTab("Мои объявления");
    setNewTitle(""); setNewPrice(""); setNewDescription(""); setNewPhoto(false);
    flash("Объявление сохранено в этом браузере.");
  }
  function sendReport() {
    if (!reportText.trim()) { flash("Опишите причину жалобы."); return; }
    setReports(old => [{id:Date.now(), title:reportTarget.title, seller:reportTarget.seller, reason:reportReason, details:reportText, status:"Новая", decisionComment:""}, ...old]);
    setReportTarget(null); setReportText(""); setTab("Модерация"); flash("Жалоба сохранена в локальной очереди модерации.");
  }

  const banners = [
    { kicker: "MARKETPLACE · BUY / SELL / DISCOVER", title: "Находи своё.\nПродавай легко.", sub: "Товары, услуги и магазины — всё в одном месте.", color: "banner-purple" },
    { kicker: "NEW FINDS · ONE COMMUNITY", title: "Меньше поиска.\nБольше находок.", sub: "Открой каталог и найди то, что давно искал.", color: "banner-blue" },
    { kicker: "YOUR STORE · YOUR STYLE", title: "Запусти свою\nвитрину сегодня.", sub: "Собери товары и услуги в красивом профиле.", color: "banner-orange" },
  ];
  const currentBanner = banners[banner];

  useEffect(() => {
    const timer = window.setInterval(() => setBanner(current => (current + 1) % banners.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => { setTab("Главная"); setSelected(null); }} aria-label="На главную">
          <span className="brand-mark">M</span><span>Marketplace<span className="brand-dot">.</span></span>
        </button>
        <div className="side-label">МЕНЮ</div>
        {[
          { label: "Главная", icon: Search }, { label: "Магазины", icon: Store },
          { label: "Избранное", icon: Heart }, { label: "Личный кабинет", icon: UserRound },
          { label: "FAQ", icon: CircleHelp }, { label: "Модерация", icon: Sparkles },
        ].map(item => <button key={item.label} className={`nav-item ${tab === item.label ? "active" : ""}`} onClick={() => { setTab(item.label); setSelected(null); }}>
          <item.icon size={18}/><span>{item.label}</span>
          {item.label === "Избранное" && favorites.length > 0 && <span className="nav-count">{favorites.length}</span>}
        </button>)}
        <div className="side-bottom">
          <div className="user-mini"><div className="avatar avatar-purple">М</div><div><strong>@nukm0</strong><small>Владелец</small></div><ShieldCheck size={16} className="verified"/></div>
          <button className="nav-item admin-nav" onClick={() => { setTab("Админ-панель"); setSelected(null); }}><LayoutDashboard size={18}/><span>Админ-панель</span></button>
          <button className={`nav-item ${tab === "Модерация" ? "active" : ""}`} onClick={() => { setTab("Модерация"); setSelected(null); }}><Sparkles size={18}/><span>Модерация</span></button>
          <div className="side-foot">МАРКЕТПЛЕЙС <span>локальное хранение</span></div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">M</span> Marketplace<span className="brand-dot">.</span></div>
          <div className="breadcrumb">Marketplace <span>/</span> {selected ? "Объявление" : tab}</div>
          <div className="top-actions">
            <button className="icon-button notification-button" onClick={() => setShowNotifications(!showNotifications)} aria-label="Уведомления"><Bell size={19}/><i/></button>
            <button className="profile-pill" onClick={() => { setTab("Личный кабинет"); setSelected(null); }}><div className="avatar avatar-purple small-avatar">М</div><span>@nukm0</span><ChevronRight size={15}/></button>
          </div>
          {showNotifications && <div className="notification-pop"><div className="pop-title">Уведомления <span className="soft-tag">2 новых</span></div><div className="notification-line"><span className="notification-dot"/><div><b>Добро пожаловать в Marketplace</b><small>Рады видеть тебя в нашем сообществе.</small></div></div><div className="notification-line"><span className="notification-dot"/><div><b>Локальное хранение включено</b><small>Контакты продавцов открываются через Telegram.</small></div></div><button className="text-button" onClick={() => setShowNotifications(false)}>Закрыть</button></div>}
        </header>

        {selected ? (
          <div className="content detail-page">
            <button className="back-link" onClick={() => setSelected(null)}><ChevronLeft size={17}/> Назад к объявлениям</button>
            <div className="detail-grid">
              <div>
                <div className={`detail-photo ${selected.tone}`}><span>{selected.emoji}</span><div className="photo-count">▧ {selected.photos} фото</div><button className="photo-expand" onClick={() => flash("Просмотр фото — локальный режим.")}>⤢</button></div>
                <div className="thumb-row">{Array.from({length: selected.photos}, (_, i) => <button key={i} className={`thumb ${selected.tone}`} onClick={() => flash(`Фото ${i+1} из ${selected.photos}`)}>{selected.emoji}</button>)}</div>
              </div>
              <div className="detail-info">
                <div className="eyebrow">{selected.category} <span>·</span> {selected.sub}</div>
                <h1>{selected.title}</h1>
                <div className="detail-price">{money(selected.price)}</div>
                <div className="detail-meta"><span><Eye size={16}/> {selected.views} просмотров</span><button className={`favorite-button ${favorites.includes(selected.id) ? "liked" : ""}`} onClick={() => toggleFavorite(selected.id)}><Heart size={17} fill={favorites.includes(selected.id) ? "currentColor" : "none"}/> {favorites.includes(selected.id) ? "В избранном" : "В избранное"}</button></div>
                <div className="line"/>
                <h3>Описание</h3><p className="description">{selected.description}</p>
                <div className="line"/>
                <h3>Продавец</h3>
                <button className="seller-card" onClick={() => { setTab("Профиль продавца"); setSelected(null); }}><div className="avatar avatar-blue">{selected.seller[0].toUpperCase()}</div><div><strong>@{selected.seller}</strong><small>Профиль продавца · рейтинг 4.8 ★</small></div><ChevronRight size={18}/></button>
                <a className="primary-button full-button" href={`https://t.me/${selected.seller.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" onClick={(e) => { if (!selected.seller.trim()) { e.preventDefault(); flash("У продавца не указан Telegram username."); } }}><MessageCircle size={18}/> Написать продавцу</a>
                <button className="report-button full-button" onClick={() => setReportTarget(selected)}><Flag size={16}/> Пожаловаться на объявление</button>
                <p className="demo-note">Для связи откроется Telegram-профиль продавца.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="content">
            {tab === "Главная" && <>
              <div className={`hero ${currentBanner.color}`}>
                <div className="hero-copy"><span className="hero-kicker"><Sparkles size={13}/> {currentBanner.kicker}</span><h1>{currentBanner.title.split("\n").map((s,i)=><span key={i}>{s}<br/></span>)}</h1><p>{currentBanner.sub}</p><button className="hero-button" onClick={() => document.getElementById("listing")?.scrollIntoView({behavior:"smooth"})}>Смотреть объявления <ArrowUpRight size={16}/></button></div>
                <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-cube">М<span>.</span></div><div className="float-card float-one">✦ <b>Новые находки</b></div><div className="float-card float-two"><Heart size={14} fill="currentColor"/> Твоё избранное</div></div>
                <div className="banner-controls"><span>{String(banner+1).padStart(2,"0")} <i>/ 03</i></span><button onClick={() => setBanner((banner+2)%3)} aria-label="Предыдущий баннер"><ChevronLeft size={17}/></button><button onClick={() => setBanner((banner+1)%3)} aria-label="Следующий баннер"><ChevronRight size={17}/></button><div className="banner-progress"><span style={{width: `${(banner+1)*33.333}%`}}/></div></div>
              </div>
              <div className="section-heading"><div><span className="section-overline">ПОИСК ПО МАРКЕТПЛЕЙСУ</span><h2>Что будем искать?</h2></div><span className="result-count">Объявления рядом с тобой</span></div>
              <div className="search-row"><div className="search-field"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Название, категория или продавец..."/>{search && <button onClick={()=>setSearch("")}><X size={16}/></button>}</div><button className="filter-button" onClick={()=>flash("Фильтр по цене пока не настроен.")}><SlidersHorizontal size={17}/> Фильтры</button></div>
              <div className="category-row">{categories.map((c,i)=><button key={c} onClick={()=>changeCategory(c)} className={`category-chip ${category===c?"chosen":""}`}><span className="category-symbol">{["✳","☁","⌘","◈","↗"][i]}</span>{c}</button>)}</div>
              {category!=="Все" && <div className="subcategory-row"><button className={sub==="Все"?"sub-chip chosen-sub":"sub-chip"} onClick={()=>setSub("Все")}>Все</button>{(subcategories[category]||[]).map(s=><button key={s} className={sub===s?"sub-chip chosen-sub":"sub-chip"} onClick={()=>setSub(s)}>{s}</button>)}</div>}
              <div className="section-heading listing-heading" id="listing"><div><span className="section-overline">СВЕЖЕЕ НА ПЛОЩАДКЕ</span><h2>Лента объявлений <span className="heading-count">{filtered.length}</span></h2></div><button className="sort-button" onClick={()=>flash("Сортировка по новизне включена.")}>Сначала новые <ChevronRight size={15}/></button></div>
              <div className="ad-grid">{filtered.map(ad=><AdCard key={ad.id} ad={ad} liked={favorites.includes(ad.id)} onOpen={()=>{setSelected(ad);setAds(old=>old.map(x=>x.id===ad.id?{...x,views:x.views+1}:x));}} onLike={()=>toggleFavorite(ad.id)} onReport={()=>setReportTarget(ad)}/>)}</div>
              {filtered.length===0 && <div className="empty-state"><Search size={30}/><h3>Ничего не найдено</h3><p>Попробуй изменить запрос или категорию.</p><button className="secondary-button" onClick={()=>{setSearch("");changeCategory("Все")}}>Сбросить фильтры</button></div>}
              <div className="bottom-cta"><div className="cta-icon"><Plus size={22}/></div><div><h3>Есть что предложить?</h3><p>Опубликуй объявление и найди своего покупателя.</p></div><button className="primary-button" onClick={()=>setShowCreate(true)}><Plus size={17}/> Подать объявление</button></div>
            </>}

            {tab === "Личный кабинет" && <><PageTitle overline="ТВОЁ ПРОСТРАНСТВО" title="Личный кабинет" subtitle="Управляй объявлениями, избранным и своим профилем."/><div className="profile-banner"><div className="avatar avatar-purple profile-big">М</div><div className="profile-main"><div className="profile-name">@nukm0 <ShieldCheck size={17}/></div><p>Профиль · данные хранятся в этом браузере</p><span className="soft-tag">Владелец сайта</span></div><button className="secondary-button" onClick={()=>flash("Редактирование профиля подключим вместе с Telegram.")}><Pencil size={15}/> Изменить профиль</button></div><div className="stats-grid"><Stat icon={<Package/>} label="Мои объявления" value={ads.filter(a=>a.seller==="you").length.toString()}/><Stat icon={<Eye/>} label="Просмотры профиля" value="1 284"/><Stat icon={<Heart/>} label="В избранном" value={favorites.length.toString()}/></div><div className="section-heading"><div><span className="section-overline">УПРАВЛЕНИЕ</span><h2>Мои объявления</h2></div><button className="primary-button" onClick={()=>setShowCreate(true)}><Plus size={16}/> Добавить</button></div><div className="ad-grid">{ads.filter(a=>a.seller==="you").map(ad=><AdCard key={ad.id} ad={ad} liked={favorites.includes(ad.id)} onOpen={()=>setSelected(ad)} onLike={()=>toggleFavorite(ad.id)} onReport={()=>setReportTarget(ad)}/>)}</div><div className="settings-list"><button onClick={()=>setTab("Избранное")}><Heart/> Избранные объявления <ChevronRight/></button><button onClick={()=>flash("История удалённых объявлений появится после подключения базы данных.")}><RotateCcw/> История и удалённые объявления <ChevronRight/></button><button onClick={()=>flash("Открой приложение через Telegram, чтобы проверить доступ к профилю.")}><Settings2/> Настройки аккаунта <ChevronRight/></button></div></>}

            {tab === "Избранное" && <><PageTitle overline="СОХРАНЁННОЕ" title="Избранное" subtitle="Объявления, к которым хочется вернуться."/><div className="ad-grid">{ads.filter(a=>favorites.includes(a.id)).map(ad=><AdCard key={ad.id} ad={ad} liked={true} onOpen={()=>setSelected(ad)} onLike={()=>toggleFavorite(ad.id)} onReport={()=>setReportTarget(ad)}/>)}</div>{favorites.length===0&&<div className="empty-state"><Heart size={30}/><h3>Пока ничего нет</h3><p>Нажми на сердечко в понравившемся объявлении.</p></div>}</>}

            {tab === "Магазины" && <><PageTitle overline="ВИТРИНЫ СООБЩЕСТВА" title="Магазины" subtitle="Подборка магазинов и продавцов Marketplace."/><div className="shop-feature"><div className="shop-emblem">M</div><div className="shop-info"><span className="section-overline">РЕКОМЕНДУЕМ</span><h2>{shopName} <ShieldCheck size={17}/></h2><p>Подборка товаров и услуг. Официальная витрина сообщества.</p><span className="soft-tag">Проверенный магазин</span></div><button className="primary-button" onClick={()=>{setTab("Витрина магазина");flash("Открыта демо-витрина магазина.")}}>Открыть магазин <ArrowUpRight size={16}/></button></div><div className="shop-list">{["Realox shop","ЯБЛОШОП","Mide shop"].map((s,i)=><button className="shop-row" key={s} onClick={()=>{setShopName(s);setTab("Витрина магазина")}}><div className={`shop-small shop-${i}`}>{s[0]}</div><div><strong>{s}</strong><small>{[12,8,6][i]} товаров · Проверенный магазин</small></div><ShieldCheck size={16} className="verified"/><ChevronRight size={17}/></button>)}</div></>}

            {tab === "Витрина магазина" && <><button className="back-link" onClick={()=>setTab("Магазины")}><ChevronLeft size={17}/> Все магазины</button><div className="shop-cover"><div className="shop-emblem">M</div><div><span className="soft-tag">Проверенный магазин</span><h1>{shopName}</h1><p>Товары и услуги от команды магазина.</p></div></div><div className="section-heading"><div><span className="section-overline">КАТАЛОГ</span><h2>Товары магазина</h2></div></div><div className="ad-grid">{ads.slice(0,3).map(ad=><AdCard key={ad.id} ad={ad} liked={favorites.includes(ad.id)} onOpen={()=>setSelected(ad)} onLike={()=>toggleFavorite(ad.id)} onReport={()=>setReportTarget(ad)}/>)}</div></>}

            {tab === "FAQ" && <><PageTitle overline="ПОМОЩЬ И ПОДДЕРЖКА" title="Как пользоваться Marketplace?" subtitle="Коротко о главном — от поиска до безопасной сделки."/><div className="faq-list">{[{q:"Как найти нужный товар?",a:"Используй поиск по названию и переключай категории. Открой карточку, чтобы посмотреть описание и профиль продавца."},{q:"Как разместить объявление?",a:"Зайди в личный кабинет, нажми «Добавить объявление», укажи название, категорию, цену и добавь от 1 до 3 фотографий."},{q:"Как связаться с продавцом?",a:"Открой объявление и нажми «Написать продавцу». Сообщение будет содержать название и цену товара, чтобы продавец понял, о чём речь."},{q:"Как пожаловаться?",a:"Нажми на флаг в карточке или на странице объявления. Выбери причину и подробно опиши ситуацию. Жалобы проверяет команда модерации."},{q:"Что такое проверенный магазин?",a:"Это витрина, созданная владельцем площадки и закреплённая за определённым продавцом."}].map((f,i)=><details className="faq-item" key={f.q} open={i===0}><summary><span className="faq-number">0{i+1}</span>{f.q}<ChevronRight size={17}/></summary><p>{f.a}</p></details>)}</div><div className="owner-cta"><div className="cta-icon"><MessageCircle/></div><div><h3>Есть идея или нашли ошибку?</h3><p>Хочешь сотрудничать, нашёл баг или есть другой вопрос — напиши владельцу.</p></div><button className="primary-button" onClick={()=>flash("Здесь будет ссылка на Telegram владельца @nukm0.")}>Написать владельцу <ArrowUpRight size={16}/></button></div></>}

            {tab === "Админ-панель" && <><PageTitle overline="УПРАВЛЕНИЕ ПЛОЩАДКОЙ" title="Админ-панель" subtitle="Центр управления Marketplace. Изменения действуют только в этом браузере."/><div className="admin-alert"><ShieldCheck size={18}/><div><b>Режим владельца</b><span>Локальный профиль: @nukm0 · настройки доступны в этом браузере.</span></div><span className="soft-tag">OWNER</span></div><div className="admin-tiles">{[{name:"Участники сайта",desc:"Профили, поиск и блокировки",icon:Users,num:"1 284"},{name:"Статистика жалоб",desc:"Входящие и история проверок",icon:Flag,num:"12"},{name:"Статистика сайта",desc:"Объявления, просмотры, регистрации",icon:ChartNoAxesCombined,num:"Обзор"},{name:"Модерация",desc:"Роли, права и команда",icon:ShieldCheck,num:"8"},{name:"Реклама",desc:"Баннеры, закрепления, рассылки",icon:Megaphone,num:"3"}].map((t,i)=><button key={t.name} className={`admin-tile ${adminPage===t.name?"tile-active":""}`} onClick={()=>setAdminPage(t.name)}><div className={`tile-icon tile-${i}`}><t.icon size={21}/></div><strong>{t.name}</strong><span>{t.desc}</span><div className="tile-bottom"><small>{t.num}</small><ArrowUpRight size={16}/></div></button>)}</div><div className="admin-content"><div className="section-heading"><div><span className="section-overline">РАЗДЕЛ АДМИНИСТРИРОВАНИЯ</span><h2>{adminPage}</h2></div><span className="soft-tag">Демо-данные</span></div>{adminPage==="Участники сайта"?<div className="table-wrap"><table><thead><tr><th>Пользователь</th><th>ID</th><th>Статус</th><th>Роль</th><th></th></tr></thead><tbody>{[["@nukm0","10001","Активен","Владелец"],["@cloudboy","10002","Активен","Участник"],["@mike.wav","10003","Забанен","Участник"]].map(u=><tr key={u[0]}><td><b>{u[0]}</b></td><td>{u[1]}</td><td><span className={u[2]==="Забанен"?"status-banned":"status-active"}>{u[2]}</span></td><td>{u[3]}</td><td><button className="dots-button" onClick={()=>flash("Управление баном и ролями будет подключено к серверу.")}><MoreHorizontal/></button></td></tr>)}</tbody></table></div>:adminPage==="Статистика жалоб"?<div className="report-list">{[["Мошенничество","@cloudboy","Новое"],["Не та категория","@mike.wav","На проверке"],["Мультиаккаунт","@guest_23","Новое"]].map((r,i)=><button className="report-row" key={r[0]} onClick={()=>flash("Детали жалобы, доказательства и решение модератора — следующий этап.")}><div className="report-flag"><Flag size={17}/></div><div><b>{r[0]}</b><small>Жалоба от {r[1]}</small></div><span className="soft-tag">{r[2]}</span><ChevronRight size={16}/></button>)}</div>:adminPage==="Статистика сайта"?<div className="stats-grid admin-stats"><Stat icon={<Package/>} label="Объявлений создано" value="2 846"/><Stat icon={<Eye/>} label="Просмотры за период" value="48.2K"/><Stat icon={<Users/>} label="Участников" value="1 284"/><Stat icon={<Flag/>} label="Жалоб проверено" value="96"/></div>:adminPage==="Модерация"?<div className="permission-box"><h3>Роли и права</h3>{[["Стажёр","Просмотр жалоб, подготовка черновика решения, без права выдавать наказания."],["Модератор","Проверка жалоб и предложение санкций с обязательным комментарием; решения ждут подтверждения владельца."],["Администратор","Управление объявлениями и участниками, обработка жалоб; санкции только после одобрения владельца."],["Заместитель владельца","Расширенные права владельца. Назначить или снять может только владелец."]].map(r=><div className="permission-row" key={r[0]}><div><b>{r[0]}</b><p>{r[1]}</p></div><button className="secondary-button compact" onClick={()=>flash("Назначение ролей будет защищено серверными правами.")}>Настроить</button></div>)}</div>:<div className="permission-box"><h3>Рекламные интеграции</h3><p>Создавать баннеры, закреплять объявления и запускать уведомления может только владелец. Все кампании должны проходить финальное подтверждение владельца перед публикацией.</p><div className="action-row"><button className="primary-button" onClick={()=>flash("Откроется редактор баннера: изображение и ссылка.")}><Plus size={16}/> Создать баннер</button><button className="secondary-button" onClick={()=>flash("Настройка закрепления объявления.")}>Закрепить объявление</button><button className="secondary-button" onClick={()=>flash("Рассылка всем пользователям требует подтверждения владельца.")}>Уведомление всем</button></div></div>}</div></>}

            {tab === "Модерация" && <><PageTitle overline="PLAYGROUND / QA" title="Центр тестирования" subtitle="Проверяй пользовательские сценарии. Данные хранятся локально в этом браузере и не отправляются на сервер."/><div className="admin-alert"><Sparkles size={18}/><div><b>Локальное хранение активно</b><span>Объявления, избранное, жалобы, отзывы и выбранная роль сохраняются после обновления страницы на этом устройстве.</span></div><span className="soft-tag">LOCAL</span></div><div className="stats-grid"><Stat icon={<Package/>} label="Объявлений" value={String(ads.length)}/><Stat icon={<Heart/>} label="В избранном" value={String(favorites.length)}/><Stat icon={<Flag/>} label="Жалоб в очереди" value={String(reports.length)}/><Stat icon={<MessageCircle/>} label="Отзывов" value={String(reviews.length)}/></div><div className="permission-box"><h3>Сценарий 1 · Объявление и избранное</h3><p>Перейди на главную, найди объявление через поиск, открой карточку, добавь в избранное. Создай объявление из личного кабинета и обнови страницу — демо-состояние должно сохраниться.</p><div className="action-row"><button className="primary-button" onClick={()=>{setTab("Главная");setSelected(null)}}><Search size={16}/> Проверить каталог</button><button className="secondary-button" onClick={()=>{setTab("Личный кабинет");setShowCreate(true)}}><Plus size={16}/> Создать объявление</button><button className="secondary-button" onClick={()=>setTab("Избранное")}><Heart size={16}/> Избранное</button></div></div><div className="permission-box"><h3>Сценарий 2 · Роли и модерация</h3><p>Переключение ниже имитирует роли интерфейса. Это не система безопасности: в production права должны проверяться на сервере.</p><div className="form-field"><label>Текущая тестовая роль</label><select value={demoRole} onChange={e=>setDemoRole(e.target.value)}>{["Участник","Стажёр","Модератор","Администратор","Заместитель владельца","Владелец","Магазин"].map(r=><option key={r}>{r}</option>)}</select></div><div className="form-field"><label>Комментарий модератора (обязателен)</label><textarea rows={2} value={moderationComment} onChange={e=>setModerationComment(e.target.value)} placeholder="Например: проверены описание и категория объявления"/></div><div className="report-list">{reports.map(r=><div className="report-row" key={r.id}><div className="report-flag"><Flag size={17}/></div><div style={{flex:1}}><b>{r.reason} · {r.title}</b><small>@{r.seller} — {r.details}</small><small>Статус: {r.status}{r.decisionComment ? ` · Комментарий: ${r.decisionComment}` : ""}</small></div><span className="soft-tag">{r.status}</span><div className="action-row"><button className="secondary-button compact" onClick={()=>{if(!moderationComment.trim()){flash("Сначала добавь обязательный комментарий.");return;} setReports(old=>old.map(x=>x.id===r.id?{...x,status:"Ожидает владельца",decisionComment:moderationComment}:x));setModerationComment("");flash("Решение модератора отправлено владельцу.")}}>На одобрение</button><button className="primary-button compact" onClick={()=>{if(demoRole!=="Владелец"){flash("Подтвердить решение может только тестовая роль «Владелец».");return;} if(!r.decisionComment){flash("Сначала модератор должен оставить комментарий.");return;} setReports(old=>old.map(x=>x.id===r.id?{...x,status:"Одобрено владельцем"}:x));flash("Решение подтверждено владельцем.")}}>Одобрить</button></div></div>)}</div></div><div className="permission-box"><h3>Сценарий 3 · Отзывы продавцам</h3><p>Добавь отзыв и проверь, что он остаётся после обновления страницы.</p><div className="form-field"><label>Оценка</label><select value={reviewStars} onChange={e=>setReviewStars(Number(e.target.value))}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} из 5 звёзд</option>)}</select></div><div className="form-field"><label>Текст отзыва</label><textarea rows={2} value={reviewText} onChange={e=>setReviewText(e.target.value)} placeholder="Опиши свой опыт"/></div><button className="primary-button" onClick={()=>{if(!reviewText.trim()){flash("Добавь текст отзыва.");return;}setReviews(old=>[{seller:"cloudboy",stars:reviewStars,text:reviewText.trim()},...old]);setReviewText("");flash("Отзыв сохранён локально.")}}><Send size={16}/> Добавить отзыв</button><div className="review-demo-list">{reviews.map((r,i)=><div className="permission-row" key={i}><div><b>@{r.seller} · {"★".repeat(r.stars)}{"☆".repeat(5-r.stars)}</b><p>{r.text}</p></div></div>)}</div></div><div className="permission-box"><h3>Сценарий 4 · Магазины и FAQ</h3><p>Проверь каталог магазинов, открытие витрины, FAQ, адаптивную нижнюю навигацию и баннерный слайдер.</p><div className="action-row"><button className="secondary-button" onClick={()=>setTab("Магазины")}><Store size={16}/> Магазины</button><button className="secondary-button" onClick={()=>setTab("FAQ")}><CircleHelp size={16}/> FAQ</button><button className="secondary-button" onClick={()=>setTab("Админ-панель")}><LayoutDashboard size={16}/> Админка</button></div></div><div className="permission-box danger-zone"><h3>Сброс демо-данных</h3><p>Удалит локальные изменения и вернёт тестовые объявления, жалобы, избранное и отзывы к исходному состоянию.</p><button className="danger-button" onClick={()=>{if(window.confirm("Сбросить все локальные локальные данные?"))resetDemo()}}><RotateCcw size={16}/> Сбросить локальные данные</button></div></>}

            {tab === "Профиль продавца" && <><PageTitle overline="ПРОФИЛЬ УЧАСТНИКА" title="@cloudboy" subtitle="Профиль продавца · на площадке с сентября 2026."/><div className="profile-banner"><div className="avatar avatar-blue profile-big">C</div><div className="profile-main"><div className="profile-name">@cloudboy</div><p>Продавец сообщества</p><div className="rating-line">★★★★★ <b>4.8</b> <span>(24 оценки)</span></div></div><button className="primary-button" onClick={()=>flash("Откроется Telegram продавца после подключения аккаунтов.")}><Send size={16}/> Связаться</button></div><div className="stats-grid"><Stat icon={<Eye/>} label="Просмотры профиля" value="842"/><Stat icon={<Package/>} label="Активные объявления" value="4"/><Stat icon={<CheckCircle2/>} label="Оценка продавца" value="4.8/5"/></div><div className="section-heading"><div><span className="section-overline">ОТЗЫВЫ ПОКУПАТЕЛЕЙ</span><h2>Оценить продавца</h2></div></div><div className="rating-form"><p>Как прошла ваша сделка?</p><div className="stars">{"★ ★ ★ ★ ★".split(" ").map((s,i)=><button key={i} onClick={()=>flash(`Вы выбрали ${i+1} из 5 звёзд.`)}>{s}</button>)}</div><textarea placeholder="Расскажи о своём опыте (необязательно)"/><button className="primary-button" onClick={()=>flash("Оценка сохранится после подключения базы данных.")}>Отправить оценку</button></div><div className="section-heading"><div><span className="section-overline">В ПРОДАЖЕ</span><h2>Объявления продавца</h2></div></div><div className="ad-grid">{ads.filter(a=>a.seller==="cloudboy").map(ad=><AdCard key={ad.id} ad={ad} liked={favorites.includes(ad.id)} onOpen={()=>setSelected(ad)} onLike={()=>toggleFavorite(ad.id)} onReport={()=>setReportTarget(ad)}/>)}</div></>}

            {tab !== "Главная" && !["Личный кабинет","Избранное","Магазины","Витрина магазина","FAQ","Админ-панель","Профиль продавца","Модерация"].includes(tab) && <div className="empty-state"><h3>{tab}</h3><p>Раздел будет добавлен в следующем этапе разработки.</p><button className="secondary-button" onClick={()=>setTab("Главная")}>На главную</button></div>}
          </div>
        )}
        <footer className="footer"><span>© 2026 MARKETPLACE</span><span>Создано для сообщества <b>✳</b></span><button onClick={()=>setTab("FAQ")}>Помощь</button></footer>
      </section>

      <nav className="mobile-nav">{[{label:"Главная",icon:Search},{label:"Магазины",icon:Store},{label:"Избранное",icon:Heart},{label:"Личный кабинет",icon:UserRound},{label:"FAQ",icon:CircleHelp}].map(it=><button key={it.label} className={tab===it.label?"mobile-active":""} onClick={()=>{setTab(it.label);setSelected(null)}}><it.icon size={19}/><span>{it.label==="Личный кабинет"?"Профиль":it.label}</span></button>)}</nav>

      {showCreate && <div className="modal-backdrop" onClick={()=>setShowCreate(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="section-overline">НОВАЯ ПУБЛИКАЦИЯ</span><h2>Создать объявление</h2></div><button className="icon-button" onClick={()=>setShowCreate(false)}><X size={18}/></button></div><div className="form-field"><label>Название объявления *</label><input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Например, наушники в отличном состоянии"/></div><div className="form-two"><div className="form-field"><label>Категория *</label><select value={newCategory} onChange={e=>{setNewCategory(e.target.value);setNewSub(subcategories[e.target.value]?.[0]||"Б/у")}}>{categories.filter(c=>c!=="Все").map(c=><option key={c}>{c}</option>)}</select></div><div className="form-field"><label>Подкатегория *</label><select value={newSub} onChange={e=>setNewSub(e.target.value)}>{(subcategories[newCategory]||["Б/у"]).map(s=><option key={s}>{s}</option>)}</select></div></div><div className="form-field"><label>Описание <span>(необязательно)</span></label><textarea value={newDescription} onChange={e=>setNewDescription(e.target.value)} placeholder="Расскажи подробнее о товаре..." rows={3}/></div><div className="form-field"><label>Цена, ₽</label><input type="number" min="0" value={newPrice} onChange={e=>setNewPrice(e.target.value)} placeholder="0 — договорная"/></div><div className="form-field"><label>Фотографии * <span>(от 1 до 3)</span></label><button className={`upload-box ${newPhoto?"upload-done":""}`} onClick={()=>setNewPhoto(!newPhoto)}>{newPhoto?<><CheckCircle2 size={21}/> Фото добавлено (демо)</>:<><Plus size={22}/><b>Добавить фото</b><small>Нажми для имитации загрузки</small></>}</button></div><div className="modal-actions"><button className="secondary-button" onClick={()=>setShowCreate(false)}>Отмена</button><button className="primary-button" onClick={createAd}><Plus size={16}/> Опубликовать</button></div><p className="form-hint">Прототип: фотография имитируется. Реальная загрузка появится после подключения хранилища.</p></div></div>}

      {reportTarget && <div className="modal-backdrop" onClick={()=>setReportTarget(null)}><div className="modal report-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="section-overline">БЕЗОПАСНОСТЬ СООБЩЕСТВА</span><h2>Пожаловаться</h2></div><button className="icon-button" onClick={()=>setReportTarget(null)}><X size={18}/></button></div><div className="reported-item"><div className={`reported-emoji ${reportTarget.tone}`}>{reportTarget.emoji}</div><div><b>{reportTarget.title}</b><small>{money(reportTarget.price)} · @{reportTarget.seller}</small></div></div><div className="form-field"><label>Причина жалобы *</label><select value={reportReason} onChange={e=>setReportReason(e.target.value)}><option>Не та категория</option><option>Мошенничество</option><option>Мультиаккаунт</option><option>Другое нарушение</option></select></div><div className="form-field"><label>Опиши ситуацию *</label><textarea rows={4} value={reportText} onChange={e=>setReportText(e.target.value)} placeholder="Что произошло? Добавь подробности..."/></div><div className="modal-actions"><button className="secondary-button" onClick={()=>setReportTarget(null)}>Отмена</button><button className="primary-button" onClick={sendReport}><Flag size={16}/> Отправить жалобу</button></div></div></div>}
      {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}</div>}
    </main>
  );
}

function PageTitle({overline,title,subtitle}:{overline:string,title:string,subtitle:string}) {
  return <div className="page-title"><span className="section-overline">{overline}</span><h1>{title}</h1><p>{subtitle}</p></div>;
}
function Stat({icon,label,value}:{icon:React.ReactNode,label:string,value:string}) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>;
}
function AdCard({ad,liked,onOpen,onLike,onReport}:{ad:Ad,liked:boolean,onOpen:()=>void,onLike:()=>void,onReport:()=>void}) {
  return <article className="ad-card"><button className={`ad-art ${ad.tone}`} onClick={onOpen} aria-label={`Открыть ${ad.title}`}><span>{ad.emoji}</span><span className="art-tag">{ad.category}</span><span className="art-view"><Eye size={13}/>{ad.views}</span></button><div className="ad-card-body"><div className="ad-card-top"><span className="ad-sub">{ad.sub}</span><button className={`heart-button ${liked?"liked":""}`} onClick={onLike} aria-label="В избранное"><Heart size={17} fill={liked?"currentColor":"none"}/></button></div><button className="ad-title" onClick={onOpen}>{ad.title}</button><div className="ad-price">{ad.price===0?"Договорная":money(ad.price)}</div><div className="ad-card-bottom"><button className="seller-link" onClick={onOpen}><span className="seller-dot">{ad.seller[0].toUpperCase()}</span>@{ad.seller}</button><button className="report-mini" onClick={onReport} aria-label="Пожаловаться"><Flag size={14}/></button></div><button className="contact-button" onClick={onOpen}><MessageCircle size={15}/> Написать продавцу</button></div></article>;
}
