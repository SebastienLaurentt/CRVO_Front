import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import {
  AudioLines,
  BadgeCheck,
  BookText,
  Car,
  ChartArea,
  LifeBuoy,
  ShieldCheck,
  SprayCan,
  Wrench,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  dateCreation: number; 
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

  const {
    data: vehicles,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userVehicles"],
    queryFn: fetchVehiclesByUser,
  });

  const filteredVehicles = vehicles?.filter((vehicle) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vehicle.immatriculation.toLowerCase().includes(searchLower) ||
      vehicle.modele.toLowerCase().includes(searchLower)
    );
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
      "Jours depuis Création": daysSince(vehicle.dateCreation),
      Mécanique: vehicle.mecanique ? "Oui" : "Non",
      Carrosserie: vehicle.carrosserie ? "Oui" : "Non",
      CT: vehicle.ct ? "Oui" : "Non",
      DSP: vehicle.dsp ? "Oui" : "Non",
      Jantes: vehicle.jantes ? "Oui" : "Non",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Véhicules");

    XLSX.writeFile(workbook, "vehicules.xlsx");
  };

  return (
    <div className="p-8 border rounded-l-lg bg-primary flex-1 ">
      <h1>Tableau de bord</h1>
      <div className="flex flex-row justify-between pb-4 pt-8  ">
        <Input
          placeholder="Recherche"
          className="text-sm"
          value={searchQuery}
          hasSearchIcon
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-x-2">
          <Button className="space-x-[5px]" asChild>
            <Link to="https://facturation.crvo.fr/" target="_blank">
              <BookText size={20} />
              <span>Mes Factures</span>
            </Link>
          </Button>
          <Button className="space-x-[5px]" onClick={exportToExcel}>
            <ChartArea size={20} />
            <span>Exporter en Excel</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="max-h-[550px] overflow-y-auto w-full">
          <table className="w-full border-gray-200">
            <thead>
              <tr className="text-left bg-background border-b sticky top-0 z-10">
                <th className="py-3 px-6 w-[200px]">Immatriculation</th>
                <th className="py-3 px-6 w-[250px]">Modèle</th>
                <th className="py-3 px-6 w-[200px] text-center">
                  Jours depuis Création
                </th>
                <th className="py-3 px-4 w-[100px] text-center">
                  <Wrench className="inline-block mb-0.5" /> Mécanique
                </th>
                <th className="py-3 px-4 w-[100px] text-center">
                  <Car className="inline-block mb-0.5" /> Carrosserie
                </th>
                <th className="py-3 px-4 w-[60px] text-center">
                  <ShieldCheck className="inline-block mb-0.5" /> CT
                </th>
                <th className="py-3 px-4 w-[60px] text-center">
                  <AudioLines className="inline-block mb-0.5" /> DSP
                </th>
                <th className="py-3 px-4 w-[60px] text-center">
                  <LifeBuoy className="inline-block mb-0.5" /> Jantes
                </th>
                <th className="py-3 px-4 w-[100px] text-center">
                  <SprayCan className="inline-block mb-0.5" /> Esthétique
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-20">
                    <div className="flex items-center justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="text-center py-8">
                    Error: {error instanceof Error ? error.message : "Unknown error"}
                  </td>
                </tr>
              ) : sortedVehicles && sortedVehicles.length > 0 ? (
                sortedVehicles.map((vehicle: Vehicle) => (
                  <tr key={vehicle._id} className="border-b last:border-b-0">
                    <td className="py-4 px-6">{vehicle.immatriculation}</td>
                    <td className="py-4 px-6">{vehicle.modele}</td>
                    <td className="py-4 px-6 text-center">
                      {daysSince(vehicle.dateCreation)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {vehicle.mecanique ? (
                        <BadgeCheck className="inline-block" />
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {vehicle.carrosserie ? (
                        <BadgeCheck className="inline-block" />
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {vehicle.ct ? <BadgeCheck className="inline-block" /> : ""}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {vehicle.dsp ? <BadgeCheck className="inline-block" /> : ""}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {vehicle.jantes ? (
                        <BadgeCheck className="inline-block" />
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {vehicle.esthetique ? (
                        <BadgeCheck className="inline-block" />
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center pt-8 font-medium">
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
