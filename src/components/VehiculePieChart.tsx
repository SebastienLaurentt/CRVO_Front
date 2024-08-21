"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as React from "react";
import { Label, Pie, PieChart, Tooltip } from "recharts";

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
    { name: "Véhicules en cours", value: ongoing, fill: "#0ea5e9" },
    { name: "Véhicules terminés", value: completed, fill: "#3b82f6" },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Répartition des véhicules</CardTitle>
        <CardDescription> {today}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <PieChart width={400} height={400}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
            fill="#000"
            label
          >
            <Label value={` ${total}`} position="center" className="text-slate-600"/>
          </Pie>
          <Tooltip />
        </PieChart>
      </CardContent>
      <CardFooter className="flex-col gap-1 font-semibold">
        <div>En cours: {ongoing}</div>
        <div>Terminés {completed}</div>
      </CardFooter>
    </Card>
  );
};
