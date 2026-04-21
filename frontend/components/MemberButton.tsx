// components/MemberButton.tsx
"use client";

import { MEMBER_BTN_COLORS, isMemberName } from "@/lib/memberColors";

interface Props {
  member: string;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function MemberButton({
  member,
  href,
  onClick,
  children,
  className = "",
}: Props) {
  const colors = isMemberName(member) ? MEMBER_BTN_COLORS[member] : null;
  const [bg, fg] = colors ?? ["#1A1530", "#9B5DFF"];

  const style = {
    backgroundColor: bg,
    color: fg,
    border: `1px solid ${fg}33`,
  };

  const cls = `inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
    text-sm font-semibold transition-all duration-200 hover:opacity-80 ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        className={cls}
      >
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} style={style} className={cls}>
      {children}
    </button>
  );
}
