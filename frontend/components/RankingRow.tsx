// components/RankingRow.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { RankingItem } from "@/lib/api";
import { MEMBER_BTN_COLORS, isMemberName } from "@/lib/memberColors";
import { usePlayer } from "@/lib/playerContext";

interface Props {
  item: RankingItem;
  queue: RankingItem[];
}

function formatViews(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  return n.toLocaleString();
}

function MemberTag({ member }: { member: string }) {
  const colors = isMemberName(member) ? MEMBER_BTN_COLORS[member] : null;
  const [bg, fg] = colors ?? ["#1A1530", "#9B5DFF"];

  return (
    <span
      style={{
        color: fg,
        backgroundColor: bg,
        border: `1px solid ${fg}66`,
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {member}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="rank-gold   font-mono font-bold text-2xl w-10 text-center">
        {rank}
      </span>
    );
  if (rank === 2)
    return (
      <span className="rank-silver font-mono font-bold text-2xl w-10 text-center">
        {rank}
      </span>
    );
  if (rank === 3)
    return (
      <span className="rank-bronze font-mono font-bold text-2xl w-10 text-center">
        {rank}
      </span>
    );
  return (
    <span className="font-mono text-base text-textSecondary w-10 text-center">
      {rank}
    </span>
  );
}

function RankChange({ item }: { item: RankingItem }) {
  if (item.is_new) {
    return (
      <span className="text-xs font-bold text-accent w-10 text-center">
        NEW
      </span>
    );
  }
  if (item.rank_change === null || item.rank_change === 0) {
    return (
      <span className="text-xs text-textSecondary w-10 text-center">-</span>
    );
  }
  if (item.rank_change > 0) {
    return (
      <span className="text-xs font-bold text-success w-10 text-center">
        ▲{item.rank_change}
      </span>
    );
  }
  return (
    <span className="text-xs font-bold text-danger w-10 text-center">
      ▼{Math.abs(item.rank_change)}
    </span>
  );
}

export default function RankingRow({ item, queue }: Props) {
  const router = useRouter();
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();

  const isCurrentSong = currentSong?.video_id === item.video_id;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(item, queue);
    }
  };

  return (
    <div
      onClick={() => router.push(`/songs/${item.video_id}`)}
      className={`flex items-center gap-4 px-6 py-5 cursor-pointer transition-all duration-200
        hover:bg-white/5 border-b border-border/50 last:border-0
        ${isCurrentSong ? "bg-primary/10" : ""}`}
    >
      {/* 순위 */}
      <RankBadge rank={item.rank} />

      {/* 순위 변동 */}
      <RankChange item={item} />

      {/* 썸네일 */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-bgSurface">
        {item.thumbnail_url && (
          <Image
            src={item.thumbnail_url}
            alt={item.title}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* 제목 + 멤버 */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-base font-semibold truncate mb-1.5
          ${isCurrentSong ? "text-primary" : "text-textPrimary"}`}
        >
          {item.title}
        </p>
        <div className="flex items-center gap-2">
          <MemberTag member={item.member_name} />
          <span className="text-xs text-textSecondary">
            {item.song_type === "cover"
              ? "커버"
              : item.song_type === "original"
                ? "오리지널"
                : ""}
          </span>
        </div>
      </div>

      {/* 조회수 */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-sm text-textSecondary font-mono">
          {formatViews(item.view_count)}
        </p>
        {item.daily_views > 0 && (
          <p className="text-xs text-success font-mono mt-0.5">
            +{formatViews(item.daily_views)}
          </p>
        )}
      </div>

      {/* 재생 버튼 */}
      <button
        onClick={handlePlay}
        className="shrink-0 w-11 h-11 rounded-full bg-primary/20 hover:bg-primary/40
          flex items-center justify-center transition-all duration-200 text-primary text-lg"
      >
        {isCurrentSong && isPlaying ? "⏸" : "▶"}
      </button>
    </div>
  );
}
