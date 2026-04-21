// lib/memberColors.ts

export type MemberName =
  | "유니"
  | "후야"
  | "히나"
  | "마시로"
  | "리제"
  | "타비"
  | "시부키"
  | "린"
  | "나나"
  | "리코";

export const MEMBER_TEXT_COLORS: Record<MemberName, string> = {
  유니: "#1a0a4a",
  후야: "#f0e6ff",
  히나: "#2d0000",
  마시로: "#ffffff",
  리제: "#ffbbbb",
  타비: "#0a2040",
  시부키: "#1a0040",
  린: "#ffffff",
  나나: "#3d0015",
  리코: "#002a1a",
};

export const MEMBER_BADGE_COLORS: Record<MemberName, [string, string]> = {
  유니: ["rgba(26,10,74,0.2)", "#1a0a4a"],
  후야: ["rgba(255,255,255,0.15)", "#f0e6ff"],
  히나: ["rgba(45,0,0,0.2)", "#2d0000"],
  마시로: ["rgba(255,255,255,0.15)", "#ffffff"],
  리제: ["rgba(255,187,187,0.15)", "#ffbbbb"],
  타비: ["rgba(10,32,64,0.2)", "#0a2040"],
  시부키: ["rgba(26,0,64,0.2)", "#1a0040"],
  린: ["rgba(255,255,255,0.15)", "#ffffff"],
  나나: ["rgba(61,0,21,0.2)", "#3d0015"],
  리코: ["rgba(0,42,26,0.2)", "#002a1a"],
};

export const MEMBER_BTN_COLORS: Record<MemberName, [string, string]> = {
  유니: ["#1a0a4a", "#d4c8ff"],
  후야: ["#2d1a4a", "#e8d5ff"],
  히나: ["#2d0000", "#ffd0c8"],
  마시로: ["#111314", "#cccccc"],
  리제: ["#1a0000", "#ff9999"],
  타비: ["#0a2040", "#c8eaff"],
  시부키: ["#1a0040", "#e8d0ff"],
  린: ["#041030", "#b0d0ff"],
  나나: ["#3d0015", "#ffd0dd"],
  리코: ["#002a1a", "#a0e8c8"],
};

export const MEMBER_NAMES: MemberName[] = [
  "유니",
  "후야",
  "히나",
  "마시로",
  "리제",
  "타비",
  "시부키",
  "린",
  "나나",
  "리코",
];

export const MEMBER_GENERATIONS: Record<string, MemberName[]> = {
  "1기 EVERYS": ["유니", "후야"],
  "2기 UNIVERSE": ["히나", "마시로", "리제", "타비"],
  "3기 cliché": ["시부키", "린", "나나", "리코"],
};

export function isMemberName(name: string): name is MemberName {
  return MEMBER_NAMES.includes(name as MemberName);
}
