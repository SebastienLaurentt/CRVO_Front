// components/VehicleList.tsx
import { useQuery } from "@tanstack/react-query";
import React from "react";

// Définition du type pour un véhicule
interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  joursDepuisReception: number;
  user: {
    username: string;
  };
}

// Fonction pour récupérer les véhicules depuis l'API
const fetchVehicles = async (): Promise<Vehicle[]> => {
  const response = await fetch("http://localhost:5000/api/vehicles"); // Assurez-vous que l'URL est correcte
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des véhicules.");
  }
  const data = await response.json();
  return data;
};

const VehicleList: React.FC = () => {
  const {
    data: vehicles,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError)
    return (
      <p>Error: {error instanceof Error ? error.message : "Unknown error"}</p>
    );

  return (
    <div className="py-4">
      <table>
        <thead>
          <tr className="text-left">
            <th className="px-2">Username</th>
            <th className="px-2">Immatriculation</th>
            <th className="px-2">Modèle</th>
            <th className="px-2">Jours depuis Reception</th>
          </tr>
        </thead>
        <tbody>
          {vehicles?.map((vehicle: Vehicle) => (
            <tr key={vehicle._id}>
              <td className="px-2">{vehicle.user.username}</td>
              <td className="px-2">{vehicle.immatriculation}</td>
              <td className="px-2">{vehicle.modele}</td>
              <td className="px-2">{vehicle.joursDepuisReception}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleList;
