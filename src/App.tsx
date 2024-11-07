import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { useAuth } from "./lib/auth";
import AdminData from "./pages/Admin/AdminData";
import AdminOngoing from "./pages/Admin/AdminOngoing";
import Users from "./pages/Admin/Users";
import Login from "./pages/Login";
import MemberOngoing from "./pages/Members/MemberOngoing";
import CRVOLogo from "/public/images/CRVOLogo.png";

export interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  dateCreation: string;
  daySinceStatut: number;
  price: string;
  user: {
    username: string;
  };
  mecanique: boolean;
  carrosserie: boolean;
  ct: boolean;
  dsp: boolean;
  jantes: boolean;
  esthetique: boolean;
  statusCategory: string;
}

const fetchVehicles = async (): Promise<Vehicle[]> => {
  const token = Cookies.get("token");
  const response = await fetch("https://crvo-back.onrender.com/api/vehicles", {
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

const fetchMemberVehicles = async (): Promise<Vehicle[]> => {
  const token = Cookies.get("token");
  const response = await fetch(
    "https://crvo-back.onrender.com/api/user/vehicles",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des véhicules du membre.");
  }
  const data = await response.json();
  return data;
};

const fetchLatestSynchronizationDate = async (): Promise<Date | null> => {
  const token = Cookies.get("token");
  const response = await fetch(
    "https://crvo-back.onrender.com/api/synchronization",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Erreur lors de la récupération de la date de synchronisation."
    );
  }
  const data = await response.json();
  return data.date ? new Date(data.date) : null;
};

const App = () => {
  const { role } = useAuth();

  const shouldFetchAdminData = role === "admin";
  const shouldFetchMemberData = role === "member";

  const {
    data: adminVehicles,
    isLoading: isLoadingAdminVehicles,
    isError: isErrorAdminVehicles,
    error: errorAdminVehicles,
  } = useQuery({
    queryKey: ["adminVehicles"],
    queryFn: fetchVehicles,
    enabled: shouldFetchAdminData,
  });

  const {
    data: memberVehicles,
    isLoading: isLoadingMemberVehicles,
    isError: isErrorMemberVehicles,
    error: errorMemberVehicles,
  } = useQuery({
    queryKey: ["memberVehicles"],
    queryFn: fetchMemberVehicles,
    enabled: shouldFetchMemberData,
  });

  const { data: syncDate } = useQuery({
    queryKey: ["syncDate"],
    queryFn: fetchLatestSynchronizationDate,
    enabled: shouldFetchAdminData || shouldFetchMemberData,
  });

  return (
    <>
      <div className="hidden min-h-screen flex-col bg-background xl:flex">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  {role === "admin" && (
                    <AdminOngoing
                      vehicles={adminVehicles || []}
                      isLoadingVehicles={isLoadingAdminVehicles}
                      isErrorVehicles={isErrorAdminVehicles}
                      errorVehicles={errorAdminVehicles}
                      syncDate={syncDate}
                    />
                  )}
                  {role === "member" && (
                    <MemberOngoing
                      vehicles={memberVehicles || []}
                      isLoadingVehicles={isLoadingMemberVehicles}
                      isErrorVehicles={isErrorMemberVehicles}
                      errorVehicles={errorMemberVehicles}
                      syncDate={syncDate}
                    />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/data"
            element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminData 
                    vehicles={adminVehicles}
                    isLoadingVehicles={isLoadingAdminVehicles}
                    isErrorVehicles={isErrorAdminVehicles}
                    errorVehicles={errorAdminVehicles}
                    syncDate={syncDate}
                  />
                </DashboardLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <AdminRoute>
                <DashboardLayout>
                  <Users />
                </DashboardLayout>
              </AdminRoute>
            }
          />
        </Routes>
        <Toaster />
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center xl:hidden">
        <span className="text-center text-md md:text-lg">
          Pour une expérience optimale, <br /> veuillez utiliser votre
          ordinateur !
        </span>
        <img src={CRVOLogo} alt="Logo CRVO" className="mt-12 w-64 md:w-96" />
      </div>
    </>
  );
};

export default App;
