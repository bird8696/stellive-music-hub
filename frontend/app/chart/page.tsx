// app/chart/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getRanking, type RankingResponse, type Period } from "@/lib/api";
import { MEMBER_NAMES } from "@/lib/memberColors";
import MemberBadge from "@/components/MemberBadge";
import RankingRow from "@/components/RankingRow";

type SongTypeFilter = "all" | "cover" | "original";

export default function ChartPage() {
  const [period, setPeriod] = useState<Period>("alltime");
  const [songType, setSongType] = useState<SongTypeFilter>("all");
  const [member, setMember] = useState<string | null>(null);
  const [ranking, setRanking] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRanking({
      period,
      type: songType,
      member: member ?? undefined,
    })
      .then(setRanking)
      .catch(() => setRanking(null))
      .finally(() => setLoading(false));
  }, [period, songType, member]);

  const periods: { value: Period; label: string }[] = [
    { value: "daily", label: "일간" },
    { value: "weekly", label: "주간" },
    { value: "monthly", label: "월간" },
    { value: "alltime", label: "전체" },
  ];

  const types: { value: SongTypeFilter; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "cover", label: "커버" },
    { value: "original", label: "오리지널" },
  ];

  return (
    <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-textPrimary">🏆 차트</h1>

      {/* 타입 + 기간 필터 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* 타입 */}
        <div className="flex gap-2">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => setSongType(t.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition
                ${
                  songType === t.value
                    ? "btn-brand"
                    : "bg-bgSurface text-textSecondary hover:text-textPrimary border border-border"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* 기간 */}
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-2 rounded text-sm font-semibold transition
                ${
                  period === p.value
                    ? "text-primary border-b-2 border-primary"
                    : "text-textSecondary hover:text-textPrimary"
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 멤버 필터 토글 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {MEMBER_NAMES.map((name) => (
          <MemberBadge
            key={name}
            member={name}
            active={member === name}
            clickable
            onClick={() => setMember(member === name ? null : name)}
          />
        ))}
      </div>

      {/* 순위표 */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-textSecondary text-base">
            로딩 중...
          </div>
        ) : !ranking || ranking.items.length === 0 ? (
          <div className="p-8 text-center text-textSecondary text-base">
            데이터가 없습니다.
          </div>
        ) : (
          ranking.items.map((item) => (
            <RankingRow key={item.video_id} item={item} queue={ranking.items} />
          ))
        )}
      </div>
    </div>
  );
}
