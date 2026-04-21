// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getSongs, getRanking, getGlobalStats } from "@/lib/api";
import type { SongListResponse, RankingResponse, GlobalStats } from "@/lib/api";
import SongCard from "@/components/SongCard";
import RankingRow from "@/components/RankingRow";

export default function HomePage() {
  const [trending, setTrending] = useState<RankingResponse | null>(null);
  const [latest, setLatest] = useState<SongListResponse | null>(null);
  const [stats, setStats] = useState<GlobalStats | null>(null);

  useEffect(() => {
    getRanking({ period: "daily" })
      .then(setTrending)
      .catch(() => null);
    getSongs({ sort: "latest", limit: 6 })
      .then(setLatest)
      .catch(() => null);
    getGlobalStats()
      .then(setStats)
      .catch(() => null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* 히어로 배너 */}
      <section className="relative px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h1
            className="text-5xl font-bold mb-3"
            style={{
              background: "linear-gradient(135deg, #9B5DFF, #FF6B9D)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            StelLive Music Hub
          </h1>
          <p className="text-textSecondary mb-6">
            스텔라이브 커버 · 오리지널 곡 모음 서비스
          </p>

          {stats && (
            <div className="flex justify-center gap-8 text-sm">
              <div>
                <p className="text-2xl font-bold text-primary font-mono">
                  {stats.total_songs.toLocaleString()}
                </p>
                <p className="text-textSecondary">총 영상</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary font-mono">
                  {stats.total_views >= 10_000
                    ? `${(stats.total_views / 10_000).toFixed(0)}만`
                    : stats.total_views.toLocaleString()}
                </p>
                <p className="text-textSecondary">총 조회수</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent font-mono">
                  {stats.today_uploads}
                </p>
                <p className="text-textSecondary">오늘 업로드</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 오늘의 급상승 TOP 5 */}
      <section className="px-6 mb-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">🔥 오늘의 급상승 TOP 5</h2>
        {trending && trending.items.length > 0 ? (
          <div className="glass-card overflow-hidden">
            {trending.items.slice(0, 5).map((item) => (
              <RankingRow
                key={item.video_id}
                item={item}
                queue={trending.items}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-textSecondary">
            데이터 수집 중입니다...
          </div>
        )}
      </section>

      {/* 최신 업로드 */}
      <section className="px-6 mb-12 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-4">🆕 최신 업로드</h2>
        {latest && latest.items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {latest.items.map((song) => (
              <SongCard key={song.video_id} song={song} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card h-48 animate-pulse" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
