import AddExcelData from "@/components/AddExcelData";
import DashboardHeader from "@/components/DashboardHeader";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import {
  AudioLines,
  BadgeCheck,
  CalendarClock,
  Car,
  LifeBuoy,
  ShieldCheck,
  SprayCan,
  Upload,
  Wrench,
} from "lucide-react";
import React, { useState } from "react";

interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  dateCreation: string;
  price: string;
  user: {
    username: string;
  };
  mecanique: boolean;
  carrosserie: boolean;
  ct: boolean;
  dsp: boolean;
  jantes: boolean;
  esthetique: boolean;
  statusCategory: string;
}

const daysSince = (dateString: string): number => {
  const creationDate = new Date(dateString);
  const today = new Date();
  const timeDiff = today.getTime() - creationDate.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

const fetchVehicles = async (): Promise<Vehicle[]> => {
  const response = await fetch("https://crvo-back.onrender.com/api/vehicles");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des véhicules.");
  }
  const data = await response.json();
  return data;
};

const fetchLatestSynchronizationDate = async (): Promise<Date | null> => {
  const response = await fetch(
    "https://crvo-back.onrender.com/api/synchronization"
  );
  if (!response.ok) {
    throw new Error(
      "Erreur lors de la récupération de la date de synchronisation."
    );
  }
  const data = await response.json();
  return data.date ? new Date(data.date) : null;
};

const mainStatusCategories = [
  "Livraison",
  "Transport aller",
  "Expertise",
  "Client",
  "Magasin",
  "Production",
  "Stockage",
  "Transport retour",
];

const AdminOngoing: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFileInputVisible, setIsFileInputVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Production");

  const {
    data: vehicles,
    isLoading: isLoadingVehicles,
    isError: isErrorVehicles,
    error: errorVehicles,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
  });

  const { data: syncDate } = useQuery({
    queryKey: ["syncDate"],
    queryFn: fetchLatestSynchronizationDate,
  });

  console.log(syncDate);

  const filteredVehicles = vehicles
    ?.filter((vehicle) => {
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
    .sort((a, b) => daysSince(b.dateCreation) - daysSince(a.dateCreation));

  const handleSwitchChange = (filter: string) => {
    setActiveFilter(activeFilter === filter ? "" : filter);
  };

  const isProductionSelected = statusFilter === "Production";

  return (
    <div className="rounded-l-lg border bg-primary pb-8">
      <DashboardHeader
        title="Rénovations en Cours"
        count={filteredVehicles?.length || 0}
      />
      <div className="flex flex-col space-y-3 px-8 py-4">
        <p>
          Dernière synchronisation:{" "}
          {syncDate
            ? `${syncDate.toLocaleDateString()} - ${syncDate.toLocaleTimeString()}`
            : "Non disponible"}
        </p>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-x-4">
            <Input
              placeholder="Recherche"
              className="text-sm"
              value={searchQuery}
              hasSearchIcon
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              className="space-x-[5px]"
              onClick={() => setIsFileInputVisible(true)}
            >
              <Upload size={20} /> <span>Import Excel</span>
            </Button>
          </div>
          <div className="space-x-2">
            {mainStatusCategories.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-[400px] w-full overflow-y-auto px-8 2xl:h-[550px]">
          <table className="w-full table-fixed">
            <thead>
              <tr className="sticky top-0 z-10 border-b bg-background text-left">
                <th className="w-1/6 px-2 py-3 2xl:px-6">Client</th>
                <th className="w-1/6 px-2 py-3 2xl:px-6">Immatriculation</th>
                <th className="w-1/6 px-2 py-3 2xl:px-6">Modèle</th>
                <th className="w-1/6 px-2 py-3 text-center 2xl:px-6">
                  Jours de rénovation
                </th>
                {isProductionSelected && (
                  <>
                    <th className="w-1/12 px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <AudioLines className="mb-0.5 inline-block" /> DSP
                        <Switch
                          checked={activeFilter === "dsp"}
                          onCheckedChange={() => handleSwitchChange("dsp")}
                        />
                      </div>
                    </th>
                    <th className="w-1/12 px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <Wrench className="mb-0.5 inline-block" /> Mécanique
                        <Switch
                          checked={activeFilter === "mecanique"}
                          onCheckedChange={() =>
                            handleSwitchChange("mecanique")
                          }
                        />
                      </div>
                    </th>
                    <th className="w-1/12 px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <LifeBuoy className="mb-0.5 inline-block" /> Jantes
                        <Switch
                          checked={activeFilter === "jantes"}
                          onCheckedChange={() => handleSwitchChange("jantes")}
                        />
                      </div>
                    </th>
                    <th className="w-1/12 px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <ShieldCheck className="mb-0.5 inline-block" /> CT
                        <Switch
                          checked={activeFilter === "ct"}
                          onCheckedChange={() => handleSwitchChange("ct")}
                        />
                      </div>
                    </th>
                    <th className="w-1/12 px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <Car className="mb-0.5 inline-block" /> Carrosserie
                        <Switch
                          checked={activeFilter === "carrosserie"}
                          onCheckedChange={() =>
                            handleSwitchChange("carrosserie")
                          }
                        />
                      </div>
                    </th>
                    <th className="w-1/12 px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <SprayCan className="mb-0.5 inline-block" /> Esthétique
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
                <th className="w-1/6 px-2 py-3 text-right 2xl:px-6">Prix</th>
              </tr>
            </thead>

            <tbody>
              {isLoadingVehicles ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="flex items-center justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : isErrorVehicles ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center">
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
                    <td className="px-2 py-4 text-right 2xl:px-6">
                      {vehicle.price ? vehicle.price : "Non défini"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={isProductionSelected ? 11 : 5}
                    className="pt-8 text-center font-medium"
                  >
                    Aucune donnée disponible actuellement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFileInputVisible && (
        <AddExcelData onClose={() => setIsFileInputVisible(false)} />
      )}
    </div>
  );
};

export default AdminOngoing;
