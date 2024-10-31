import AddCompletedExcelData from "@/components/AddCompletedExcelData";
import DashboardHeader from "@/components/DashboardHeader";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import React, { useMemo, useState } from "react";
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
  const [isCompletedFileInputVisible, setIsCompletedFileInputVisible] =
    useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("Transport retour");

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles
      .filter((vehicle) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          vehicle.immatriculation.toLowerCase().includes(searchLower) ||
          vehicle.modele.toLowerCase().includes(searchLower) ||
          vehicle.user.username.toLowerCase().includes(searchLower);

        const matchesStatus = statusFilter
          ? vehicle.statusCategory === statusFilter
          : true;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => daysSince(b.dateCreation) - daysSince(a.dateCreation));
  }, [vehicles, searchQuery, statusFilter]);

  const vehicleCountByStatus = useMemo(() => {
    if (!vehicles) return {};
    return vehicles.reduce((acc, vehicle) => {
      acc[vehicle.statusCategory] = (acc[vehicle.statusCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [vehicles]);

  const statusOrder = ["Stockage", "Transport retour"];

  return (
    <div className="flex-1 rounded-l-lg border bg-primary pb-8">
      <DashboardHeader
        title="Rénovations Terminées"
        count={vehicles?.length || 0}
      />
      <div className="flex flex-col space-y-3 px-8 py-4">
        <p>
          Dernière synchronisation:{" "}
          <span className="font-medium">
            {syncDate
              ? `${syncDate.toLocaleDateString()} - ${syncDate.toLocaleTimeString()}`
              : "Chargement..."}
          </span>
        </p>
        <div className="relative flex flex-row justify-between">
          <div className="flex flex-row space-x-4">
            <Input
              placeholder="Recherche"
              className="text-sm"
              value={searchQuery}
              hasSearchIcon
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex flex-row space-x-1">
              {statusOrder.map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "secondary" : "outline"}
                  onClick={() => setStatusFilter(status)}
                >
                  {status} ({vehicleCountByStatus[status] || 0})
                </Button>
              ))}
            </div>
          </div>
          <Button
            className="space-x-[5px]"
            onClick={() => setIsCompletedFileInputVisible(true)}
          >
            <Upload size={20} /> <span>Import Excel</span>
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
                <th className="w-[160px] px-6 py-3">Modèle</th>
                <th className="w-[160px] px-6 py-3 text-center">
                  Jours depuis création
                </th>
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
                    <td className="px-6 py-4 text-center">
                      {daysSince(vehicle.dateCreation)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="pt-8 text-center font-medium">
                    Aucun véhicule pour ce statut actuellement.
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
