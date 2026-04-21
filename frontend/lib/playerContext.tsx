// lib/playerContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { Song } from "./api";

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
}

interface PlayerContextValue extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  clearPlayer: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    queue: [],
    isPlaying: false,
  });

  const playSong = useCallback((song: Song, queue: Song[] = []) => {
    setState({ currentSong: song, queue, isPlaying: true });
  }, []);

  const togglePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const playNext = useCallback(() => {
    setState((prev) => {
      if (!prev.currentSong || prev.queue.length === 0) return prev;
      const idx = prev.queue.findIndex(
        (s) => s.video_id === prev.currentSong!.video_id,
      );
      const next = prev.queue[idx + 1];
      return next ? { ...prev, currentSong: next, isPlaying: true } : prev;
    });
  }, []);

  const playPrev = useCallback(() => {
    setState((prev) => {
      if (!prev.currentSong || prev.queue.length === 0) return prev;
      const idx = prev.queue.findIndex(
        (s) => s.video_id === prev.currentSong!.video_id,
      );
      const prev2 = prev.queue[idx - 1];
      return prev2 ? { ...prev, currentSong: prev2, isPlaying: true } : prev;
    });
  }, []);

  const clearPlayer = useCallback(() => {
    setState({ currentSong: null, queue: [], isPlaying: false });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playSong,
        togglePlay,
        playNext,
        playPrev,
        clearPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx)
    throw new Error("usePlayer는 PlayerProvider 내부에서 사용해야 합니다.");
  return ctx;
}
