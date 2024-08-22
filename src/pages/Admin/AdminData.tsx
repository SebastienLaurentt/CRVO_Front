import Loader from "@/components/Loader";
import { PasswordChangePieChart } from "@/components/PasswordChangePieChart";
import { UserPieChart } from "@/components/UserPieChart"; // Import du nouveau composant
import { VehiculePieChart } from "@/components/VehiculePieChart";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import React from "react";

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
  esthetique: boolean;
}

interface User {
  _id: string;
  username: string;
  role: string;
  passwordChanged: boolean;
}

const fetchVehicles = async (): Promise<Vehicle[]> => {
  const response = await fetch("https://crvo-back.onrender.com/api/vehicles");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des véhicules.");
  }
  return response.json();
};

const fetchCompletedVehicles = async (): Promise<Vehicle[]> => {
  const response = await fetch("https://crvo-back.onrender.com/api/completed");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des véhicules terminés.");
  }
  return response.json();
};

const fetchMembers = async (): Promise<User[]> => {
  const token = Cookies.get("token");
  const response = await fetch("https://crvo-back.onrender.com/api/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des utilisateurs.");
  }
  const users = await response.json();
  return users.filter((user: User) => user.role === "member");
};

const AdminData: React.FC = () => {
  const {
    data: vehicles,
    isLoading: isLoadingVehicles,
    isError: isErrorVehicles,
    error: errorVehicles,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
  });

  const {
    data: completedVehicles,
    isLoading: isLoadingCompleted,
    isError: isErrorCompleted,
    error: errorCompleted,
  } = useQuery({
    queryKey: ["completedVehicles"],
    queryFn: fetchCompletedVehicles,
  });

  const {
    data: members,
    isLoading: isLoadingMembers,
    isError: isErrorMembers,
    error: errorMembers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchMembers,
  });

  if (isErrorVehicles || isErrorCompleted || isErrorMembers) {
    return (
      <div>
        Erreur lors du chargement des données:{" "}
        {errorVehicles?.message ||
          errorCompleted?.message ||
          errorMembers?.message}
      </div>
    );
  }

  const ongoingVehicles = vehicles?.length || 0;
  const completedVehiclesCount = completedVehicles?.length || 0;
  const totalVehicles = ongoingVehicles + completedVehiclesCount;
  const totalMembers = members?.length || 0;

  // Calcul du nombre d'utilisateurs avec et sans mot de passe changé
  const usersWithPasswordChanged = members?.filter((member) => member.passwordChanged).length || 0;
  const usersWithoutPasswordChanged = totalMembers - usersWithPasswordChanged;

  return (
    <div className="p-8 border rounded-l-lg bg-primary h-[700px]">
      <h1>Graphiques</h1>
      {isLoadingVehicles || isLoadingCompleted || isLoadingMembers ? (
        <div className="flex py-40 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="mt-6 flex flex-row gap-x-4">
          <VehiculePieChart
            total={totalVehicles}
            completed={completedVehiclesCount}
            ongoing={ongoingVehicles}
          />
          <UserPieChart totalUsers={totalMembers} />
          <PasswordChangePieChart
            usersWithPasswordChanged={usersWithPasswordChanged}
            usersWithoutPasswordChanged={usersWithoutPasswordChanged}
          />
        </div>
      )}
    </div>
  );
};

export default AdminData;

