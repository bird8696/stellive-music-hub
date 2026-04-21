// app/songs/[id]/page.tsx
import { getSongDetail } from "@/lib/api";
import { isMemberName, MEMBER_BTN_COLORS } from "@/lib/memberColors";
import MemberButton from "@/components/MemberButton";
import ViewChart from "@/components/ViewChart";
import SongCard from "@/components/SongCard";

interface Props {
  params: { id: string };
}

function formatViews(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  return n.toLocaleString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {member}
    </span>
  );
}

export default async function SongPage({ params }: Props) {
  const song = await getSongDetail(params.id).catch(() => null);

  if (!song) {
    return (
      <div className="flex items-center justify-center min-h-screen text-textSecondary">
        영상을 찾을 수 없습니다.
      </div>
    );
  }

  const colors = isMemberName(song.member_name)
    ? MEMBER_BTN_COLORS[song.member_name]
    : null;
  const [, fg] = colors ?? ["#1A1530", "#9B5DFF"];

  return (
    <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* YouTube IFrame */}
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-bgSurface shadow-glow">
          <iframe
            src={`https://www.youtube.com/embed/${song.video_id}?autoplay=1`}
            title={song.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {/* 영상 정보 */}
        <div className="flex flex-col gap-4">
          {/* 멤버 태그 + 타입 */}
          <div className="flex items-center gap-2 flex-wrap">
            <MemberTag member={song.member_name} />
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold
              ${
                song.song_type === "cover"
                  ? "bg-primary/20 text-primary"
                  : song.song_type === "original"
                    ? "bg-secondary/20 text-secondary"
                    : "bg-bgSurface text-textSecondary"
              }`}
            >
              {song.song_type === "cover"
                ? "커버"
                : song.song_type === "original"
                  ? "오리지널"
                  : "미분류"}
            </span>
            {song.is_collab && (
              <span className="text-xs px-2 py-0.5 rounded font-semibold bg-accent/20 text-accent">
                단체곡
              </span>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-xl font-bold text-textPrimary leading-snug">
            {song.title}
          </h1>

          {/* 통계 */}
          <div className="glass-card p-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold font-mono" style={{ color: fg }}>
                {formatViews(song.view_count)}
              </p>
              <p className="text-xs text-textSecondary mt-1">조회수</p>
            </div>
            <div>
              <p className="text-lg font-bold font-mono" style={{ color: fg }}>
                {formatViews(song.like_count)}
              </p>
              <p className="text-xs text-textSecondary mt-1">좋아요</p>
            </div>
            <div>
              <p className="text-lg font-bold font-mono" style={{ color: fg }}>
                {formatDuration(song.duration)}
              </p>
              <p className="text-xs text-textSecondary mt-1">길이</p>
            </div>
          </div>

          {/* 업로드일 */}
          <p className="text-sm text-textSecondary">
            📅 {formatDate(song.published_at)}
          </p>

          {/* 버튼 */}
          <div className="flex gap-3">
            <MemberButton
              member={song.member_name}
              href={`https://youtube.com/watch?v=${song.video_id}`}
              className="flex-1"
            >
              ▶ YouTube에서 보기
            </MemberButton>
            <MemberButton
              member={song.member_name}
              href={`https://youtube.com/channel/${song.channel_id}`}
              className="flex-1"
            >
              채널 방문
            </MemberButton>
          </div>
        </div>
      </div>

      {/* 조회수 차트 */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-4">📈 조회수 추이</h2>
        <ViewChart videoId={song.video_id} />
      </section>

      {/* 추천곡 */}
      {song.related_songs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4">
            🎵 {song.member_name}의 다른 곡
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {song.related_songs.map((s) => (
              <SongCard key={s.video_id} song={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
