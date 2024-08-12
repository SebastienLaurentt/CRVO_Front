import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BookText } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  dateCreation: number; 
  user: {
    username: string;
  };
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

const VehicleListByUserId: React.FC = () => {
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

  
  const sortedVehicles = filteredVehicles?.sort((a, b) => daysSince(b.dateCreation) - daysSince(a.dateCreation));

  return (
    <div className="py-8 px-12 border rounded-lg shadow-2xl">
      <div className="flex flex-row justify-between mb-4">
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
          <tr className="text-left bg-primary border-b">
            <th className="py-3 px-6 w-[300px]">Immatriculation</th>
            <th className="py-3 px-6 w-[300px]">Modèle</th>
            <th className="py-3 px-6 w-[300px]">Jours depuis Création</th> 
          </tr>
        </thead>
        <tbody>
          {sortedVehicles && sortedVehicles.length > 0 ? (
            sortedVehicles.map((vehicle: Vehicle) => (
              <tr key={vehicle._id}>
                <td className="py-4 px-6">{vehicle.immatriculation}</td>
                <td className="py-4 px-6">{vehicle.modele}</td>
                <td className="py-4 px-6">{daysSince(vehicle.dateCreation)}</td> 
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center pt-8 font-medium">
                Aucune donnée disponible actuellement.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleListByUserId;
