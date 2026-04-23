// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { PlayerProvider } from "@/lib/playerContext";
import MiniPlayer from "@/components/MiniPlayer";
import StarBackground from "@/components/StarBackground";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "StelLive Music Hub",
  description: "스텔라이브 커버/오리지널 곡 모음 팬사이트 (비공식)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PlayerProvider>
          <StarBackground />
          <Navbar />
          <main className="relative z-10 pb-24">{children}</main>

          {/* 푸터 */}
          <footer className="relative z-10 border-t border-border py-8 mt-10">
            <div className="max-w-6xl mx-auto px-6 text-center">
              <p className="text-sm text-textSecondary mb-1">
                본 사이트는 팬이 제작한 비공식 팬사이트입니다.
              </p>
              <p className="text-xs text-textSecondary/60 mt-1">
                스텔라이브의 공식 활동이 아니며, 스텔라이브 및 관계사와
                무관합니다.
              </p>
              <p className="text-xs text-textSecondary/60 mt-0.5">
                수록된 콘텐츠의 저작권은 스텔라이브 및 각 멤버에게 있습니다.
              </p>
              <p className="text-xs text-textSecondary/60 mt-0.5">
                멤버 일러스트 출처: 스텔라이브 공식 사이트 (stellive.me)
              </p>
              <p className="text-xs text-textSecondary/40 mt-3">
                © 2026 StelLive Music Hub — Fan-made, Non-commercial
              </p>
            </div>
          </footer>

          <MiniPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
