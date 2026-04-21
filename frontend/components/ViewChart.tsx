// components/ViewChart.tsx
"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getSongHistory, type ViewHistoryPoint } from "@/lib/api";

interface Props {
  videoId: string;
}

function formatViews(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  return n.toLocaleString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}시`;
}

export default function ViewChart({ videoId }: Props) {
  const [period, setPeriod] = useState<"7d" | "30d">("7d");
  const [data, setData] = useState<ViewHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSongHistory(videoId, period)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [videoId, period]);

  const chartData = data.map((d) => ({
    date: formatDate(d.recorded_at),
    views: d.view_count,
  }));

  return (
    <div className="glass-card p-4">
      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {(["7d", "30d"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded text-sm transition
              ${
                period === p
                  ? "bg-primary text-white"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
          >
            {p === "7d" ? "7일" : "30일"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-textSecondary text-sm">
          로딩 중...
        </div>
      ) : data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-textSecondary text-sm">
          조회수 이력이 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3D2F6E" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#9E8EC4", fontSize: 10 }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatViews}
              tick={{ fill: "#9E8EC4", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#1A1530",
                border: "1px solid #3D2F6E",
                borderRadius: "8px",
                color: "#F0EAFF",
              }}
              formatter={(value) => [formatViews(Number(value)), "조회수"]}
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#9B5DFF"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#FF6B9D" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
