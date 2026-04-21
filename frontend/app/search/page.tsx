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
    <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-textPrimary">🔍 검색</h1>

      {/* 검색창 */}
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="곡 제목을 입력하세요..."
          className="w-full px-5 py-4 rounded-xl bg-white border border-border
            text-gray-900 text-base placeholder-gray-400 outline-none
            focus:border-primary transition"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2
              text-gray-400 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        )}
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

      {/* 결과 */}
      {loading ? (
        <div className="text-center text-textSecondary text-base py-12">
          검색 중...
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-sm text-textSecondary mb-4">
            검색 결과{" "}
            <span className="text-textPrimary font-bold">
              {results.length}개
            </span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((song) => (
              <SongCard key={song.video_id} song={song} />
            ))}
          </div>
        </>
      ) : query.trim() ? (
        <div className="text-center text-textSecondary py-12">
          <p className="text-5xl mb-4">🎵</p>
          <p className="text-base">"{query}" 검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="text-center text-textSecondary py-12">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-base">검색어를 입력해주세요.</p>
        </div>
      )}
    </div>
  );
}
