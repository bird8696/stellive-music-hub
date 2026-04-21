// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { PlayerProvider } from "@/lib/playerContext";
import MiniPlayer from "@/components/MiniPlayer";
import StarBackground from "@/components/StarBackground";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "StelLive Music Hub",
  description: "스텔라이브 커버/오리지널 곡 모음 및 랭킹 서비스",
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
          <MiniPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
