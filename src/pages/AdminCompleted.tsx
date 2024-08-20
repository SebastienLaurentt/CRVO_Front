import AddCompletedExcelData from "@/components/AddCompletedExcelData";
import AddExcelData from "@/components/AddExcelData";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import React, { useState } from "react";

interface CompletedVehicle {
  _id: string;
  vin: string;
  statut: string;
  dateCompletion: string;
  user: {
    username: string;
  };
}

const daysSince = (dateString: string): number => {
  const creationDate = new Date(dateString);
  const today = new Date();
  const timeDiff = today.getTime() - creationDate.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

const fetchCompletedVehicles = async (): Promise<CompletedVehicle[]> => {
  const response = await fetch("https://crvo-back.onrender.com/api/completed");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des véhicules terminés.");
  }
  const data = await response.json();
  return data;
};

const AdminCompleted: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFileInputVisible, setIsFileInputVisible] = useState(false);
  const [isCompletedFileInputVisible, setIsCompletedFileInputVisible] =
    useState(false);

  const {
    data: completedVehicles,
    isLoading: isLoadingCompletedVehicles,
    isError: isErrorCompletedVehicles,
    error: errorCompletedVehicles,
  } = useQuery({
    queryKey: ["completed-vehicles"],
    queryFn: fetchCompletedVehicles,
  });

  const filteredCompletedVehicles = completedVehicles?.filter((vehicle) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vehicle.vin.toLowerCase().includes(searchLower) ||
      vehicle.statut.toLowerCase().includes(searchLower) ||
      vehicle.user.username.toLowerCase().includes(searchLower)
    );
  });

  const sortedCompletedVehicles = filteredCompletedVehicles?.sort(
    (a, b) => daysSince(b.dateCompletion) - daysSince(a.dateCompletion)
  );

  if (isLoadingCompletedVehicles)
    return (
      <div className="flex flex-col items-center mt-60">
        <Loader />
      </div>
    );
  if (isErrorCompletedVehicles)
    return (
      <p>
        Error:{" "}
        {errorCompletedVehicles instanceof Error
          ? errorCompletedVehicles.message
          : "Unknown error"}
      </p>
    );

  return (
    <div className="p-8 border rounded-l-lg shadow-2xl flex-1">
      <h1 className="text-left">Véhicules Terminés</h1>
      <div className="flex flex-row justify-between pb-4 pt-8 sticky top-0 z-10 bg-white">
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
          <Button
            className="space-x-[5px]"
            onClick={() => setIsFileInputVisible(true)}
          >
            <Upload size={20} /> <span>Nouveau Fichier</span>
          </Button>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-left bg-primary border-b sticky top-[88px] z-10">
            <th className="py-3 px-6 w-[300px]">Client</th>
            <th className="py-3 px-6 w-[200px]">VIN</th>
            <th className="py-3 px-6 w-[250px]">Statut</th>
            <th className="py-3 px-6 w-[200px] text-center">
              Date de Complétion
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCompletedVehicles && sortedCompletedVehicles.length > 0 ? (
            sortedCompletedVehicles.map((vehicle: CompletedVehicle) => (
              <tr key={vehicle._id} className="border-b last:border-b-0">
                <td className="py-4 px-6">{vehicle.user.username}</td>
                <td className="py-4 px-6">{vehicle.vin}</td>
                <td className="py-4 px-6">{vehicle.statut}</td>
                <td className="py-4 px-6 text-center">
                  {new Date(vehicle.dateCompletion).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center pt-8 font-medium">
                Aucune donnée disponible actuellement.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isFileInputVisible && (
        <AddExcelData onClose={() => setIsFileInputVisible(false)} />
      )}

      {isCompletedFileInputVisible && (
        <AddCompletedExcelData
          onClose={() => setIsCompletedFileInputVisible(false)}
        />
      )}
    </div>
  );
};

export default AdminCompleted;
