import { Bar, BarChart, CartesianGrid, LabelList, XAxis, Cell } from "recharts";
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
      color: "rgb(51, 65, 85)",
    },
  };

  const getBarColor = (range: string) => {
    switch (range) {
      case "Prod actuelle":
        return "#0a0a0a"; 
      case "1-7 jours":
        return "#262626"; 
      case "8-14 jours":
        return "#404040"; 
      case "15-21 jours":
        return "#525252"; 
      case "22-28 jours":
        return "#737373"; 
      case "28+ jours":
        return "#a3a3a3"; 
      default:
        return "#334155"; 
    }
  };

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle className="text-slate-900">Estimation des Livraisons</CardTitle>
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
            <CartesianGrid 
              vertical={false} 
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="range"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: "#475569" }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar 
              dataKey="vehicles" 
              radius={8}
            >
              {forecastData.map((entry) => (
                <Cell 
                  key={`cell-${entry.range}`} 
                  fill={getBarColor(entry.range)} 
                />
              ))}
              <LabelList
                position="top"
                offset={12}
                fill="#334155"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 