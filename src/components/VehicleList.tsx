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


const fetchVehicles = async (): Promise<Vehicle[]> => {
  const response = await fetch("http://localhost:5000/api/vehicles"); 
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
    <div className="py-8 px-20 border rounded-lg">
      <table>
        <thead>
          <tr className="text-left bg-primary border-b ">
            <th className="py-3 px-6">Username</th>
            <th className="py-3 px-6">Immatriculation</th>
            <th className="py-3 px-6">Modèle</th>
            <th className="py-3 px-6">Jours depuis Reception</th>
          </tr>
        </thead>
        <tbody>
          {vehicles?.map((vehicle: Vehicle) => (
            <tr key={vehicle._id} className="border-b">
              <td className="py-4 px-6">{vehicle.user.username}</td>
              <td className="py-4 px-6">{vehicle.immatriculation}</td>
              <td className="py-4 px-6">{vehicle.modele}</td>
              <td className="py-4 px-6">{vehicle.joursDepuisReception}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleList;
