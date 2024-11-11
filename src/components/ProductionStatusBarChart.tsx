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

const productionStatusColors = {
  dsp: "hsl(166, 76%, 60%)",         
  mecanique: "hsl(166, 67%, 53%)",    
  jantes: "hsl(166, 64%, 45%)",       
  ct: "hsl(166, 72%, 38%)",           
  carrosserie: "hsl(166, 72%, 31%)",  
  esthetique: "hsl(166, 76%, 25%)",   
};

const productionStatusLabels = {
  dsp: "DSP",
  mecanique: "Mécanique",
  jantes: "Jantes",
  ct: "CT",
  carrosserie: "Carrosserie",
  esthetique: "Esthétique",
};

interface ProductionStatusBarChartProps {
  productionCounts: {
    dsp: number;
    mecanique: number;
    jantes: number;
    ct: number;
    carrosserie: number;
    esthetique: number;
  };
  productionVehiclesCount: number;
}

export function ProductionStatusBarChart({ productionCounts, productionVehiclesCount }: ProductionStatusBarChartProps) {
  const chartData = Object.entries(productionCounts).map(([status, count]) => ({
    status: productionStatusLabels[status as keyof typeof productionStatusLabels],
    count,
    fill: productionStatusColors[status as keyof typeof productionStatusColors],
  }));

  const chartConfig = Object.fromEntries(
    Object.entries(productionStatusColors).map(([status, color]) => [
      productionStatusLabels[status as keyof typeof productionStatusLabels],
      { label: productionStatusLabels[status as keyof typeof productionStatusLabels], color },
    ])
  ) as ChartConfig;

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Statuts en Production</CardTitle>
        <CardDescription>{productionVehiclesCount} véhicules en attente</CardDescription>
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