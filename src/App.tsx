import { Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { useAuth } from "./lib/auth";
import AdminCompleted from "./pages/Admin/AdminCompleted";
import AdminData from "./pages/Admin/AdminData";
import AdminOngoing from "./pages/Admin/AdminOngoing";
import Users from "./pages/Admin/Users";
import Login from "./pages/Login";
import MemberCompleted from "./pages/Members/MemberCompleted";
import MemberOngoing from "./pages/Members/MemberOngoing";
import CRVOLogo from "/public/images/CRVOLogo.png";
import { useQuery } from "@tanstack/react-query";

export interface Vehicle {
  _id: string;
  immatriculation: string;
  modele: string;
  dateCreation: string;
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
  const response = await fetch("https://crvo-back.onrender.com/api/vehicles");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des véhicules.");
  }
  const data = await response.json();
  return data;
};

const fetchLatestSynchronizationDate = async (): Promise<Date | null> => {
  const response = await fetch(
    "https://crvo-back.onrender.com/api/synchronization"
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

  const {
    data: vehicles,
    isLoading: isLoadingVehicles,
    isError: isErrorVehicles,
    error: errorVehicles,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
  });

  const { data: syncDate } = useQuery({
    queryKey: ["syncDate"],
    queryFn: fetchLatestSynchronizationDate,
  });

  // Filter vehicles for AdminOngoing (excluding "Stockage" and "Transport retour")
  const ongoingVehicles = vehicles?.filter(
    (vehicle) => vehicle.statusCategory !== "Stockage" && vehicle.statusCategory !== "Transport retour"
  );

  // Filter vehicles for AdminCompleted (only "Stockage" and "Transport retour")
  const completedVehicles = vehicles?.filter(
    (vehicle) => vehicle.statusCategory === "Stockage" || vehicle.statusCategory === "Transport retour"
  );

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
                      vehicles={ongoingVehicles}
                      isLoadingVehicles={isLoadingVehicles}
                      isErrorVehicles={isErrorVehicles}
                      errorVehicles={errorVehicles}
                      syncDate={syncDate}
                    />
                  )}
                  {role === "member" && <MemberOngoing />}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/completed"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  {role === "admin" && (
                    <AdminCompleted
                      vehicles={completedVehicles}
                      isLoadingVehicles={isLoadingVehicles}
                      isErrorVehicles={isErrorVehicles}
                      errorVehicles={errorVehicles}
                      syncDate={syncDate}
                    />
                  )}
                  {role === "member" && <MemberCompleted />}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/data"
            element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminData />
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
