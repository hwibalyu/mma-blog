import { absoluteUrl } from "@/lib/seo";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type GtagCommand = "config" | "event" | "js";

type GtagEventParams = {
  page_location?: string;
  page_path?: string;
  page_title?: string;
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (command: GtagCommand, target: string | Date, params?: GtagEventParams) => void;
  }
}

export function pageview(path: string) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_location: absoluteUrl(path),
    page_path: path,
    page_title: document.title,
  });
}

export function event(action: string, params?: GtagEventParams) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", action, params);
}
