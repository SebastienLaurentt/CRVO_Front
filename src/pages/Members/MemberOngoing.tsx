import DashboardHeader from "@/components/DashboardHeader";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BadgeCheck, CalendarClock, ChartArea } from "lucide-react";
import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Vehicle } from "../../App";

interface MemberOngoingProps {
  vehicles: Vehicle[] | undefined;
  isLoadingVehicles: boolean;
  isErrorVehicles: boolean;
  errorVehicles: Error | null;
  syncDate: Date | null | undefined;
}

const daysSince = (dateString: string): number => {
  const creationDate = new Date(dateString);
  const today = new Date();
  const timeDiff = today.getTime() - creationDate.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

const MemberOngoing: React.FC<MemberOngoingProps> = ({
  vehicles,
  isLoadingVehicles,
  isErrorVehicles,
  errorVehicles,
  syncDate,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Production");

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles
      .filter((vehicle) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          vehicle.immatriculation.toLowerCase().includes(searchLower) ||
          vehicle.modele.toLowerCase().includes(searchLower);

        const matchesStatus =
          statusFilter === "Tous"
            ? true
            : statusFilter
            ? vehicle.statusCategory === statusFilter
            : true;

        const matchesActiveFilter =
          (activeFilter === "dsp" && vehicle.dsp) ||
          (activeFilter === "mecanique" && vehicle.mecanique) ||
          (activeFilter === "jantes" && vehicle.jantes) ||
          (activeFilter === "ct" && vehicle.ct) ||
          (activeFilter === "carrosserie" && vehicle.carrosserie) ||
          (activeFilter === "esthetique" && vehicle.esthetique) ||
          !activeFilter;

        return matchesSearch && matchesStatus && matchesActiveFilter;
      })
      .map((vehicle) => ({
        ...vehicle,
        daySinceStatut: Math.floor(vehicle.daySinceStatut || 0),
      }))
      .sort((a, b) => daysSince(b.dateCreation) - daysSince(a.dateCreation));
  }, [vehicles, searchQuery, statusFilter, activeFilter]);

  const vehicleCountByStatus = useMemo(() => {
    if (!vehicles) return {};
    const counts = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.statusCategory] = (acc[vehicle.statusCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    counts["Tous"] = vehicles.length;

    return counts;
  }, [vehicles]);

  const exportToExcel = () => {
    if (!vehicles || !syncDate) return;

    const workbook = XLSX.utils.book_new();

    const data = vehicles.map((vehicle) => ({
      Immatriculation: vehicle.immatriculation,
      Modèle: vehicle.modele,
      Statut: vehicle.statusCategory,
      "Jours depuis Création": daysSince(vehicle.dateCreation),
      "Jours depuis dernier statut": vehicle.daySinceStatut || 0,
      DSP: vehicle.dsp ? "En cours" : "Fait",
      Mécanique: vehicle.mecanique ? "En cours" : "Fait",
      Jantes: vehicle.jantes ? "En cours" : "Fait",
      CT: vehicle.ct ? "En cours" : "Fait",
      Carrosserie: vehicle.carrosserie ? "En cours" : "Fait",
      Esthétique: vehicle.esthetique ? "En cours" : "Fait",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Rénovations");

    const formattedDate = syncDate
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .split("/")
      .join("");

    XLSX.writeFile(workbook, `RenovationsCRVO_${formattedDate}.xlsx`);
  };

  const handleSwitchChange = (filter: string) => {
    setActiveFilter(activeFilter === filter ? "" : filter);
  };

  const isProductionSelected = statusFilter === "Production";

  const statusOrder = [
    "Tous",
    "Transport aller",
    "Expertise",
    "Client",
    "Magasin",
    "Production",
    "Stockage",
    "Transport retour",
    "Livraison",
  ];

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

  return (
    <div className="flex-1 rounded-l-lg border bg-primary pb-8">
      <DashboardHeader
        title="Rénovations en Cours"
        count={
          vehicles?.filter((v) =>
            ["Magasin", "Client", "Production", "Expertise"].includes(
              v.statusCategory
            )
          ).length || 0
        }
      />
      <div className="flex flex-col space-y-3 px-8 py-4">
        <p>
          Dernière synchronisation:{" "}
          <span className="font-medium">
            {syncDate
              ? `${syncDate.toLocaleDateString()} - ${syncDate.toLocaleTimeString()}`
              : "Chargement..."}
          </span>
        </p>
        <div className="flex flex-col space-y-2">
          <div className="flex flex-row space-x-1">
            {statusOrder.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "secondary" : "outline"}
                onClick={() => setStatusFilter(status)}
              >
                {status} ({vehicleCountByStatus[status] || 0})
              </Button>
            ))}
          </div>
          <div className="flex flex-row space-x-2">
            <Input
              placeholder="Recherche"
              className="w-[250px] text-sm"
              value={searchQuery}
              hasSearchIcon
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="space-x-[5px]" onClick={exportToExcel}>
              <ChartArea size={20} />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-[400px] w-full overflow-y-auto px-8 2xl:h-[500px]">
          <table className="w-full table-fixed">
            <thead className="sticky top-0 z-10 bg-background">
              <tr className="border-b text-left">
                <th className="w-[12%] px-2 py-3 2xl:px-6">Immatriculation</th>
                <th className="w-[12%] px-2 py-3 2xl:px-6">Modèle</th>
                <th className="w-[10%] px-2 py-3 text-center 2xl:px-6">
                  Jours de rénovation
                </th>
                <th className="w-[10%] px-2 py-3 text-center 2xl:px-6">
                  Jours depuis dernier statut
                </th>
                {isProductionSelected && (
                  <>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm">({getStatusCounts.dsp})</span>
                        <span>DSP</span>
                        <Switch
                          checked={activeFilter === "dsp"}
                          onCheckedChange={() => handleSwitchChange("dsp")}
                        />
                      </div>
                    </th>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm">
                          ({getStatusCounts.mecanique})
                        </span>
                        <span>Mécanique</span>
                        <Switch
                          checked={activeFilter === "mecanique"}
                          onCheckedChange={() =>
                            handleSwitchChange("mecanique")
                          }
                        />
                      </div>
                    </th>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm">
                          ({getStatusCounts.jantes})
                        </span>
                        <span>Jantes</span>
                        <Switch
                          checked={activeFilter === "jantes"}
                          onCheckedChange={() => handleSwitchChange("jantes")}
                        />
                      </div>
                    </th>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm">({getStatusCounts.ct})</span>
                        <span>CT</span>
                        <Switch
                          checked={activeFilter === "ct"}
                          onCheckedChange={() => handleSwitchChange("ct")}
                        />
                      </div>
                    </th>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm">
                          ({getStatusCounts.carrosserie})
                        </span>
                        <span>Carrosserie</span>
                        <Switch
                          checked={activeFilter === "carrosserie"}
                          onCheckedChange={() =>
                            handleSwitchChange("carrosserie")
                          }
                        />
                      </div>
                    </th>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm">
                          ({getStatusCounts.esthetique})
                        </span>
                        <span>Esthétique</span>
                        <Switch
                          checked={activeFilter === "esthetique"}
                          onCheckedChange={() =>
                            handleSwitchChange("esthetique")
                          }
                        />
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoadingVehicles ? (
                <tr>
                  <td
                    colSpan={isProductionSelected ? 10 : 4}
                    className="py-20 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : isErrorVehicles ? (
                <tr>
                  <td
                    colSpan={isProductionSelected ? 10 : 4}
                    className="py-8 text-center"
                  >
                    Error:{" "}
                    {errorVehicles instanceof Error
                      ? errorVehicles.message
                      : "Unknown error"}
                  </td>
                </tr>
              ) : filteredVehicles && filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle: Vehicle) => (
                  <tr key={vehicle._id} className="border-b last:border-b-0">
                    <td className="px-2 py-4 2xl:px-6">
                      {vehicle.immatriculation}
                    </td>
                    <td className="px-2 py-4 2xl:px-6">{vehicle.modele}</td>
                    <td className="px-2 py-4 text-center 2xl:px-4">
                      {daysSince(vehicle.dateCreation)}
                    </td>
                    <td className="px-2 py-4 text-center 2xl:px-4">
                      {vehicle.daySinceStatut || 0}
                    </td>
                    {isProductionSelected && (
                      <>
                        <td className="p-4 text-center">
                          {vehicle.dsp ? (
                            <CalendarClock className="inline-block text-[#fbbf24]" />
                          ) : (
                            <BadgeCheck className="inline-block text-[#16a34a]" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {vehicle.mecanique ? (
                            <CalendarClock className="inline-block text-[#fbbf24]" />
                          ) : (
                            <BadgeCheck className="inline-block text-[#16a34a]" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {vehicle.jantes ? (
                            <CalendarClock className="inline-block text-[#fbbf24]" />
                          ) : (
                            <BadgeCheck className="inline-block text-[#16a34a]" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {vehicle.ct ? (
                            <CalendarClock className="inline-block text-[#fbbf24]" />
                          ) : (
                            <BadgeCheck className="inline-block text-[#16a34a]" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {vehicle.carrosserie ? (
                            <CalendarClock className="inline-block text-[#fbbf24]" />
                          ) : (
                            <BadgeCheck className="inline-block text-[#16a34a]" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {vehicle.esthetique && (
                            <CalendarClock className="inline-block text-[#fbbf24]" />
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={isProductionSelected ? 10 : 4}
                    className="pt-8 text-center font-medium"
                  >
                    Aucun véhicule pour ce statut actuellement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberOngoing;
