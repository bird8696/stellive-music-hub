// components/MiniPlayer.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "@/lib/playerContext";
import MemberBadge from "./MemberBadge";

export default function MiniPlayer() {
  const router = useRouter();
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    clearPlayer,
  } = usePlayer();

  return (
    <AnimatePresence>
      {currentSong && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 h-20
            bg-bgCard/90 backdrop-blur-xl border-t border-border
            flex items-center px-4 gap-4"
        >
          {/* 썸네일 */}
          <div
            className="relative w-12 h-12 rounded overflow-hidden shrink-0 cursor-pointer"
            onClick={() => router.push(`/songs/${currentSong.video_id}`)}
          >
            {currentSong.thumbnail_url ? (
              <Image
                src={currentSong.thumbnail_url}
                alt={currentSong.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-bgSurface" />
            )}
          </div>

          {/* 제목 + 멤버 */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => router.push(`/songs/${currentSong.video_id}`)}
          >
            <p className="text-sm font-semibold text-textPrimary truncate">
              {currentSong.title}
            </p>
            <MemberBadge member={currentSong.member_name} className="mt-1" />
          </div>

          {/* 컨트롤 */}
          <div className="flex items-center gap-3 shrink-0">
            {/* 이전 */}
            <button
              onClick={playPrev}
              className="text-textSecondary hover:text-textPrimary transition text-lg"
            >
              ⏮
            </button>

            {/* 재생/일시정지 */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary flex items-center
                justify-center text-white hover:bg-primary/80 transition"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            {/* 다음 */}
            <button
              onClick={playNext}
              className="text-textSecondary hover:text-textPrimary transition text-lg"
            >
              ⏭
            </button>

            {/* 닫기 */}
            <button
              onClick={clearPlayer}
              className="text-textSecondary hover:text-danger transition text-lg ml-2"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
