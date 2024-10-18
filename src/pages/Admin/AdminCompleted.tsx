import AddCompletedExcelData from "@/components/AddCompletedExcelData";
import DashboardHeader from "@/components/DashboardHeader";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import React, { useState, useMemo } from "react";
import { Vehicle } from "../../App";

interface AdminCompletedProps {
  vehicles: Vehicle[] | undefined;
  isLoadingVehicles: boolean;
  isErrorVehicles: boolean;
  errorVehicles: Error | null;
  syncDate: Date | null | undefined;
}

const daysSince = (dateString: string): number => {
  const creationDate = new Date(dateString);
  const today = new Date();
  const timeDiff = today.getTime() - creationDate.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

const AdminCompleted: React.FC<AdminCompletedProps> = ({
  vehicles,
  isLoadingVehicles,
  isErrorVehicles,
  errorVehicles,
  syncDate,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCompletedFileInputVisible, setIsCompletedFileInputVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("Transport retour");

  const statusCategories = useMemo(() => {
    if (!vehicles) return [];
    return Array.from(new Set(vehicles.map((vehicle) => vehicle.statusCategory)));
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles
      .filter((vehicle) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          vehicle.immatriculation.toLowerCase().includes(searchLower) ||
          vehicle.modele.toLowerCase().includes(searchLower) ||
          vehicle.user.username.toLowerCase().includes(searchLower);

        const matchesStatus = statusFilter ? vehicle.statusCategory === statusFilter : true;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => daysSince(b.dateCreation) - daysSince(a.dateCreation));
  }, [vehicles, searchQuery, statusFilter]);

  return (
    <div className="flex-1 rounded-l-lg border bg-primary pb-8">
      <DashboardHeader
        title="Véhicules Terminés"
        count={filteredVehicles?.length || 0}
      />
      <div className="flex flex-col space-y-3 px-8 py-4">
        <p>
          Dernière synchronisation:{" "}
          {syncDate
            ? `${syncDate.toLocaleDateString()} - ${syncDate.toLocaleTimeString()}`
            : "Non disponible"}
        </p>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-x-4">
            <Input
              placeholder="Recherche"
              className="text-sm"
              value={searchQuery}
              hasSearchIcon
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              className="space-x-[5px]"
              onClick={() => setIsCompletedFileInputVisible(true)}
            >
              <Upload size={20} /> <span>Import Excel</span>
            </Button>
          </div>
          <div className="space-x-2">
            {statusCategories.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-[400px] w-full overflow-y-auto px-8 2xl:h-[550px]">
          <table className="w-full border-gray-200">
            <thead className="sticky top-0 z-10 bg-background">
              <tr className="border-b text-left">
                <th className="w-[360px] px-6 py-3">Client</th>
                <th className="w-[160px] px-6 py-3">Immatriculation</th>
                <th className="w-[160px] px-6 py-3">Modèle</th>
                <th className="w-[160px] px-6 py-3 text-center">Jours depuis création</th>
                <th className="w-[160px] px-6 py-3 text-center">Statut</th>
                <th className="w-[160px] px-6 py-3 text-right">Prix</th>
              </tr>
            </thead>

            <tbody>
              {isLoadingVehicles ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex items-center justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : isErrorVehicles ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    Error:{" "}
                    {errorVehicles instanceof Error
                      ? errorVehicles.message
                      : "Unknown error"}
                  </td>
                </tr>
              ) : filteredVehicles && filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle: Vehicle) => (
                  <tr key={vehicle._id} className="border-b last:border-b-0">
                    <td className="px-6 py-4">{vehicle.user.username}</td>
                    <td className="px-6 py-4">{vehicle.immatriculation}</td>
                    <td className="px-6 py-4">{vehicle.modele}</td>
                    <td className="px-6 py-4 text-center">{daysSince(vehicle.dateCreation)}</td>
                    <td className="px-6 py-4 text-center">{vehicle.statusCategory}</td>
                    <td className="px-6 py-4 text-right">
                      {vehicle.price ? `${vehicle.price} €` : "Non défini"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="pt-8 text-center font-medium">
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
