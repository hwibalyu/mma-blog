import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-serif-kr",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "THE MMA JOURNAL",
  description: "미니멀리스트 MMA 블로그",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${notoSerifKr.variable} antialiased`}
    >
      <body className="font-sans min-h-screen flex flex-col selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black word-break-keep-all">
        <header className="w-full border-b border-black/10 dark:border-white/10 py-6 px-4 md:px-8">
          <div className="max-w-4xl mx-auto flex items-baseline justify-between">
            <Link href="/" className="text-2xl font-black tracking-tighter uppercase hover:text-accent transition-colors">
              The MMA Journal
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-bold tracking-wide text-black/60 dark:text-white/60">
              <Link href="/category/column" className="hover:text-black dark:hover:text-white transition-colors">컬럼</Link>
              <Link href="/category/global-news" className="hover:text-black dark:hover:text-white transition-colors">해외컬럼/뉴스</Link>
              <Link href="/category/match-analysis" className="hover:text-black dark:hover:text-white transition-colors">매치분석</Link>
            </nav>
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
