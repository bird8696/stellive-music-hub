// app/songs/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { getSongs, type SongListResponse } from "@/lib/api";
import { MEMBER_NAMES } from "@/lib/memberColors";
import SongCard from "@/components/SongCard";
import MemberBadge from "@/components/MemberBadge";

type SortType = "views" | "likes" | "latest";
type TypeFilter = "all" | "cover" | "original";

export default function SongsPage() {
  const [songs, setSongs] = useState<SongListResponse | null>(null);
  const [type, setType] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortType>("views");
  const [member, setMember] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchSongs = useCallback(() => {
    setLoading(true);
    getSongs({
      type,
      sort,
      member: member ?? undefined,
      page,
      limit: 24,
    })
      .then(setSongs)
      .catch(() => setSongs(null))
      .finally(() => setLoading(false));
  }, [type, sort, member, page]);

  useEffect(() => {
    setPage(1);
  }, [type, sort, member]);
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const types: { value: TypeFilter; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "cover", label: "커버" },
    { value: "original", label: "오리지널" },
  ];

  const sorts: { value: SortType; label: string }[] = [
    { value: "views", label: "조회수" },
    { value: "likes", label: "좋아요" },
    { value: "latest", label: "최신순" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary mb-1">
          전체 곡 목록
        </h1>
        <p className="text-textSecondary text-sm">
          {songs ? `총 ${songs.total.toLocaleString()}곡` : ""}
        </p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* 타입 필터 */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className="px-5 py-2 text-sm font-semibold transition-all duration-200"
              style={
                type === t.value
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

        <div className="w-px h-8 bg-border" />

        {/* 정렬 필터 */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          {sorts.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className="px-5 py-2 text-sm font-semibold transition-all duration-200"
              style={
                sort === s.value
                  ? {
                      backgroundColor: "rgba(155,93,255,0.3)",
                      color: "#9B5DFF",
                      borderBottom: "2px solid #9B5DFF",
                    }
                  : {
                      background: "transparent",
                      color: "#9E8EC4",
                    }
              }
            >
              {s.label}
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

      {/* 곡 목록 */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="glass-card aspect-video animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : songs && songs.items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {songs.items.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-bgSurface
                text-textSecondary border border-border disabled:opacity-30
                hover:text-textPrimary hover:border-primary transition"
            >
              이전
            </button>
            <span className="px-4 py-2 text-sm text-textSecondary">
              {page} / {Math.ceil(songs.total / 24)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!songs.has_next}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-bgSurface
                text-textSecondary border border-border disabled:opacity-30
                hover:text-textPrimary hover:border-primary transition"
            >
              다음
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-textSecondary py-20">
          곡이 없습니다.
        </div>
      )}
    </div>
  );
}
