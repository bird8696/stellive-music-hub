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
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary mb-1">차트</h1>
        <p className="text-textSecondary text-sm">
          {ranking ? `총 ${ranking.items.length}곡` : ""}
        </p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* 타입 필터 */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => setSongType(t.value)}
              className="px-6 py-2.5 text-base font-semibold transition-all duration-200"
              style={
                songType === t.value
                  ? {
                      background: "linear-gradient(135deg, #9B5DFF, #FF6B9D)",
                      color: "white",
                    }
                  : {
                      background: "transparent",
                      color: "#9E8EC4",
                    }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 기간 필터 */}
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="px-4 py-2.5 text-base font-semibold transition-all duration-200 pb-2"
              style={
                period === p.value
                  ? {
                      color: "#9B5DFF",
                      borderBottom: "2px solid #9B5DFF",
                    }
                  : {
                      color: "#9E8EC4",
                      borderBottom: "2px solid transparent",
                    }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 멤버 필터 */}
      <div className="flex flex-wrap gap-2 mb-8">
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
          <div className="p-12 text-center text-textSecondary text-base">
            로딩 중...
          </div>
        ) : !ranking || ranking.items.length === 0 ? (
          <div className="p-12 text-center text-textSecondary text-base">
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
