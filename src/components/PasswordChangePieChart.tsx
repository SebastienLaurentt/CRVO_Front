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
import { Pie, PieChart, Tooltip } from "recharts";

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
    { name: "Mot de passe changé", value: usersWithPasswordChanged, fill: "#34d399" }, // Vert
    { name: "Mot de passe non changé", value: usersWithoutPasswordChanged, fill: "#f87171" }, // Rouge
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Statut des mots de passe</CardTitle>
        <CardDescription>{today}</CardDescription>
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
          ></Pie>
          <Tooltip />
        </PieChart>
      </CardContent>
      <CardFooter className="flex-col gap-1 font-semibold">
        <div>Mot de passe changé: {usersWithPasswordChanged}</div>
        <div>Mot de passe non changé: {usersWithoutPasswordChanged}</div>
      </CardFooter>
    </Card>
  );
};
