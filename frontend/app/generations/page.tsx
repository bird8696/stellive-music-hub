// app/generations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getMembers, type MemberStats } from "@/lib/api";
import { MEMBER_BTN_COLORS, isMemberName } from "@/lib/memberColors";
import Link from "next/link";
import Image from "next/image";

const GENERATIONS = [
  { key: "1기 EVERYS", label: "1기 EVERYS", color: "#9B5DFF" },
  { key: "2기 UNIVERSE", label: "2기 UNIVERSE", color: "#FF6B9D" },
  { key: "3기 cliché", label: "3기 cliché", color: "#FFD166" },
];

const MEMBER_IMAGES: Record<string, string> = {
  유니: "https://stellive.me/files/attach/images/sub/talents_img2.png",
  후야: "https://stellive.me/files/attach/images/sub/talents_saki.png",
  히나: "https://stellive.me/files/attach/images/sub/talents_img3_new.png",
  마시로: "https://stellive.me/files/attach/images/sub/talents_img4.png",
  리제: "https://stellive.me/files/attach/images/sub/talents_img5.png",
  타비: "https://stellive.me/files/attach/images/sub/talents_img6.png",
  시부키: "https://stellive.me/files/attach/images/sub/talents_img7.png",
  린: "https://stellive.me/files/attach/images/sub/talents_img8.png",
  나나: "https://stellive.me/files/attach/images/sub/talents_img9.png",
  리코: "https://stellive.me/files/attach/images/sub/talents_img10.png",
};

function formatViews(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  return n.toLocaleString();
}

function MemberCard({ member }: { member: MemberStats }) {
  const colors = isMemberName(member.member_name)
    ? MEMBER_BTN_COLORS[member.member_name]
    : null;
  const [bg, fg] = colors ?? ["#1A1530", "#9B5DFF"];
  const imgUrl = MEMBER_IMAGES[member.member_name];

  return (
    <Link href={`/members/${encodeURIComponent(member.member_name)}`}>
      <div
        className="glass-card overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow-lg"
        style={{ borderTop: `3px solid ${fg}` }}
      >
        {/* 멤버 이미지 */}
        <div className="relative w-full aspect-[3/4] bg-bgSurface overflow-hidden">
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt={member.member_name_full}
              fill
              className="object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-textSecondary">
              No Image
            </div>
          )}
          {/* 그라디언트 오버레이 */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 50%, ${bg}ee 100%)`,
            }}
          />
          {/* 이름 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-lg font-bold" style={{ color: fg }}>
              {member.member_name_full}
            </p>
            <p className="text-xs text-white/70">{member.handle}</p>
          </div>
        </div>

        {/* 통계 */}
        <div className="p-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-base font-bold font-mono" style={{ color: fg }}>
              {member.total_songs}
            </p>
            <p className="text-xs text-textSecondary">총 곡수</p>
          </div>
          <div>
            <p className="text-base font-bold font-mono" style={{ color: fg }}>
              {member.cover_count}
            </p>
            <p className="text-xs text-textSecondary">커버</p>
          </div>
          <div>
            <p className="text-base font-bold font-mono" style={{ color: fg }}>
              {member.original_count}
            </p>
            <p className="text-xs text-textSecondary">오리지널</p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <p className="text-xs text-textSecondary text-center">
            총 조회수
            <span className="ml-2 font-bold font-mono" style={{ color: fg }}>
              {formatViews(member.total_views)}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function GenerationsPage() {
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [activeGen, setActiveGen] = useState("1기 EVERYS");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMembers()
      .then((res) => setMembers(res.members))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter((m) => m.generation === activeGen);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary mb-1">
          기수별 멤버
        </h1>
        <p className="text-textSecondary text-sm">
          스텔라이브 멤버를 기수별로 확인하세요
        </p>
        <p className="text-xs text-textSecondary/60 mt-1">
          * 멤버 일러스트 출처: 스텔라이브 공식 사이트 (stellive.me)
        </p>
      </div>

      {/* 기수 탭 */}
      <div className="flex gap-2 mb-10 border-b border-border">
        {GENERATIONS.map((gen) => (
          <button
            key={gen.key}
            onClick={() => setActiveGen(gen.key)}
            className="px-6 py-3 text-base font-semibold transition-all duration-200 pb-3"
            style={
              activeGen === gen.key
                ? {
                    color: gen.color,
                    borderBottom: `3px solid ${gen.color}`,
                  }
                : {
                    color: "#9E8EC4",
                    borderBottom: "3px solid transparent",
                  }
            }
          >
            {gen.label}
          </button>
        ))}
      </div>

      {/* 멤버 카드 */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card h-80 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filtered.map((member) => (
            <MemberCard key={member.member_name} member={member} />
          ))}
        </div>
      ) : (
        <div className="text-center text-textSecondary py-20">
          멤버 정보가 없습니다.
        </div>
      )}
    </div>
  );
}
