import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ForecastData {
  range: string;
  vehicles: number;
}

interface ForecastBarChartProps {
  forecastData: ForecastData[];
}

export function ForecastBarChart({ forecastData }: ForecastBarChartProps) {
  const chartConfig = {
    vehicles: {
      label: "Véhicules",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Estimation des Livraisons</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <BarChart
            data={forecastData}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="range"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="vehicles" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 