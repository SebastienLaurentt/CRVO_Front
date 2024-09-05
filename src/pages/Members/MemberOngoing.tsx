import DashboardHeader from "@/components/DashboardHeader";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import {
  AudioLines,
  BadgeCheck,
  CalendarClock,
  Car,
  ChartArea,
  LifeBuoy,
  ShieldCheck,
  SprayCan,
  Wrench,
} from "lucide-react";
import React, { useState } from "react";
import * as XLSX from "xlsx";

interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  dateCreation: number;
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
}

const daysSince = (timestamp: number): number => {
  const creationDate = new Date(timestamp);
  const today = new Date();
  const timeDiff = today.getTime() - creationDate.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

const fetchVehiclesByUser = async (): Promise<Vehicle[]> => {
  const token = Cookies.get("token");

  const response = await fetch(
    "https://crvo-back.onrender.com/api/user/vehicles",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des véhicules.");
  }
  const data = await response.json();
  return data;
};

const MemberOngoing: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("");

  const {
    data: vehicles,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userVehicles"],
    queryFn: fetchVehiclesByUser,
  });

  const filteredVehicles = vehicles
    ?.filter((vehicle) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        vehicle.immatriculation.toLowerCase().includes(searchLower) ||
        vehicle.modele.toLowerCase().includes(searchLower)
      );
    })
    .filter((vehicle) => {
      if (activeFilter === "dsp") return vehicle.dsp;
      if (activeFilter === "mecanique") return vehicle.mecanique;
      if (activeFilter === "carrosserie") return vehicle.carrosserie;
      if (activeFilter === "ct") return vehicle.ct;
      if (activeFilter === "jantes") return vehicle.jantes;
      if (activeFilter === "esthetique") return vehicle.esthetique;
      return true;
    });

  const sortedVehicles = filteredVehicles?.sort(
    (a, b) => daysSince(b.dateCreation) - daysSince(a.dateCreation)
  );

  const exportToExcel = () => {
    if (!sortedVehicles) return;

    const workbook = XLSX.utils.book_new();

    const data = sortedVehicles.map((vehicle) => ({
      Immatriculation: vehicle.immatriculation,
      Modèle: vehicle.modele,
      "Prix Actuel": vehicle.price,
      "Jours depuis Création": daysSince(vehicle.dateCreation),
      DSP: vehicle.dsp ? "En cours" : "Fait",
      Mécanique: vehicle.mecanique ? "En cours" : "Fait",
      Jantes: vehicle.jantes ? "En cours" : "Fait",
      CT: vehicle.ct ? "En cours" : "Fait",
      Carrosserie: vehicle.carrosserie ? "En cours" : "Fait",
      Esthétique: vehicle.esthetique ? "En cours" : "En cours",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Véhicules");

    XLSX.writeFile(workbook, "vehicules.xlsx");
  };

  const handleSwitchChange = (filter: string) => {
    setActiveFilter(activeFilter === filter ? "" : filter);
  };

  return (
    <div className="flex-1 rounded-l-lg border bg-primary pb-8 ">
      <DashboardHeader
        title="Rénovations en Cours"
        count={sortedVehicles?.length || 0}
      />
      <div className="flex flex-row gap-x-4 px-8 pb-4 pt-8 ">
        <Input
          placeholder="Recherche"
          className="text-sm"
          value={searchQuery}
          hasSearchIcon
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-x-2">
          <Button className="space-x-[5px]" onClick={exportToExcel}>
            <ChartArea size={20} />
            <span>Exporter en Excel</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="h-[400px] w-full overflow-y-auto px-8 2xl:h-[550px]">
          <table className="w-full border-gray-200">
            <thead>
              <tr className="sticky top-0 z-10 border-b bg-background text-left">
                <th className="w-[320px] px-6 py-3">Immatriculation</th>
                <th className="w-[320px] px-6 py-3">Modèle</th>
                <th className="w-[250px] px-2 py-3 2xl:px-6">Prix Actuel</th>
                <th className="w-[260px] px-6 py-3 text-center">
                  Jours depuis Création
                </th>
                <th className="w-[60px] px-4 py-3 text-center">
                  <AudioLines className="mb-0.5 inline-block" /> DSP
                  <Switch
                    checked={activeFilter === "dsp"}
                    onCheckedChange={() => handleSwitchChange("dsp")}
                  />
                </th>
                <th className="w-[100px] px-4 py-3 text-center">
                  <Wrench className="mb-0.5 inline-block" /> Mécanique
                  <Switch
                    checked={activeFilter === "mecanique"}
                    onCheckedChange={() => handleSwitchChange("mecanique")}
                  />
                </th>
                <th className="w-[60px] px-4 py-3 text-center">
                  <LifeBuoy className="mb-0.5 inline-block" /> Jantes
                  <Switch
                    checked={activeFilter === "jantes"}
                    onCheckedChange={() => handleSwitchChange("jantes")}
                  />
                </th>
                <th className="w-[60px] px-4 py-3 text-center">
                  <ShieldCheck className="mb-0.5 inline-block" /> CT
                  <Switch
                    checked={activeFilter === "ct"}
                    onCheckedChange={() => handleSwitchChange("ct")}
                  />
                </th>
                <th className="w-[100px] px-4 py-3 text-center">
                  <Car className="mb-0.5 inline-block" /> Carrosserie
                  <Switch
                    checked={activeFilter === "carrosserie"}
                    onCheckedChange={() => handleSwitchChange("carrosserie")}
                  />
                </th>
                <th className="w-[100px] px-4 py-3 text-center">
                  <SprayCan className="mb-0.5 inline-block" /> Esthétique
                  <Switch
                    checked={activeFilter === "esthetique"}
                    onCheckedChange={() => handleSwitchChange("esthetique")}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="flex items-center justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center">
                    Error:{" "}
                    {error instanceof Error ? error.message : "Unknown error"}
                  </td>
                </tr>
              ) : sortedVehicles && sortedVehicles.length > 0 ? (
                sortedVehicles.map((vehicle: Vehicle) => (
                  <tr key={vehicle._id} className="border-b last:border-b-0">
                    <td className="px-6 py-4">{vehicle.immatriculation}</td>
                    <td className="px-6 py-4">{vehicle.modele}</td>
                    <td className="px-6 py-4">{vehicle.price}</td>
                    <td className="px-6 py-4 text-center">
                      {daysSince(vehicle.dateCreation)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {vehicle.dsp ? (
                        <CalendarClock className="inline-block text-[#fbbf24]" />
                      ) : (
                        <BadgeCheck className="inline-block text-[#16a34a]" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {vehicle.mecanique ? (
                        <CalendarClock className="inline-block text-[#fbbf24]" />
                      ) : (
                        <BadgeCheck className="inline-block text-[#16a34a]" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {vehicle.jantes ? (
                        <CalendarClock className="inline-block text-[#fbbf24]" />
                      ) : (
                        <BadgeCheck className="inline-block text-[#16a34a]" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {vehicle.ct ? (
                        <CalendarClock className="inline-block text-[#fbbf24]" />
                      ) : (
                        <BadgeCheck className="inline-block text-[#16a34a]" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {vehicle.carrosserie ? (
                        <CalendarClock className="inline-block text-[#fbbf24]" />
                      ) : (
                        <BadgeCheck className="inline-block text-[#16a34a]" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {vehicle.esthetique ? (
                        <CalendarClock className="inline-block text-[#fbbf24]" />
                      ) : (
                        <CalendarClock className="inline-block text-[#fbbf24]" />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="pt-8 text-center font-medium">
                    Aucune donnée disponible actuellement.
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
