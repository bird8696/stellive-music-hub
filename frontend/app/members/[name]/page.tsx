// app/members/[name]/page.tsx
import { getMember, getSongs } from "@/lib/api";
import {
  isMemberName,
  MEMBER_BTN_COLORS,
  MEMBER_BADGE_COLORS,
} from "@/lib/memberColors";
import MemberButton from "@/components/MemberButton";
import SongCard from "@/components/SongCard";
import Image from "next/image";

interface Props {
  params: { name: string };
}

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

export default async function MemberPage({ params }: Props) {
  const memberName = decodeURIComponent(params.name);

  const [member, covers, originals] = await Promise.all([
    getMember(memberName).catch(() => null),
    getSongs({ member: memberName, type: "cover", limit: 100 }).catch(
      () => null,
    ),
    getSongs({ member: memberName, type: "original", limit: 100 }).catch(
      () => null,
    ),
  ]);

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-screen text-textSecondary">
        멤버를 찾을 수 없습니다.
      </div>
    );
  }

  const btnColors = isMemberName(memberName)
    ? MEMBER_BTN_COLORS[memberName]
    : null;
  const badgeColors = isMemberName(memberName)
    ? MEMBER_BADGE_COLORS[memberName]
    : null;
  const [bg, fg] = btnColors ?? ["#1A1530", "#9B5DFF"];
  const [, badgeFg] = badgeColors ?? ["transparent", "#9B5DFF"];
  const imgUrl = MEMBER_IMAGES[memberName];

  return (
    <div>
      {/* 헤더 */}
      <div
        className="relative overflow-hidden"
        style={{ borderBottom: `1px solid ${fg}33` }}
      >
        {/* 배경 그라디언트 */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${bg}99 0%, transparent 60%)`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center gap-8">
          {/* 멤버 이미지 */}
          {imgUrl && (
            <div className="relative w-48 h-64 shrink-0 rounded-2xl overflow-hidden shadow-glow">
              <Image
                src={imgUrl}
                alt={member.member_name_full}
                fill
                className="object-cover object-top"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, transparent 60%, ${bg}cc 100%)`,
                }}
              />
            </div>
          )}

          {/* 멤버 정보 */}
          <div className="flex-1">
            <p className="text-sm mb-2" style={{ color: badgeFg }}>
              {member.generation}
            </p>
            <h1 className="text-4xl font-bold mb-1" style={{ color: fg }}>
              {member.member_name_full}
            </h1>
            <p className="text-textSecondary mb-6">{member.handle}</p>

            {/* 통계 */}
            <div className="flex flex-wrap gap-8 mb-6">
              <div>
                <p
                  className="text-2xl font-bold font-mono"
                  style={{ color: fg }}
                >
                  {member.total_songs}
                </p>
                <p className="text-textSecondary text-sm">총 영상</p>
              </div>
              <div>
                <p
                  className="text-2xl font-bold font-mono"
                  style={{ color: fg }}
                >
                  {formatViews(member.total_views)}
                </p>
                <p className="text-textSecondary text-sm">총 조회수</p>
              </div>
              <div>
                <p
                  className="text-2xl font-bold font-mono"
                  style={{ color: fg }}
                >
                  {member.cover_count}
                </p>
                <p className="text-textSecondary text-sm">커버</p>
              </div>
              <div>
                <p
                  className="text-2xl font-bold font-mono"
                  style={{ color: fg }}
                >
                  {member.original_count}
                </p>
                <p className="text-textSecondary text-sm">오리지널</p>
              </div>
            </div>

            <MemberButton
              member={memberName}
              href={`https://youtube.com/channel/${member.channel_id}`}
            >
              ▶ YouTube 채널 방문
            </MemberButton>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* 인기곡 TOP 3 */}
        {member.top3_songs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">인기곡 TOP 3</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {member.top3_songs.map((song) => (
                <SongCard key={song.video_id} song={song} />
              ))}
            </div>
          </section>
        )}

        {/* 커버곡 */}
        {covers && covers.items.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">
              커버곡
              <span className="text-sm text-textSecondary ml-2">
                ({covers.total})
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {covers.items.map((song) => (
                <SongCard key={song.video_id} song={song} />
              ))}
            </div>
          </section>
        )}

        {/* 오리지널 */}
        {originals && originals.items.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">
              오리지널
              <span className="text-sm text-textSecondary ml-2">
                ({originals.total})
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {originals.items.map((song) => (
                <SongCard key={song.video_id} song={song} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
