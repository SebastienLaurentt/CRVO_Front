import { useQuery } from "@tanstack/react-query";
import { Download, FolderPlus } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AddExcelData from "./AddExcelData";
import Loader from "./Loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  joursDepuisReception: number;
  user: {
    username: string;
  };
}

const fetchVehicles = async (): Promise<Vehicle[]> => {
  const response = await fetch("http://localhost:5000/api/vehicles");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des véhicules.");
  }
  const data = await response.json();
  return data;
};

const VehicleList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFileInputVisible, setIsFileInputVisible] = useState(false);

  const {
    data: vehicles,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
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
      vehicle.modele.toLowerCase().includes(searchLower) ||
      vehicle.user.username.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="py-8 px-12 border rounded-lg">
      <div className="flex flex-row justify-between mb-4">
        <div className="flex flex-row gap-x-3">
          <Input
            placeholder="Recherche"
            className="text-sm"
            value={searchQuery}
            hasSearchIcon
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-x-2 ml-8 2xl:ml-60">
          <Button className="space-x-[5px]" asChild>
            <Link to="/clients">
              <Download size={18} />
              <span className="text-xs">Infos Client</span>
            </Link>
          </Button>
          <Button
            className="space-x-[5px]"
            onClick={() => setIsFileInputVisible(true)}
          >
            <FolderPlus size={18} />{" "}
            <span className="text-xs">Nouveau Fichier</span>
          </Button>
        </div>
      </div>

      <table>
        <thead>
          <tr className="text-left bg-primary border-b">
            <th className="py-3 px-6 w-[300px]">Client</th>
            <th className="py-3 px-6 w-[200px]">Immatriculation</th>
            <th className="py-3 px-6 w-[300px]">Modèle</th>
            <th className="py-3 px-6 w-[250px]">Jours depuis Reception</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles && filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle: Vehicle) => (
              <tr key={vehicle._id} className="border-b">
                <td className="py-4 px-6">{vehicle.user.username}</td>
                <td className="py-4 px-6">{vehicle.immatriculation}</td>
                <td className="py-4 px-6">{vehicle.modele}</td>
                <td className="py-4 px-6">{vehicle.joursDepuisReception}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center pt-8 font-medium">
                Aucune donnée disponible actuellement. <br /> Veuillez ajouter
                un fichier Excel.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isFileInputVisible && (
        <AddExcelData onClose={() => setIsFileInputVisible(false)} />
      )}
    </div>
  );
};

export default VehicleList;
