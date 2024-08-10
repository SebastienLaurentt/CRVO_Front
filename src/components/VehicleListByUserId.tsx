import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import React from "react";

interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  joursDepuisReception: number;
  user: {
    username: string;
  };
}

const fetchVehiclesByUser = async (): Promise<Vehicle[]> => {
  const token = Cookies.get("token");

  const response = await fetch("http://localhost:5000/api/user/vehicles", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des véhicules.");
  }
  const data = await response.json();
  return data;
};
const VehicleListByUserId: React.FC = () => {
  const {
    data: vehicles,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userVehicles"],
    queryFn: fetchVehiclesByUser,
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
          <tr className="text-left bg-primary border-b">
            <th className="py-3 px-6">Immatriculation</th>
            <th className="py-3 px-6">Modèle</th>
            <th className="py-3 px-6">Jours depuis Reception</th>
          </tr>
        </thead>
        <tbody>
          {vehicles?.map((vehicle: Vehicle) => (
            <tr key={vehicle._id}>
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

export default VehicleListByUserId;
