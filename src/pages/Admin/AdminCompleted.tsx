import AddCompletedExcelData from "@/components/AddCompletedExcelData";
import DashboardHeader from "@/components/DashboardHeader";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import React, { useState } from "react";

interface CompletedVehicle {
  _id: string;
  vin: string;
  immatriculation: string;
  dateCompletion: string;
  price: number;
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
      vehicle.user.username.toLowerCase().includes(searchLower) || 
      ((vehicle.immatriculation?.toLowerCase().includes(searchLower)) ?? false) ||
      ((vehicle.price?.toString().toLowerCase().includes(searchLower)) ?? false)
    );
  });

  const sortedCompletedVehicles = filteredCompletedVehicles?.sort(
    (a, b) => daysSince(b.dateCompletion) - daysSince(a.dateCompletion)
  );

  return (
    <div className="flex-1 rounded-l-lg border bg-primary pb-8">
      <DashboardHeader
        title="Rénovations Terminées"
        count={sortedCompletedVehicles?.length || 0}
      />
      <div className="flex flex-row gap-x-4 px-8 pb-4 pt-8">
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
            onClick={() => setIsCompletedFileInputVisible(true)}
          >
            <Upload size={20} /> <span>Nouveau Fichier</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="h-[400px] w-full overflow-y-auto px-8 2xl:h-[550px]">
          <table className="w-full border-gray-200">
            <thead className="sticky top-0 z-10 bg-background">
              <tr className="border-b text-left">
                <th className="w-[360px] px-6 py-3">Client</th>
                <th className="w-[160px] px-6 py-3">Immatriculation</th>
                <th className="w-[160px] px-6 py-3">VIN</th>
                <th className="w-[160px] px-6 py-3 text-center">
                  Fin de Rénovation
                </th>
                <th className="w-[160px] px-6 py-3 text-center">Prix</th>
              </tr>
            </thead>

            <tbody>
              {isLoadingCompletedVehicles ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex items-center justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : isErrorCompletedVehicles ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center">
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
                    <td className="px-6 py-4">{vehicle.user.username}</td>
                    <td className="px-6 py-4">
                      {vehicle.immatriculation !== null &&
                      vehicle.immatriculation !== undefined ? (
                        vehicle.immatriculation
                      ) : (
                        <span className="font-semibold text-red-500">
                          Non défini
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{vehicle.vin}</td>
                    <td className="px-6 py-4 text-center">
                      {vehicle.dateCompletion}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {vehicle.price !== null && vehicle.price !== undefined ? (
                        vehicle.price.toFixed(2) + " €"
                      ) : (
                        <span className="font-semibold text-red-500">
                          Non défini
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="pt-8 text-center font-medium">
                    Aucune donnée disponible actuellement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCompletedFileInputVisible && (
        <AddCompletedExcelData
          onClose={() => setIsCompletedFileInputVisible(false)}
        />
      )}
    </div>
  );
};

export default AdminCompleted;
