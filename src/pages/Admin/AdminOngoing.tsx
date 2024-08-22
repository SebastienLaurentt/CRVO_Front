import AddExcelData from "@/components/AddExcelData";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  AudioLines,
  BadgeCheck,
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

const AdminOngoing: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFileInputVisible, setIsFileInputVisible] = useState(false);

  const {
    data: vehicles,
    isLoading: isLoadingVehicles,
    isError: isErrorVehicles,
    error: errorVehicles,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
  });

  const filteredVehicles = vehicles?.filter((vehicle) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vehicle.immatriculation.toLowerCase().includes(searchLower) ||
      vehicle.modele.toLowerCase().includes(searchLower) ||
      vehicle.user.username.toLowerCase().includes(searchLower)
    );
  });

  const sortedVehicles = filteredVehicles?.sort(
    (a, b) => daysSince(b.dateCreation) - daysSince(a.dateCreation)
  );

  return (
    <div className="p-8 border rounded-l-lg bg-primary">
      <h1>Rénovations En Cours</h1>
      <div className="flex flex-row gap-x-4 pb-4 pt-8">
        <div className="flex flex-row gap-x-3">
          <Input
            placeholder="Recherche"
            className="text-sm"
            value={searchQuery}
            hasSearchIcon
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-x-2">
          <Button
            className="space-x-[5px]"
            onClick={() => setIsFileInputVisible(true)}
          >
            <Upload size={20} /> <span>Nouveau Fichier</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="h-[550px] overflow-y-auto w-full">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-background border-b sticky top-0 z-10">
                <th className="py-3 px-2 2xl:px-6 w-[300px]">Client</th>
                <th className="py-3 px-2 2xl:px-6 w-[200px]">
                  Immatriculation
                </th>
                <th className="py-3 px-2 2xl:px-6 w-[250px]">Modèle</th>
                <th className="py-3 px-2 2xl:px-6 w-[200px] text-center">
                  Jours depuis Création
                </th>
                <th className="py-3 px-4 w-[60px] text-center">
                  <AudioLines className="inline-block mb-0.5" /> DSP
                </th>
                <th className="py-3 px-4 w-[100px] text-center">
                  <Wrench className="inline-block mb-0.5" /> Mécanique
                </th>
                <th className="py-3 px-4 w-[60px] text-center">
                  <LifeBuoy className="inline-block mb-0.5" /> Jantes
                </th>
                <th className="py-3 px-4 w-[60px] text-center">
                  <ShieldCheck className="inline-block mb-0.5" /> CT
                </th>
                <th className="py-3 px-4 w-[100px] text-center">
                  <Car className="inline-block mb-0.5" /> Carrosserie
                </th>
                <th className="py-3 px-4 w-[80px] text-center">
                  <SprayCan className="inline-block mb-0.5" /> Esthétique
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoadingVehicles ? (
                <tr>
                  <td colSpan={10} className="text-center py-20">
                    <div className="flex items-center justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : isErrorVehicles ? (
                <tr>
                  <td colSpan={10} className="text-center py-8">
                    Error:{" "}
                    {errorVehicles instanceof Error
                      ? errorVehicles.message
                      : "Unknown error"}
                  </td>
                </tr>
              ) : sortedVehicles && sortedVehicles.length > 0 ? (
                sortedVehicles.map((vehicle: Vehicle) => (
                  <tr key={vehicle._id} className="border-b last:border-b-0">
                    <td className="py-4 px-2 2xl:px-6">
                      {vehicle.user.username}
                    </td>
                    <td className="py-4 px-2 2xl:px-6">
                      {vehicle.immatriculation}
                    </td>
                    <td className="py-4 px-2 2xl:px-6">{vehicle.modele}</td>
                    <td className="py-4 px-2 2xl:px-4 text-center">
                      {daysSince(vehicle.dateCreation)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {vehicle.dsp ? (
                        <BadgeCheck className="inline-block text-[#fbbf24]" />
                      ) : (
                        <BadgeCheck className="inline-block text-[#16a34a]" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {vehicle.mecanique ? (
                        <BadgeCheck className="inline-block text-[#fbbf24]" />
                      ) : (
                        <BadgeCheck className="inline-block text-[#16a34a]" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {vehicle.jantes ? (
                        <BadgeCheck className="inline-block text-[#fbbf24]" />
                      ) : (
                        <BadgeCheck className="inline-block text-[#16a34a]" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {vehicle.ct ? (
                        <BadgeCheck className="inline-block text-[#fbbf24]" />
                      ) : (
                        <BadgeCheck className="inline-block text-[#16a34a]" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {vehicle.carrosserie ? (
                        <BadgeCheck className="inline-block text-[#fbbf24]" />
                      ) : (
                        <BadgeCheck className="inline-block text-[#16a34a]" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {vehicle.esthetique ? (
                        <BadgeCheck className="inline-block text-[#fbbf24]" />
                      ) : (
                        <BadgeCheck className="inline-block text-[#fbbf24]" />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center pt-8 font-medium">
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
