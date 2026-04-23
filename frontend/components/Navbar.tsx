// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MEMBER_NAMES,
  MEMBER_BTN_COLORS,
  isMemberName,
} from "@/lib/memberColors";

const NAV_ITEMS = [
  { href: "/songs", label: "전체 곡" },
  { href: "/generations", label: "기수별" },
  { href: "/chart", label: "차트" },
  { href: "/search", label: "검색" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 bg-bgDark/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex flex-col shrink-0">
          <span
            className="font-bold text-3xl tracking-tight leading-tight"
            style={{
              background: "linear-gradient(135deg, #9B5DFF, #FF6B9D)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            StelLive
          </span>
          <span className="text-xs text-textSecondary font-medium tracking-widest uppercase">
            Music Hub
          </span>
        </Link>

        {/* 메인 메뉴 */}
        <div className="flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xl font-semibold transition-all duration-200 pb-1"
              style={
                pathname === item.href
                  ? {
                      color: "#9B5DFF",
                      borderBottom: "2px solid #9B5DFF",
                    }
                  : {
                      color: "#9E8EC4",
                      borderBottom: "2px solid transparent",
                    }
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 멤버 드롭다운 */}
        <div className="relative group">
          <button
            className="text-xl font-semibold transition-all duration-200
              text-textSecondary hover:text-textPrimary"
          >
            멤버
          </button>
          <div
            className="absolute right-0 top-full mt-2 w-36 glass-card py-2
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200"
          >
            {MEMBER_NAMES.map((name) => {
              const colors = isMemberName(name)
                ? MEMBER_BTN_COLORS[name]
                : null;
              const [bg, fg] = colors ?? ["#1A1530", "#9B5DFF"];
              return (
                <Link
                  key={name}
                  href={`/members/${encodeURIComponent(name)}`}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition"
                >
                  <span
                    style={{
                      color: fg,
                      backgroundColor: bg,
                      border: `1px solid ${fg}44`,
                      padding: "1px 8px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
