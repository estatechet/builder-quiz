import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import InstallButton from "@/components/InstallButton";

export const metadata: Metadata = {
  title: "시공사 브랜드 퀴즈 · Builder Quiz",
  description: "대한민국 도급순위 100위권 시공사 브랜드 학습 대시보드",
  applicationName: "시공사 브랜드 퀴즈",
  appleWebApp: {
    capable: true,
    title: "시공사퀴즈",
    statusBarStyle: "black-translucent",
  },
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
        <div className="max-w-6xl mx-auto px-5 py-6">
          <header className="flex items-center justify-between mb-8 gap-3 flex-wrap">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent text-bg grid place-items-center font-black">B</div>
              <div>
                <div className="text-base font-semibold">시공사 브랜드 퀴즈</div>
                <div className="text-xs text-muted">Builder × Brand Trainer</div>
              </div>
            </Link>
            <nav className="flex gap-2 text-sm items-center">
              <Link href="/" className="btn">대시보드</Link>
              <Link href="/quiz" className="btn">퀴즈</Link>
              <Link href="/browse" className="btn">전체 보기</Link>
              <InstallButton />
            </nav>
          </header>
          {children}
          <footer className="mt-16 pt-6 border-t border-border text-xs text-muted">
            데이터는 학습 보조용입니다. 정확한 도급순위는 매년 7월 국토부 시공능력평가 공시 기준이며,
            <code className="mx-1 px-1.5 py-0.5 bg-panel rounded">data/brands.ts</code>에서 자유롭게 수정/추가할 수 있습니다.
          </footer>
        </div>
      </body>
    </html>
  );
}
