import DashboardHeader from "@/components/DashboardHeader";
import Loader from "@/components/Loader";
import { PasswordChangePieChart } from "@/components/PasswordChangePieChart";
import { StatusBarChart } from "@/components/StatusBarChart";
import { ProductionStatusBarChart } from "@/components/ProductionStatusBarChart";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import React, { useMemo } from "react";

interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  dateCreation: string;
  statusCategory: string;
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

interface AdminDataProps {
  vehicles: Vehicle[] | undefined;
  isLoadingVehicles: boolean;
  isErrorVehicles: boolean;
  errorVehicles: Error | null;
  syncDate: Date | null | undefined;
}

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

const AdminData: React.FC<AdminDataProps> = ({
  vehicles,
  syncDate
}) => {
  const {
    data: members,
    isLoading: isLoadingMembers,
    isError: isErrorMembers,
    error: errorMembers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchMembers,
  });

  const vehiclesByStatus = useMemo(() => {
    if (!vehicles) return {};
    return vehicles.reduce((acc, vehicle) => {
      acc[vehicle.statusCategory] = (acc[vehicle.statusCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [vehicles]);

  const getStatusCounts = useMemo(() => {
    if (!vehicles) return {
      dsp: 0,
      mecanique: 0,
      jantes: 0,
      ct: 0,
      carrosserie: 0,
      esthetique: 0,
    };
    
    return vehicles.reduce(
      (acc, vehicle) => {
        if (vehicle.statusCategory === "Production") {
          if (vehicle.dsp) acc.dsp++;
          if (vehicle.mecanique) acc.mecanique++;
          if (vehicle.jantes) acc.jantes++;
          if (vehicle.ct) acc.ct++;
          if (vehicle.carrosserie) acc.carrosserie++;
          if (vehicle.esthetique) acc.esthetique++;
        }
        return acc;
      },
      { dsp: 0, mecanique: 0, jantes: 0, ct: 0, carrosserie: 0, esthetique: 0 }
    );
  }, [vehicles]);

  if (isErrorMembers) {
    return (
      <div>
        Erreur lors du chargement des données:{" "}
        {errorMembers?.message}
      </div>
    );
  }

  const totalMembers = members?.length || 0;

  const usersWithPasswordChanged =
    members?.filter((member) => member.passwordChanged).length || 0;
  const usersWithoutPasswordChanged = totalMembers - usersWithPasswordChanged;

  return (
    <div className="h-[650px] rounded-l-lg border bg-primary pb-8 2xl:h-[800px]">
      <DashboardHeader title="Graphiques" />
      {isLoadingMembers ? (
        <div className="flex items-center justify-center py-40">
          <Loader />
        </div>
      ) : (
        <>
          <div className="px-8 py-4">
            <p>
              Dernière synchronisation:{" "}
              <span className="font-medium">
                {syncDate
                  ? `${syncDate.toLocaleDateString()} - ${syncDate.toLocaleTimeString()}`
                  : "Chargement..."}
              </span>
            </p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-8 px-8">
            <StatusBarChart vehiclesByStatus={vehiclesByStatus} />
            <ProductionStatusBarChart productionCounts={getStatusCounts} />
            <PasswordChangePieChart
              usersWithPasswordChanged={usersWithPasswordChanged}
              usersWithoutPasswordChanged={usersWithoutPasswordChanged}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminData;
