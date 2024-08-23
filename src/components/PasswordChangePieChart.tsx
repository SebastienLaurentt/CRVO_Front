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

interface PasswordChangePieChartProps {
  usersWithPasswordChanged: number;
  usersWithoutPasswordChanged: number;
}

export const PasswordChangePieChart: React.FC<PasswordChangePieChartProps> = ({
  usersWithPasswordChanged,
  usersWithoutPasswordChanged,
}) => {
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const chartData = [
    {
      name: "Mot de passe changé",
      value: usersWithPasswordChanged,
      fill: "#065f46",
    },
    {
      name: "Mot de passe non changé",
      value: usersWithoutPasswordChanged,
      fill: "#ef4444",
    },
  ];

  const totalUsers = usersWithPasswordChanged + usersWithoutPasswordChanged;

  const chartConfig = {
    passwordChanged: {
      label: "Mot de passe changé",
      color: "hsl(var(--chart-1))",
    },
    passwordNotChanged: {
      label: "Mot de passe non changé",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Gestion des mots de passe</CardTitle>
        <CardDescription>{today}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square size-[250px] 2xl:size-[350px]"
        >
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
                          {totalUsers.toLocaleString()}
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
      <CardFooter className="flex-col gap-1 ">
        <div>
          Mot de passe changé:{" "}
          <span className="font-bold"> {usersWithPasswordChanged}</span>
        </div>
        <div>
          Mot de passe non changé:{" "}
          <span className="font-bold">{usersWithoutPasswordChanged}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
