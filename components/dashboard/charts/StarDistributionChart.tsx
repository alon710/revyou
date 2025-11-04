"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { StarDistribution } from "@/hooks/useDashboardStats";

interface StarDistributionChartProps {
  data: StarDistribution[];
}

const chartConfig = {
  count: {
    label: "כמות",
  },
  1: {
    label: "כוכב 1",
    color: "hsl(var(--chart-1))",
  },
  2: {
    label: "כוכבים 2",
    color: "hsl(var(--chart-2))",
  },
  3: {
    label: "כוכבים 3",
    color: "hsl(var(--chart-3))",
  },
  4: {
    label: "כוכבים 4",
    color: "hsl(var(--chart-4))",
  },
  5: {
    label: "כוכבים 5",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function StarDistributionChart({ data }: StarDistributionChartProps) {
  // Transform data to include fill color based on star rating
  const chartData = data.map((item) => {
    const config = chartConfig[item.stars as keyof typeof chartConfig];
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
