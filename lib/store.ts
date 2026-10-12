"use client";

import { useEffect, useState } from "react";

/* ============================================================
   ТИПЫ
============================================================ */
export type Role =
  | "Участник"
  | "Стажёр"
  | "Модератор"
  | "Администратор"
  | "Заместитель владельца"
  | "Владелец";

export const ALL_ROLES: Role[] = [
  "Участник",
  "Стажёр",
  "Модератор",
  "Администратор",
  "Заместитель владельца",
  "Владелец",
];

export type ReportStatus =
  | "Новая"
  | "На проверке"
  | "Ожидает владельца"
  | "Одобрено владельцем"
  | "Отклонено";

export type User = {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  banned: boolean;
  banReason: string;
  joined: string;
};

export type Ad = {
  id: string;
  title: string;
  category: string;
  sub: string;
  price: number;
  description: string;
  seller: string;
  photoIds: string[];
  views: number;
  createdAt: string;
  sold: boolean;
  approved: boolean;
  shopId: string | null;
};

export type Report = {
  id: string;
  adId: string | null;
  targetUser: string | null;
  reason: string;
  details: string;
  status: ReportStatus;
  reporter: string;
  createdAt: string;
  decision: string;
  decisionBy: string;
};

export type Review = {
  id: string;
  seller: string;
  author: string;
  stars: number;
  text: string;
  createdAt: string;
};

export type Banner = {
  id: string;
  kicker: string;
  title: string;
  sub: string;
  color: "banner-purple" | "banner-blue" | "banner-orange";
  link: string;
  active: boolean;
  order: number;
};

export type Shop = {
  id: string;
  name: string;
  owner: string;
  verified: boolean;
  description: string;
  createdAt: string;
};

export type LogEntry = {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  reason: string;
  result: string;
};

export type Favorite = { userId: string; adId: string };

export type Store = {
  version: number;
  users: User[];
  ads: Ad[];
  reports: Report[];
  reviews: Review[];
  banners: Banner[];
  shops: Shop[];
  logs: LogEntry[];
  favorites: Favorite[];
  currentUserId: string;
};

/* ============================================================
   КОНСТАНТЫ
============================================================ */
const LS_KEY = "marketplace-store-v4";
const PHOTO_DB = "marketplace-photos";
const PHOTO_STORE = "photos";
export const CURRENT_USER_ID = "u-owner";

/* ============================================================
   ID / ДАТА
============================================================ */
export const uid = (p = "id") =>
  `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const nowISO = () => new Date().toISOString();
export const fmtDT = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

/* ============================================================
   НАЧАЛЬНЫЕ ДАННЫЕ (seed)
============================================================ */
function seed(): Store {
  const users: User[] = [
    { id: "u-owner", username: "nukm0", displayName: "Владелец", role: "Владелец", banned: false, banReason: "", joined: nowISO() },
    { id: "u-cloudboy", username: "cloudboy", displayName: "Cloud Boy", role: "Участник", banned: false, banReason: "", joined: nowISO() },
    { id: "u-mike", username: "mike.wav", displayName: "Mike Wav", role: "Участник", banned: false, banReason: "", joined: nowISO() },
    { id: "u-sasha", username: "sasha.jpg", displayName: "Sasha", role: "Участник", banned: false, banReason: "", joined: nowISO() },
    { id: "u-bytefix", username: "bytefix", displayName: "ByteFix", role: "Модератор", banned: false, banReason: "", joined: nowISO() },
  ];

  const shops: Shop[] = [
    { id: "s-mide", name: "Mide shop", owner: "nukm0", verified: true, description: "Официальная витрина сообщества.", createdAt: nowISO() },
    { id: "s-realox", name: "Realox shop", owner: "cloudboy", verified: true, description: "Проверенный магазин техники.", createdAt: nowISO() },
    { id: "s-yabl", name: "ЯБЛОШОП", owner: "mike.wav", verified: false, description: "Гаджеты и аксессуары.", createdAt: nowISO() },
  ];

  const banners: Banner[] = [
    { id: "b-1", kicker: "MARKETPLACE · BUY / SELL / DISCOVER", title: "Находи своё.\nПродавай легко.", sub: "Товары, услуги и магазины — всё в одном месте.", color: "banner-purple", link: "#listing", active: true, order: 1 },
    { id: "b-2", kicker: "NEW FINDS · ONE COMMUNITY", title: "Меньше поиска.\nБольше находок.", sub: "Открой каталог и найди то, что давно искал.", color: "banner-blue", link: "#listing", active: true, order: 2 },
    { id: "b-3", kicker: "YOUR STORE · YOUR STYLE", title: "Запусти свою\nвитрину сегодня.", sub: "Собери товары и услуги в красивом профиле.", color: "banner-orange", link: "#listing", active: true, order: 3 },
  ];

  const ads: Ad[] = [
    { id: "a-1", title: "Vape kit — почти новый", category: "Vape", sub: "Подики", price: 3500, description: "Состояние отличное, использовался аккуратно.", seller: "cloudboy", photoIds: [], views: 248, createdAt: nowISO(), sold: false, approved: true, shopId: "s-realox" },
    { id: "a-2", title: "Наушники Studio Pro", category: "Техника", sub: "Б/у", price: 6200, description: "Отличный звук, всё работает.", seller: "mike.wav", photoIds: [], views: 186, createdAt: nowISO(), sold: false, approved: true, shopId: null },
    { id: "a-3", title: "Худи oversize", category: "Одежда", sub: "Новое", price: 2400, description: "Размер M/L, плотный материал.", seller: "sasha.jpg", photoIds: [], views: 91, createdAt: nowISO(), sold: false, approved: true, shopId: null },
    { id: "a-4", title: "Помощь с настройкой ПК", category: "Услуги", sub: "Предоставление услуги", price: 1500, description: "Сборка, настройка, оптимизация.", seller: "bytefix", photoIds: [], views: 320, createdAt: nowISO(), sold: false, approved: true, shopId: null },
    { id: "a-5", title: "Клавиатура механическая", category: "Техника", sub: "Б/у", price: 4100, description: "Механика, исправна полностью.", seller: "cloudboy", photoIds: [], views: 74, createdAt: nowISO(), sold: false, approved: true, shopId: "s-realox" },
  ];

  const reports: Report[] = [
    { id: "r-1", adId: "a-2", targetUser: "mike.wav", reason: "Не та категория", details: "Объявление не в той категории.", status: "Новая", reporter: "cloudboy", createdAt: nowISO(), decision: "", decisionBy: "" },
  ];

  const reviews: Review[] = [
    { id: "rev-1", seller: "cloudboy", author: "sasha.jpg", stars: 5, text: "Быстрая сделка, всё соответствует описанию.", createdAt: nowISO() },
  ];

  const logs: LogEntry[] = [
    { id: uid("log"), ts: nowISO(), actor: "system", action: "init", target: "store", reason: "Первичная инициализация", result: "OK" },
  ];

  return {
    version: 4,
    users,
    ads,
    reports,
    reviews,
    banners,
    shops,
    logs,
    favorites: [],
    currentUserId: CURRENT_USER_ID,
  };
}

/* ============================================================
   LOCALSTORAGE
============================================================ */
export function loadStore(): Store {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(LS_KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as Store;
    // Простая миграция
    if (!parsed.version || parsed.version < 4) {
      const s = seed();
      window.localStorage.setItem(LS_KEY, JSON.stringify(s));
      return s;
    }
    return parsed;
  } catch {
    return seed();
  }
}

export function saveStore(s: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch (e) {
    console.error("Не удалось сохранить store", e);
  }
}

export function resetStore(): Store {
  const s = seed();
  saveStore(s);
  return s;
}

/* ============================================================
   INDEXEDDB — фотографии
============================================================ */
function openPhotoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PHOTO_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putPhoto(id: string, blob: Blob): Promise<void> {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    tx.objectStore(PHOTO_STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPhoto(id: string): Promise<Blob | undefined> {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readonly");
    const req = tx.objectStore(PHOTO_STORE).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function delPhoto(id: string): Promise<void> {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    tx.objectStore(PHOTO_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ============================================================
   ХУК: URL фото из IndexedDB
============================================================ */
export function usePhotoUrl(photoId: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!photoId) { setUrl(null); return; }
    let objectUrl = "";
    let cancelled = false;
    (async () => {
      try {
        const blob = await getPhoto(photoId);
        if (blob && !cancelled) {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      } catch { /* no-op */ }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoId]);
  return url;
}

/* ============================================================
   ХУК: главный стор приложения
============================================================ */
export function useStore() {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => { setStore(loadStore()); }, []);

  const commit = (next: Store) => {
    saveStore(next);
    setStore(next);
  };

  const update = (mutator: (draft: Store) => Store) => {
    setStore((prev) => {
      if (!prev) return prev;
      const next = mutator({ ...prev });
      saveStore(next);
      return next;
    });
  };

  const log = (
    draft: Store,
    actor: string,
    action: string,
    target: string,
    reason: string,
    result: string
  ): Store => {
    const entry: LogEntry = {
      id: uid("log"),
      ts: nowISO(),
      actor,
      action,
      target,
      reason,
      result,
    };
    return { ...draft, logs: [entry, ...draft.logs].slice(0, 500) };
  };

  return { store, commit, update, log };
}

/* ============================================================
   ХЕЛПЕРЫ
============================================================ */
export const money = (n: number) =>
  n === 0 ? "Договорная" : n.toLocaleString("ru-RU") + " ₽";

export const findUser = (store: Store, username: string) =>
  store.users.find((u) => u.username === username);

export const canModerate = (role: Role) =>
  ["Модератор", "Администратор", "Заместитель владельца", "Владелец"].includes(role);

export const canAdmin = (role: Role) =>
  ["Администратор", "Заместитель владельца", "Владелец"].includes(role);

export const canOwner = (role: Role) =>
  ["Заместитель владельца", "Владелец"].includes(role);

export const ratingOf = (store: Store, username: string) => {
  const list = store.reviews.filter((r) => r.seller === username);
  if (!list.length) return { avg: 0, count: 0 };
  const sum = list.reduce((s, r) => s + r.stars, 0);
  return { avg: sum / list.length, count: list.length };
};
