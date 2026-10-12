"use client";

import { useEffect } from "react";

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
  initData?: string;
  initDataUnsafe?: { user?: { id: number; first_name?: string; username?: string; photo_url?: string } };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export default function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;

    // Expand the Mini App to the available Telegram viewport and notify Telegram that UI is ready.
    webApp.ready();
    webApp.expand();
    webApp.setHeaderColor?.("#0a0b16");
    webApp.setBackgroundColor?.("#0a0b16");
    webApp.disableVerticalSwipes?.();

    document.documentElement.dataset.telegram = "true";
    document.documentElement.dataset.telegramTheme = webApp.colorScheme ?? "light";
  }, []);

  return <>{children}</>;
}
