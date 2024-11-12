import DashboardHeader from "@/components/DashboardHeader";
import { ForecastBarChart } from "@/components/ForecastBarChart";
import { ProductionStatusBarChart } from "@/components/ProductionStatusBarChart";
import { StatusBarChart } from "@/components/StatusBarChart";

import React, { useMemo } from "react";

interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  dateCreation: string;
  statusCategory: string;
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
          if (vehicle.esthetique) acc.esthetique++;
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
    
    const activeVehicles = vehicles.filter(v => 
      !["Stockage", "Transport retour"].includes(v.statusCategory)
    );

    const currentVehicles = activeVehicles.filter(v => 
      ["Expertise", "Client", "Magasin", "Production"].includes(v.statusCategory)
    );

    const forecastRanges = {
      "Prod actuelle": currentVehicles.length,
      "1-7 jours": 0,
      "8-14 jours": 0,
      "15-21 jours": 0,
      "22-28 jours": 0,
      "28+ jours": 0
    };

    currentVehicles.forEach(vehicle => {
      let daysToAdd = 3; 

      if (["Transport aller", "Expertise"].includes(vehicle.statusCategory)) {
        daysToAdd += 20;
      } else if (["Magasin", "Client"].includes(vehicle.statusCategory)) {
        daysToAdd += 15;
      } else if (vehicle.statusCategory === "Production") {
        if (vehicle.mecanique && vehicle.carrosserie && vehicle.dsp && vehicle.jantes) {
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
      vehicles: count
    }));
  }, [vehicles]);

  return (
    <div className="h-[650px] rounded-l-lg border bg-primary pb-8 2xl:h-[800px]">
      <DashboardHeader title="Graphiques" />
      <div className="px-8 py-4">
        <p>
          Dernière synchronisation:{" "}
          <span className="font-medium">
            {syncDate
              ? `${syncDate.toLocaleDateString()} - ${syncDate.toLocaleTimeString()}`
              : "Chargement..."}
          </span>
        </p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-8 px-8">
        <StatusBarChart vehiclesByStatus={vehiclesByStatus} />
        <ProductionStatusBarChart
          productionCounts={getStatusCounts}
          productionVehiclesCount={productionVehiclesCount}
        />
        <ForecastBarChart forecastData={getForecastData} />
      </div>
    </div>
  );
};

export default AdminData;
