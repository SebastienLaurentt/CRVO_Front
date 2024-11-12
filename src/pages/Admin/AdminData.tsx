import { AverageDatesRadialChart } from "@/components/AverageDatesRadialChart";
import DashboardHeader from "@/components/DashboardHeader";
import { ForecastBarChart } from "@/components/ForecastBarChart";
import { ProductionStatusBarChart } from "@/components/ProductionStatusBarChart";
import { StatusBarChart } from "@/components/StatusBarChart";
import { StatusProgressRadialChart } from "@/components/StatusProgressRadialChart";


import React, { useMemo } from "react";

interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  dateCreation: string;
  statusCategory: string;
  daySinceStatut: number;
  user: {
    username: string;
  };
  mecanique: boolean;
  carrosserie: boolean;
  ct: boolean;
  dsp: boolean;
  jantes: boolean;
  esthetique: boolean;
}

interface AdminDataProps {
  vehicles: Vehicle[] | undefined;
  isLoadingVehicles: boolean;
  isErrorVehicles: boolean;
  errorVehicles: Error | null;
  syncDate: Date | null | undefined;
}

const AdminData: React.FC<AdminDataProps> = ({ vehicles, syncDate }) => {
  const vehiclesByStatus = useMemo(() => {
    if (!vehicles) return {};
    return vehicles.reduce((acc, vehicle) => {
      acc[vehicle.statusCategory] = (acc[vehicle.statusCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [vehicles]);

  const getStatusCounts = useMemo(() => {
    if (!vehicles)
      return {
        dsp: 0,
        mecanique: 0,
        jantes: 0,
        ct: 0,
        carrosserie: 0,
        esthetique: 0,
      };

    return vehicles.reduce(
      (acc, vehicle) => {
        if (vehicle.statusCategory === "Production") {
          if (vehicle.dsp) acc.dsp++;
          if (vehicle.mecanique) acc.mecanique++;
          if (vehicle.jantes) acc.jantes++;
          if (vehicle.ct) acc.ct++;
          if (vehicle.carrosserie) acc.carrosserie++;
          if (!vehicle.dsp && !vehicle.mecanique && !vehicle.jantes && !vehicle.ct && !vehicle.carrosserie && vehicle.esthetique) {
            acc.esthetique++;
          }
        }
        return acc;
      },
      { dsp: 0, mecanique: 0, jantes: 0, ct: 0, carrosserie: 0, esthetique: 0 }
    );
  }, [vehicles]);

  const productionVehiclesCount = useMemo(
    () =>
      vehicles?.filter((v) => v.statusCategory === "Production").length || 0,
    [vehicles]
  );

  const getForecastData = useMemo(() => {
    if (!vehicles) return [];

    const activeVehicles = vehicles.filter(
      (v) => !["Stockage", "Transport retour"].includes(v.statusCategory)
    );

    const currentVehicles = activeVehicles.filter((v) =>
      ["Expertise", "Client", "Magasin", "Production"].includes(
        v.statusCategory
      )
    );

    const forecastRanges = {
      "Prod actuelle": currentVehicles.length,
      "1-7 jours": 0,
      "8-14 jours": 0,
      "15-21 jours": 0,
      "22-28 jours": 0,
      "28+ jours": 0,
    };

    currentVehicles.forEach((vehicle) => {
      let daysToAdd = 3;

      if (["Transport aller", "Expertise"].includes(vehicle.statusCategory)) {
        daysToAdd += 20;
      } else if (["Magasin", "Client"].includes(vehicle.statusCategory)) {
        daysToAdd += 15;
      } else if (vehicle.statusCategory === "Production") {
        if (
          vehicle.mecanique &&
          vehicle.carrosserie &&
          vehicle.dsp &&
          vehicle.jantes
        ) {
          daysToAdd += 10;
        } else if (vehicle.mecanique && vehicle.carrosserie && vehicle.dsp) {
          daysToAdd += 7;
        } else if (vehicle.mecanique && vehicle.carrosserie) {
          daysToAdd += 5;
        } else if (vehicle.mecanique && vehicle.jantes && vehicle.dsp) {
          daysToAdd += 7;
        } else if (vehicle.mecanique && vehicle.dsp) {
          daysToAdd += 4;
        } else if (vehicle.mecanique && vehicle.jantes) {
          daysToAdd += 4;
        } else if (vehicle.mecanique) {
          daysToAdd += 1;
        } else if (vehicle.esthetique) {
          daysToAdd += 1;
        }
      }

      if (daysToAdd <= 7) forecastRanges["1-7 jours"]++;
      else if (daysToAdd <= 14) forecastRanges["8-14 jours"]++;
      else if (daysToAdd <= 21) forecastRanges["15-21 jours"]++;
      else if (daysToAdd <= 28) forecastRanges["22-28 jours"]++;
      else forecastRanges["28+ jours"]++;
    });

    return Object.entries(forecastRanges).map(([range, count]) => ({
      range,
      vehicles: count,
    }));
  }, [vehicles]);

  const daysSince = (dateString: string): number => {
    const creationDate = new Date(dateString);
    const today = new Date();
    const timeDiff = today.getTime() - creationDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  };

  const getAverageDates = useMemo(() => {
    if (!vehicles) return { active: 0, inactive: 0 };

    const activeVehicles = vehicles.filter((v) =>
      ["Production", "Magasin", "Expertise", "Client"].includes(
        v.statusCategory
      )
    );

    const activeAvg =
      activeVehicles.length > 0
        ? activeVehicles.reduce(
            (sum, v) => sum + daysSince(v.dateCreation),
            0
          ) / activeVehicles.length
        : 0;

    return {
      active: Math.round(activeAvg),
      inactive: 16,
    };
  }, [vehicles]);

  const getStatusProgress = useMemo(() => {
    if (!vehicles) return { active: 0, inactive: 0 };

    const activeVehicles = vehicles.filter((v) =>
      ["Production", "Magasin", "Expertise", "Client"].includes(v.statusCategory)
    );

    const inactiveVehicles = vehicles.filter((v) =>
      ["Stockage", "Transport retour"].includes(v.statusCategory)
    );

    const activeAvg = activeVehicles.length > 0
      ? activeVehicles.reduce((sum, v) => sum + (v.daySinceStatut || 0), 0) / activeVehicles.length
      : 0;

    const inactiveAvg = inactiveVehicles.length > 0
      ? inactiveVehicles.reduce((sum, v) => sum + (v.daySinceStatut || 0), 0) / inactiveVehicles.length
      : 0;

    return {
      active: Math.round(activeAvg),
      inactive: Math.round(inactiveAvg),
    };
  }, [vehicles]);

  return (
    <div className="rounded-l-lg border bg-primary pb-8">
      <DashboardHeader title="Graphiques" />
      <div className="px-8 py-4">
        <p>
          Dernière synchronisation:{" "}
          <span className="font-medium">
            {syncDate
              ? `${syncDate.toLocaleDateString()} - ${syncDate.toLocaleTimeString()}`
              : "Chargement.."}
          </span>
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-8 px-8">
        <StatusBarChart vehiclesByStatus={vehiclesByStatus} />
        <ProductionStatusBarChart
          productionCounts={getStatusCounts}
          productionVehiclesCount={productionVehiclesCount}
        />
        <AverageDatesRadialChart averageDates={getAverageDates} />
        <StatusProgressRadialChart progress={getStatusProgress} />
        <ForecastBarChart forecastData={getForecastData}  />
      </div>
    </div>
  );
};

export default AdminData;
