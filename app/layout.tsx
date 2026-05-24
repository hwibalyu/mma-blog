import type { Metadata } from "next";
import HeaderSearch from "@/components/header-search";
import Link from "next/link";
import { Suspense } from "react";
import GoogleAnalytics from "@/components/google-analytics";
import { absoluteUrl, DEFAULT_SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "MMA",
    "UFC",
    "종합격투기",
    "한국 MMA",
    "격투기 분석",
    "UFC 뉴스",
  ],
  alternates: {
    canonical: "/",
  },
  category: "sports",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: SITE_NAME,
    siteName: SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: DEFAULT_SITE_DESCRIPTION,
    inLanguage: "ko-KR",
  };

  return (
    <html lang="ko" className="antialiased">
      <body className="font-sans min-h-screen flex flex-col selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black word-break-keep-all">
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <header className="w-full border-b border-black/10 dark:border-white/10 py-6 px-4 md:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-black tracking-tighter uppercase hover:text-accent transition-colors">
              The MMA Journal
            </Link>
            <div className="flex items-center gap-3">
              <nav className="hidden md:flex gap-6 text-sm font-bold tracking-wide text-black/60 dark:text-white/60">
                <Link href="/category/column" className="hover:text-black dark:hover:text-white transition-colors">컬럼</Link>
                <Link href="/category/global-news" className="hover:text-black dark:hover:text-white transition-colors">해외컬럼/뉴스</Link>
                <Link href="/category/match-analysis" className="hover:text-black dark:hover:text-white transition-colors">매치분석</Link>
              </nav>
              <Suspense fallback={null}>
                <HeaderSearch />
              </Suspense>
            </div>
          </div>
        </header>
        <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </main>
        <footer className="w-full py-8 text-center text-sm font-medium text-black/40 dark:text-white/40 uppercase tracking-widest">
          © {new Date().getFullYear()} THE MMA JOURNAL
        </footer>
      </body>
    </html>
  );
}
