"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";

export interface ChartDataItem {
  label: string;
  count: number;
  fill: string;
}

interface DashboardChartProps {
  data: ChartDataItem[];
  config: ChartConfig;
}

export function DashboardChart({ data, config }: DashboardChartProps) {
  const isEmpty = data.length === 0 || data.every((item) => item.count === 0);

  if (isEmpty) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <BarChart3 className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>אין נתונים להצגה</p>
        </div>
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          allowDecimals={false}
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
          cursor={{ fill: "hsl(var(--muted))" }}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={80}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
