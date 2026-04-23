// app/search/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { searchSongs, type Song } from "@/lib/api";
import { MEMBER_NAMES } from "@/lib/memberColors";
import SongCard from "@/components/SongCard";
import MemberBadge from "@/components/MemberBadge";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [member, setMember] = useState<string | null>(null);
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchSongs(query.trim(), member ?? undefined)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query, member]);

  useEffect(() => {
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary mb-1">검색</h1>
        <p className="text-sm text-textSecondary">
          곡 제목 또는 멤버로 검색하세요
        </p>
      </div>

      {/* 검색창 */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="곡 제목을 입력하세요..."
          className="w-full px-6 py-5 rounded-2xl text-base outline-none transition-all duration-200"
          style={{
            background: "rgba(26,21,48,0.8)",
            border: `1.5px solid ${query ? "#9B5DFF" : "#3D2F6E"}`,
            color: "#F0EAFF",
            boxShadow: query ? "0 0 20px rgba(155,93,255,0.15)" : "none",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-5 top-1/2 -translate-y-1/2
              text-textSecondary hover:text-textPrimary transition text-lg font-light"
          >
            ✕
          </button>
        )}
      </div>

      {/* 멤버 필터 */}
      <div className="flex flex-wrap gap-2 mb-10">
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

      {/* 결과 */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="glass-card aspect-video animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-sm text-textSecondary mb-5">
            검색 결과{" "}
            <span className="text-textPrimary font-bold">
              {results.length}개
            </span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((song) => (
              <SongCard key={song.video_id} song={song} />
            ))}
          </div>
        </>
      ) : query.trim() ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{
            background: "rgba(26,21,48,0.5)",
            border: "1px solid #3D2F6E",
          }}
        >
          <p className="text-base font-semibold text-textPrimary mb-2">
            검색 결과가 없습니다
          </p>
          <p className="text-sm text-textSecondary">
            "{query}"에 대한 결과를 찾을 수 없어요
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl p-16 text-center"
          style={{
            background: "rgba(26,21,48,0.5)",
            border: "1px solid #3D2F6E",
          }}
        >
          <p className="text-base font-semibold text-textPrimary mb-2">
            검색어를 입력해주세요
          </p>
          <p className="text-sm text-textSecondary">
            곡 제목으로 검색할 수 있어요
          </p>
        </div>
      )}
    </div>
  );
}
