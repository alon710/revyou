"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { StatusDistribution } from "@/hooks/useDashboardStats";

interface ReviewsStatusChartProps {
  data: StatusDistribution[];
}

const chartConfig = {
  count: {
    label: "כמות",
  },
  pending: {
    label: "ממתין",
    color: "hsl(var(--chart-1))",
  },
  posted: {
    label: "פורסם",
    color: "hsl(var(--chart-2))",
  },
  rejected: {
    label: "נדחה",
    color: "hsl(var(--chart-3))",
  },
  failed: {
    label: "נכשל",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function ReviewsStatusChart({ data }: ReviewsStatusChartProps) {
  // Transform data to include fill color based on status
  const chartData = data.map((item) => {
    const config = chartConfig[item.status as keyof typeof chartConfig];
    return {
      ...item,
      fill: config && "color" in config ? config.color : "hsl(var(--chart-1))",
    };
  });

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={chartData} accessibilityLayer>
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
        <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={80} />
      </BarChart>
    </ChartContainer>
  );
}
