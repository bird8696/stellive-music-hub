// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getSongs, getRanking, getGlobalStats } from "@/lib/api";
import type { SongListResponse, RankingResponse, GlobalStats } from "@/lib/api";
import SongCard from "@/components/SongCard";
import RankingRow from "@/components/RankingRow";
import Image from "next/image";

export default function HomePage() {
  const [trending, setTrending] = useState<RankingResponse | null>(null);
  const [latest, setLatest] = useState<SongListResponse | null>(null);
  const [stats, setStats] = useState<GlobalStats | null>(null);

  useEffect(() => {
    getRanking({ period: "daily" })
      .then(setTrending)
      .catch(() => null);
    getSongs({ sort: "latest", limit: 12 })
      .then(setLatest)
      .catch(() => null);
    getGlobalStats()
      .then(setStats)
      .catch(() => null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* 히어로 */}
      <section
        className="relative px-6 py-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(155,93,255,0.15) 0%, transparent 100%)",
          borderBottom: "1px solid #3D2F6E",
        }}
      >
        {/* 배경 글로우 */}
        <div
          className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at right, #9B5DFF 0%, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-0">
          {/* 왼쪽 타이틀 */}
          <div className="z-10 flex-1 shrink-0">
            <p className="text-sm text-textSecondary tracking-widest uppercase mb-2">
              StelLive Music Hub
            </p>
            <h1
              className="text-4xl md:text-6xl font-bold leading-tight mb-4"
              style={{
                background: "linear-gradient(135deg, #9B5DFF, #FF6B9D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              스텔라이브의
              <br />
              모든 음악
            </h1>
            <p className="text-textSecondary text-base mb-1">
              커버곡부터 오리지널까지, 한 곳에서
            </p>
            <p className="text-xs text-textSecondary/40 mb-8">
              일러스트 출처: 스텔라이브 공식 사이트 (stellive.me)
            </p>

            {/* 통계 */}
            {stats && (
              <div className="flex gap-8">
                <div>
                  <p
                    className="text-3xl font-bold font-mono"
                    style={{ color: "#9B5DFF" }}
                  >
                    {stats.total_songs.toLocaleString()}
                  </p>
                  <p className="text-xs text-textSecondary mt-1">총 수록곡</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p
                    className="text-3xl font-bold font-mono"
                    style={{ color: "#FF6B9D" }}
                  >
                    {stats.total_views >= 100_000_000
                      ? `${(stats.total_views / 100_000_000).toFixed(1)}억`
                      : `${(stats.total_views / 10_000).toFixed(0)}만`}
                  </p>
                  <p className="text-xs text-textSecondary mt-1">누적 조회수</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p
                    className="text-3xl font-bold font-mono"
                    style={{ color: "#FFD166" }}
                  >
                    {stats.cover_count}
                  </p>
                  <p className="text-xs text-textSecondary mt-1">커버곡</p>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 이미지 — 크게 키우고 왼쪽으로 당겨서 텍스트와 붙임 */}
          <div
            className="relative shrink-0 w-[420px] h-[420px] md:w-[640px] md:h-[640px] -ml-12 md:-ml-20"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 25%), linear-gradient(to bottom, transparent 0%, black 15%)",
              WebkitMaskComposite: "destination-in",
              maskImage:
                "linear-gradient(to right, transparent 0%, black 25%), linear-gradient(to bottom, transparent 0%, black 15%)",
              maskComposite: "intersect",
            }}
          >
            <Image
              src="https://stellive.me/files/attach/images/sub/sub1_img2.png?2"
              alt="스텔라이브"
              fill
              className="object-contain object-center"
              style={{
                filter: "drop-shadow(0 0 50px rgba(155,93,255,0.6))",
              }}
            />
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-14">
        {/* 급상승 차트 */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-textPrimary">
                급상승 차트
              </h2>
              <p className="text-xs text-textSecondary mt-0.5">
                최근 24시간 기준
              </p>
            </div>
            <a href="/chart" className="text-sm text-primary hover:underline">
              전체 차트 보기
            </a>
          </div>
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
            <div className="glass-card p-10 text-center text-textSecondary text-sm">
              조회수 데이터를 수집 중입니다. 잠시 후 다시 확인해주세요.
            </div>
          )}
        </section>

        {/* 최신 업로드 */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-textPrimary">
                최신 업로드
              </h2>
              <p className="text-xs text-textSecondary mt-0.5">
                새로 추가된 곡
              </p>
            </div>
            <a href="/search" className="text-sm text-primary hover:underline">
              더 보기
            </a>
          </div>
          {latest && latest.items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {latest.items.map((song) => (
                <SongCard key={song.video_id} song={song} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-card aspect-video animate-pulse rounded-xl"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
