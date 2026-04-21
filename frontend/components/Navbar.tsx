// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MEMBER_NAMES } from "@/lib/memberColors";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/chart", label: "차트", icon: "🏆" },
  { href: "/search", label: "검색", icon: "🔍" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 bg-bgDark/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <span
            className="font-bold text-lg"
            style={{
              background: "linear-gradient(135deg, #9B5DFF, #FF6B9D)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            StelLive
          </span>
        </Link>

        {/* 메인 메뉴 */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition
                ${
                  pathname === item.href
                    ? "bg-primary/20 text-primary"
                    : "text-textSecondary hover:text-textPrimary hover:bg-white/5"
                }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* 멤버 드롭다운 */}
        <div className="relative group">
          <button
            className="px-3 py-1.5 rounded-lg text-sm font-semibold
            text-textSecondary hover:text-textPrimary hover:bg-white/5 transition"
          >
            👥 멤버
          </button>
          <div
            className="absolute right-0 top-full mt-1 w-36 glass-card py-2
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200"
          >
            {MEMBER_NAMES.map((name) => (
              <Link
                key={name}
                href={`/members/${encodeURIComponent(name)}`}
                className="block px-4 py-2 text-sm text-textSecondary
                  hover:text-textPrimary hover:bg-white/5 transition"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
