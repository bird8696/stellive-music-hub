// components/SongCard.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Song } from "@/lib/api";
import { MEMBER_BTN_COLORS, isMemberName } from "@/lib/memberColors";
import MemberButton from "./MemberButton";

interface Props {
  song: Song;
  onClick?: () => void;
}

function formatViews(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  return n.toLocaleString();
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
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
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.03em",
      }}
    >
      {member}
    </span>
  );
}

export default function SongCard({ song, onClick }: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/songs/${song.video_id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className="glass-card cursor-pointer overflow-hidden group"
    >
      {/* 썸네일 */}
      <div className="relative w-full aspect-video bg-bgSurface">
        {song.thumbnail_url ? (
          <Image
            src={song.thumbnail_url}
            alt={song.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-textSecondary text-xs">
            No Image
          </div>
        )}

        {/* 재생시간 */}
        <span
          className="absolute bottom-1 right-1 bg-black/80 text-white text-xs
          px-1.5 py-0.5 rounded font-mono"
        >
          {formatDuration(song.duration)}
        </span>

        {/* song_type 배지 */}
        <span
          className={`absolute top-1 left-1 text-xs px-2 py-0.5 rounded font-semibold
          ${
            song.song_type === "cover"
              ? "bg-primary/80 text-white"
              : song.song_type === "original"
                ? "bg-secondary/80 text-white"
                : "bg-bgSurface/80 text-textSecondary"
          }`}
        >
          {song.song_type === "cover"
            ? "커버"
            : song.song_type === "original"
              ? "오리지널"
              : "?"}
        </span>
      </div>

      {/* 정보 */}
      <div className="p-3 flex flex-col gap-2">
        <p className="text-sm font-semibold text-textPrimary line-clamp-2 leading-snug">
          {song.title}
        </p>

        <div className="flex items-center justify-between">
          <MemberTag member={song.member_name} />
          <span className="text-xs text-textSecondary font-mono">
            👁 {formatViews(song.view_count)}
          </span>
        </div>

        <MemberButton
          member={song.member_name}
          onClick={handleClick}
          className="w-full text-xs py-1.5"
        >
          자세히 보기
        </MemberButton>
      </div>
    </motion.div>
  );
}
