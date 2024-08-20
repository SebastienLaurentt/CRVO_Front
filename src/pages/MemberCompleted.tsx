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

const MemberCompleted: React.FC = () => {
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

  return (
    <div className="p-8 border rounded-l-lg flex-1 bg-primary">
      <h1>Véhicules Terminés</h1>
      <div className="flex flex-row justify-between pb-4 pt-8">
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

      <div className="relative">
        <div className="max-h-[550px] overflow-y-auto w-full">
          <table className="w-full border-gray-200">
            <thead className="bg-background sticky top-0 z-10">
              <tr className="text-left border-b">
                <th className="py-3 px-6 w-[300px]">Client</th>
                <th className="py-3 px-6 w-[200px]">VIN</th>
                <th className="py-3 px-6 w-[250px]">Statut</th>
                <th className="py-3 px-6 w-[200px] text-center">
                  Date de Complétion
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoadingCompletedVehicles ? (
                <tr>
                  <td colSpan={4} className="text-center py-20">
                    <div className="flex items-center justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : isErrorCompletedVehicles ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    Error:{" "}
                    {errorCompletedVehicles instanceof Error
                      ? errorCompletedVehicles.message
                      : "Unknown error"}
                  </td>
                </tr>
              ) : sortedCompletedVehicles &&
                sortedCompletedVehicles.length > 0 ? (
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
        </div>
      </div>

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

export default MemberCompleted;
