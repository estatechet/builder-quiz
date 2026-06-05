import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import InstallButton from "@/components/InstallButton";

export const metadata: Metadata = {
  title: "시공사 브랜드 퀴즈",
  description: "대한민국 도급순위 100위권 시공사 브랜드 학습",
  applicationName: "시공사 브랜드 퀴즈",
  appleWebApp: { capable: true, title: "시공사퀴즈", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-5">
          <header className="flex items-center justify-between mb-3 sm:mb-5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent text-bg grid place-items-center text-sm font-black">B</div>
              <span className="text-sm font-semibold">시공사 퀴즈</span>
            </Link>
            <nav className="flex gap-1 text-sm">
              <Link href="/quiz" className="btn">퀴즈</Link>
              <Link href="/browse" className="btn">전체</Link>
              <InstallButton />
            </nav>
          </header>
          {children}
          <footer className="mt-12 pt-4 border-t border-border text-[11px] text-muted text-center">
            도급순위는 매년 7월 국토부 시공능력평가 기준 · <code className="px-1 bg-panel rounded">data/brands.ts</code> 편집 가능
          </footer>
        </div>
      </body>
    </html>
  );
}
