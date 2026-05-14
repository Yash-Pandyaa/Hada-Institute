"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export function RevenueChart({
  data,
}: {
  data: { label: string; revenue: number }[];
}) {
  const chartData =
    data.length > 0
      ? data
      : [
          { label: "M-5", revenue: 0 },
          { label: "M-4", revenue: 0 },
          { label: "M-3", revenue: 0 },
          { label: "M-2", revenue: 0 },
          { label: "M-1", revenue: 0 },
          { label: "Now", revenue: 0 },
        ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} />
          <YAxis
            tickFormatter={(value) =>
              formatCurrency(Number(value)).replace(".00", "")
            }
            tickLine={false}
            width={88}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
          />
          <Bar dataKey="revenue" fill="#0f766e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
