import DashboardHeader from "@/components/DashboardHeader";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChartArea } from "lucide-react";
import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Vehicle } from "../../App";

interface MemberCompletedProps {
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

const MemberCompleted: React.FC<MemberCompletedProps> = ({
  vehicles,
  isLoadingVehicles,
  isErrorVehicles,
  errorVehicles,
  syncDate,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Transport retour");

  const statusCategories = useMemo(() => {
    if (!vehicles) return [];
    return Array.from(
      new Set(vehicles.map((vehicle) => vehicle.statusCategory))
    );
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

        const matchesStatus = statusFilter
          ? vehicle.statusCategory === statusFilter
          : true;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => daysSince(b.dateCreation) - daysSince(a.dateCreation));
  }, [vehicles, searchQuery, statusFilter]);

  const exportToExcel = () => {
    if (!vehicles || !syncDate) return;

    const workbook = XLSX.utils.book_new();

    const data = vehicles.map((vehicle) => ({
      Immatriculation: vehicle.immatriculation,
      Modèle: vehicle.modele,
      Statut: vehicle.statusCategory,
      "Prix Actuel": vehicle.price,
      "Jours depuis Création": daysSince(vehicle.dateCreation),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Véhicules Terminés");

    const formattedDate = syncDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).split('/').join('');

    XLSX.writeFile(workbook, `renovationsTerminees_${formattedDate}.xlsx`);
  };

  return (
    <div className="flex-1 rounded-l-lg border bg-primary pb-8">
      <DashboardHeader
        title="Rénovations Terminées"
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
            <Button className="space-x-[5px]" onClick={exportToExcel}>
              <ChartArea size={20} />
              <span>Exporter en Excel</span>
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
                <th className="w-[160px] px-6 py-3">Immatriculation</th>
                <th className="w-[160px] px-6 py-3">Modèle</th>
                <th className="w-[160px] px-6 py-3 text-center">
                  Jours depuis création
                </th>
                <th className="w-[160px] px-6 py-3 text-right">Prix</th>
              </tr>
            </thead>

            <tbody>
              {isLoadingVehicles ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex items-center justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : isErrorVehicles ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center">
                    Error:{" "}
                    {errorVehicles instanceof Error
                      ? errorVehicles.message
                      : "Unknown error"}
                  </td>
                </tr>
              ) : filteredVehicles && filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle: Vehicle) => (
                  <tr key={vehicle._id} className="border-b last:border-b-0">
                    <td className="px-6 py-4">{vehicle.immatriculation}</td>
                    <td className="px-6 py-4">{vehicle.modele}</td>
                    <td className="px-6 py-4 text-center">
                      {daysSince(vehicle.dateCreation)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {vehicle.price ? `${vehicle.price} €` : "Non défini"}
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
    </div>
  );
};

export default MemberCompleted;
