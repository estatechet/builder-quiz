"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isiOS, setIsiOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (standalone) setInstalled(true);

    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsiOS(iOS);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return <span className="chip">✓ 앱 설치됨</span>;
  }

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      return;
    }
    if (isiOS) {
      setShowIOSHint((v) => !v);
    }
  };

  // Chrome/Edge/Android — native prompt 사용 가능
  if (deferred) {
    return (
      <button onClick={onClick} className="btn btn-primary">
        📱 앱 설치
      </button>
    );
  }

  // iOS — Safari 가이드
  if (isiOS) {
    return (
      <div className="relative">
        <button onClick={onClick} className="btn">📱 앱으로 설치</button>
        {showIOSHint && (
          <div className="absolute right-0 mt-2 w-72 z-50 card !p-4 text-xs leading-relaxed shadow-2xl">
            <div className="font-semibold mb-1">iOS 설치 방법</div>
            <ol className="list-decimal ml-4 space-y-1 text-muted">
              <li>Safari 하단의 <strong>공유</strong> 버튼 (□↑)</li>
              <li><strong>홈 화면에 추가</strong> 선택</li>
              <li>오른쪽 상단 <strong>추가</strong> 탭</li>
            </ol>
            <button onClick={() => setShowIOSHint(false)} className="mt-3 btn !py-1 !px-2 text-[11px]">닫기</button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
