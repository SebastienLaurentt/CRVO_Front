"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

const statusColors = {
  Livraison: "hsl(204, 93%, 60%)",
  "Transport aller": "hsl(204, 70%, 55%)",
  Expertise: "hsl(204, 94%, 45%)",
  Client: "hsl(204, 100%, 40%)",
  Magasin: "hsl(204, 86%, 35%)",
  Production: "hsl(204, 84%, 30%)",
  Stockage: "hsl(204, 77%, 25%)",
  "Transport retour": "hsl(204, 70%, 20%)",
};

interface StatusBarChartProps {
  vehiclesByStatus: Record<string, number>;
}

export function StatusBarChart({ vehiclesByStatus }: StatusBarChartProps) {
  const chartData = Object.entries(vehiclesByStatus)
    .filter(([status]) => status !== "Tous")
    .map(([status, count]) => ({
      status,
      count,
      fill: statusColors[status as keyof typeof statusColors],
    }));

  const chartConfig = Object.fromEntries(
    Object.entries(statusColors).map(([status, color]) => [
      status,
      { label: status, color },
    ])
  ) as ChartConfig;

  const totalVehicles = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Statuts des Rénovations</CardTitle>
        <CardDescription> {totalVehicles} véhicules</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              left: -20,
              right: 20,
              top: 20,
              bottom: 20,
            }}
          >
            <YAxis
              dataKey="status"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={120}
            />
            <XAxis
              type="number"
              hide
              domain={[0, (dataMax: number) => dataMax * 2.5]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="count"
              radius={4}
              fill="hsl(217, 91%, 60%)"
              barSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
