import AddExcelData from "@/components/AddExcelData";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  AudioLines,
  Car,
  LifeBuoy,
  ShieldCheck,
  Upload,
  User,
  Wrench,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

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

const AdminDashboard: React.FC = () => {
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

  const sortedVehicles = filteredVehicles?.sort(
    (a, b) => daysSince(b.dateCreation) - daysSince(a.dateCreation)
  );

  return (
    <div className="py-8 px-12 border rounded-lg shadow-2xl my-8">
      <h1 className="mb-6 text-left">Tableau de bord Admin</h1>
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
              <User size={20} />
              <span>Infos Client</span>
            </Link>
          </Button>
          <Button
            className="space-x-[5px]"
            onClick={() => setIsFileInputVisible(true)}
          >
            <Upload size={20} /> <span>Nouveau Fichier</span>
          </Button>
        </div>
      </div>

      <table>
        <thead>
          <tr className="text-left bg-primary border-b">
            <th className="py-3 px-6 w-[300px]">Client</th>
            <th className="py-3 px-6 w-[200px]">Immatriculation</th>
            <th className="py-3 px-6 w-[250px]">Modèle</th>
            <th className="py-3 px-6 w-[200px] text-center">
              Jours depuis Création
            </th>
            <th className="py-3 px-6 w-[150px]">Mécanique</th>
            <th className="py-3 px-6 w-[150px]">Carrosserie</th>
            <th className="py-3 px-6 w-[100px]">CT</th>
            <th className="py-3 px-6 w-[100px]">DSP</th>
            <th className="py-3 px-6 w-[100px]">Jantes</th>
          </tr>
        </thead>
        <tbody>
          {sortedVehicles && sortedVehicles.length > 0 ? (
            sortedVehicles.map((vehicle: Vehicle) => (
              <tr key={vehicle._id} className="border-b">
                <td className="py-4 px-6">{vehicle.user.username}</td>
                <td className="py-4 px-6">{vehicle.immatriculation}</td>
                <td className="py-4 px-6">{vehicle.modele}</td>
                <td className="py-4 px-6 text-center">
                  {daysSince(vehicle.dateCreation)}
                </td>
                <td className="py-4 px-6 ">
                  {vehicle.mecanique ? <Wrench /> : ""}
                </td>
                <td className="py-4 px-6 ">
                  {vehicle.carrosserie ? <Car /> : ""}
                </td>
                <td className="py-4 px-6 ">
                  {vehicle.ct ? <ShieldCheck /> : ""}
                </td>
                <td className="py-4 px-6 ">
                  {vehicle.dsp ? <AudioLines /> : ""}
                </td>
                <td className="py-4 px-6 ">
                  {vehicle.jantes ? <LifeBuoy /> : ""}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center pt-8 font-medium">
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

export default AdminDashboard;
