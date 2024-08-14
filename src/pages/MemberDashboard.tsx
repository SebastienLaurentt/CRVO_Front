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
  LifeBuoy,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

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

const MemberDashboard: React.FC = () => {
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

  if (isLoading)
    return (
      <div className="flex flex-col items-center mt-60">
        <Loader />
      </div>
    );
  if (isError)
    return (
      <p>Error: {error instanceof Error ? error.message : "Unknown error"}</p>
    );

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

  return (
    <div className="py-8 px-12 border rounded-lg shadow-2xl my-4">
      <h1 >Tableau de bord</h1>
      <div className="flex flex-row justify-between pb-4 pt-8 sticky top-0 z-10 bg-white">
        <Input
          placeholder="Recherche"
          className="text-sm"
          value={searchQuery}
          hasSearchIcon
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button className="space-x-[5px]" asChild>
          <Link to="https://facturation.crvo.fr/" target="_blank">
            <BookText size={20} />
            <span>Mes Factures</span>
          </Link>
        </Button>
      </div>

      <table>
        <thead>
          <tr className="text-left bg-primary border-b sticky top-[88px] z-10">
            <th className="py-3 px-6 w-[200px]">Immatriculation</th>
            <th className="py-3 px-6 w-[250px]">Modèle</th>
            <th className="py-3 px-6 w-[200px] text-center">
              Jours depuis Création
            </th>
            <th className="py-3 px-6 w-[150px] text-center">
              <Wrench className="inline-block mb-0.5" /> Mécanique
            </th>
            <th className="py-3 px-6 w-[150px] text-center">
              <Car className="inline-block mb-0.5" /> Carrosserie
            </th>
            <th className="py-3 px-6 w-[80px] text-center">
              <ShieldCheck className="inline-block mb-0.5" /> CT
            </th>
            <th className="py-3 px-6 w-[100px] text-center">
              <AudioLines className="inline-block mb-0.5" /> DSP
            </th>
            <th className="py-3 px-6 w-[100px] text-center">
              <LifeBuoy className="inline-block mb-0.5" /> Jantes
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedVehicles && sortedVehicles.length > 0 ? (
            sortedVehicles.map((vehicle: Vehicle) => (
              <tr key={vehicle._id} className="border-b">
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
  );
};

export default MemberDashboard;
