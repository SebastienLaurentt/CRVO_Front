import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface VehiculePieChartProps {
  total: number;
  completed: number;
  ongoing: number;
}

export const VehiculePieChart: React.FC<VehiculePieChartProps> = ({
  total,
  completed,
  ongoing,
}) => {
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const chartData = [
    { name: "Rénovations en cours", value: ongoing, fill: "#0ea5e9" },
    { name: "Rénovations terminées", value: completed, fill: "#3b82f6" },
  ];

  const chartConfig = {
    ongoing: {
      label: "Rénovations en cours",
      color: "hsl(var(--chart-1))",
    },
    completed: {
      label: "Rénovations terminées",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Type de rénovations</CardTitle>
        <CardDescription>{today}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square size-[250px] 2xl:size-[350px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div>
          En cours: <span className="font-bold">{ongoing}</span>
        </div>
        <div>
          Terminés: <span className="font-bold">{completed}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
