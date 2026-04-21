// lib/api.ts

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type SongType = "cover" | "original" | "unknown";
export type SortType = "views" | "daily_views" | "likes" | "latest";
export type Period = "daily" | "weekly" | "monthly" | "alltime";

export interface Song {
  id: number;
  video_id: string;
  title: string;
  channel_id: string;
  channel_name: string;
  member_name: string;
  thumbnail_url: string | null;
  published_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration: number;
  song_type: SongType;
  is_short: boolean;
  is_collab: boolean;
  created_at: string;
  updated_at: string;
}

export interface SongListResponse {
  items: Song[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export interface RankingItem extends Song {
  rank: number;
  prev_rank: number | null;
  rank_change: number | null;
  is_new: boolean;
  daily_views: number;
}

export interface RankingResponse {
  period: Period;
  song_type: string;
  member: string | null;
  items: RankingItem[];
  updated_at: string;
}

export interface ViewHistoryPoint {
  recorded_at: string;
  view_count: number;
}

export interface SongDetail extends Song {
  view_history: ViewHistoryPoint[];
  related_songs: Song[];
}

export interface MemberStats {
  member_name: string;
  member_name_full: string;
  generation: string;
  handle: string;
  channel_id: string;
  total_songs: number;
  total_views: number;
  cover_count: number;
  original_count: number;
  collab_count: number;
  top3_songs: Song[];
}

export interface GlobalStats {
  total_songs: number;
  total_views: number;
  cover_count: number;
  original_count: number;
  today_uploads: number;
  last_updated: string;
}

async function fetchApi<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`API 오류 ${res.status}: ${path}`);
  return res.json();
}

export const getSongs = (params: {
  type?: string;
  member?: string;
  sort?: SortType;
  page?: number;
  limit?: number;
}) =>
  fetchApi<SongListResponse>("/api/songs", {
    ...(params.type && { type: params.type }),
    ...(params.member && { member: params.member }),
    ...(params.sort && { sort: params.sort }),
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
  });

export const getSongDetail = (videoId: string) =>
  fetchApi<SongDetail>(`/api/songs/${videoId}`);

export const getSongHistory = (videoId: string, period: "7d" | "30d" = "7d") =>
  fetchApi<ViewHistoryPoint[]>(`/api/songs/${videoId}/history`, { period });

export const getRanking = (params: {
  period?: Period;
  type?: string;
  member?: string;
}) =>
  fetchApi<RankingResponse>("/api/ranking", {
    ...(params.period && { period: params.period }),
    ...(params.type && { type: params.type }),
    ...(params.member && { member: params.member }),
  });

export const getMembers = () =>
  fetchApi<{ members: MemberStats[] }>("/api/members");

export const getMember = (memberName: string) =>
  fetchApi<MemberStats>(`/api/members/${encodeURIComponent(memberName)}`);

export const getGlobalStats = () => fetchApi<GlobalStats>("/api/stats");

export const searchSongs = (q: string, member?: string) =>
  fetchApi<Song[]>("/api/search", {
    q,
    ...(member && { member }),
  });
