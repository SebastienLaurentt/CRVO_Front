import {
  LabelList,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

interface StatusProgressRadialChartProps {
  progress: {
    active: number;
    inactive: number;
  };
}

export const StatusProgressRadialChart: React.FC<StatusProgressRadialChartProps> = ({
  progress,
}) => {
  const chartData = [
    {
      renovation: progress.active,
      stock: progress.inactive,
    },
  ];

  return (
    <div className="flex flex-col rounded-lg border bg-card p-4">
      <h3 className="mb-8 text-center text-lg font-semibold">
        Jours moyens rénovations - dernier statut
      </h3>
      <div className="flex flex-1 items-center justify-center">
        <RadialBarChart
          width={300}
          height={200}
          data={chartData}
          innerRadius={80}
          outerRadius={130}
          startAngle={180}
          endAngle={0}
        >
          <PolarRadiusAxis tick={false} axisLine={false} />
          <RadialBar
            dataKey="renovation"
            stackId="stack"
            fill="#38bdf8"
            cornerRadius={5}
            className="stroke-transparent stroke-2"
          >
            <LabelList
              dataKey="renovation"
              position="outside"
              formatter={(value: number) => `${Math.round(value)} j`}
              offset={10}
            />
          </RadialBar>
          <RadialBar
            dataKey="stock"
            stackId="stack"
            fill="#075985"
            cornerRadius={5}
            className="stroke-transparent stroke-2"
          >
            <LabelList
              dataKey="stock"
              position="outside"
              formatter={(value: number) => `${Math.round(value)} j`}
              offset={8}
            />
          </RadialBar>
        </RadialBarChart>
      </div>
      <div className="flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-[#38bdf8]" />
          <span>Véhicules en rénovation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-[#075985]" />
          <span>Véhicules stockés</span>
        </div>
      </div>
    </div>
  );
}; 