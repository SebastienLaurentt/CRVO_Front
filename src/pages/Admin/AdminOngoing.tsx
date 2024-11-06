import DashboardHeader from "@/components/DashboardHeader";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AudioLines,
  BadgeCheck,
  CalendarClock,
  Car,
  LifeBuoy,
  ShieldCheck,
  SprayCan,
  Wrench,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Vehicle } from "../../App";

interface AdminOngoingProps {
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

const AdminOngoing: React.FC<AdminOngoingProps> = ({
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
          vehicle.modele.toLowerCase().includes(searchLower) ||
          vehicle.user.username.toLowerCase().includes(searchLower);

        const matchesStatus = statusFilter
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
        daySinceStatut: vehicle.daySinceStatut
      }))
      .sort((a, b) => daysSince(b.dateCreation) - daysSince(a.dateCreation));
  }, [vehicles, searchQuery, statusFilter, activeFilter]);

  const vehicleCountByStatus = useMemo(() => {
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

  const handleSwitchChange = (filter: string) => {
    setActiveFilter(activeFilter === filter ? "" : filter);
  };

  const isProductionSelected = statusFilter === "Production";

  const statusOrder = [
    "Livraison",
    "Transport aller",
    "Expertise",
    "Client",
    "Magasin",
    "Production",
    "Stockage",
    "Transport retour",
  ];

  return (
    <div className="rounded-l-lg border bg-primary pb-8">
      <DashboardHeader
        title="Rénovations en Cours"
        count={vehicles?.length || 0}
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
        <div className="relative flex flex-row justify-between">
          <div className="flex flex-row space-x-4">
            <Input
              placeholder="Recherche"
              className="text-sm"
              value={searchQuery}
              hasSearchIcon
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-[400px] w-full overflow-y-auto px-8 2xl:h-[550px]">
          <table className="w-full table-fixed">
            <thead>
              <tr className="sticky top-0 z-10 border-b bg-background text-left">
                <th className="w-[12%] px-2 py-3 2xl:px-6">Client</th>
                <th className="w-[12%] px-2 py-3 2xl:px-6">Immatriculation</th>
                <th className="w-[12%] px-2 py-3 2xl:px-6">Modèle</th>
                <th className="w-[10%] px-2 py-3 text-center 2xl:px-6">
                  Jours de rénovation
                </th>
                <th className="w-[10%] px-2 py-3 text-center 2xl:px-6">
                  Jours depuis status
                </th>
                {isProductionSelected && (
                  <>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <AudioLines className="mb-0.5 inline-block" /> DSP
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={activeFilter === "dsp"}
                            onCheckedChange={() => handleSwitchChange("dsp")}
                          />
                          <span className="text-sm">
                            ({getStatusCounts.dsp})
                          </span>
                        </div>
                      </div>
                    </th>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <Wrench className="mb-0.5 inline-block" /> Mécanique
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={activeFilter === "mecanique"}
                            onCheckedChange={() =>
                              handleSwitchChange("mecanique")
                            }
                          />
                          <span className="text-sm">
                            ({getStatusCounts.mecanique})
                          </span>
                        </div>
                      </div>
                    </th>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <LifeBuoy className="mb-0.5 inline-block" /> Jantes
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={activeFilter === "jantes"}
                            onCheckedChange={() => handleSwitchChange("jantes")}
                          />
                          <span className="text-sm">
                            ({getStatusCounts.jantes})
                          </span>
                        </div>
                      </div>
                    </th>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <ShieldCheck className="mb-0.5 inline-block" /> CT
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={activeFilter === "ct"}
                            onCheckedChange={() => handleSwitchChange("ct")}
                          />
                          <span className="text-sm">
                            ({getStatusCounts.ct})
                          </span>
                        </div>
                      </div>
                    </th>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <Car className="mb-0.5 inline-block" /> Carrosserie
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={activeFilter === "carrosserie"}
                            onCheckedChange={() =>
                              handleSwitchChange("carrosserie")
                            }
                          />
                          <span className="text-sm">
                            ({getStatusCounts.carrosserie})
                          </span>
                        </div>
                      </div>
                    </th>
                    <th className="w-[7%] px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <SprayCan className="mb-0.5 inline-block" /> Esthétique
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={activeFilter === "esthetique"}
                            onCheckedChange={() =>
                              handleSwitchChange("esthetique")
                            }
                          />
                          <span className="text-sm">
                            ({getStatusCounts.esthetique})
                          </span>
                        </div>
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
                    colSpan={isProductionSelected ? 11 : 5}
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
                    colSpan={isProductionSelected ? 11 : 5}
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
                      {vehicle.user.username}
                    </td>
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
                          {vehicle.esthetique ? (
                            <CalendarClock className="inline-block text-[#fbbf24]" />
                          ) : (
                            <BadgeCheck className="inline-block text-[#16a34a]" />
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={isProductionSelected ? 11 : 5}
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

export default AdminOngoing;
