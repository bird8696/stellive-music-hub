// components/MemberBadge.tsx
"use client";

import { MEMBER_BADGE_COLORS, isMemberName } from "@/lib/memberColors";

interface Props {
  member: string;
  active?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function MemberBadge({
  member,
  active = true,
  clickable = false,
  onClick,
  className = "",
}: Props) {
  const colors = isMemberName(member) ? MEMBER_BADGE_COLORS[member] : null;
  const [bg, fg] = colors ?? ["rgba(155,93,255,0.2)", "#9B5DFF"];

  const baseStyle = {
    backgroundColor: active ? bg : "rgba(255,255,255,0.05)",
    color: active ? fg : "#9E8EC4",
    border: `1px solid ${active ? fg + "44" : "#3D2F6E"}`,
  };

  if (clickable) {
    return (
      <button
        onClick={onClick}
        style={baseStyle}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200
          hover:opacity-80 ${className}`}
      >
        {member}
      </button>
    );
  }

  return (
    <span
      style={baseStyle}
      className={`px-3 py-1 rounded-full text-xs font-semibold ${className}`}
    >
      {member}
    </span>
  );
}
