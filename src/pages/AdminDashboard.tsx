import AddCompletedExcelData from "@/components/AddCompletedExcelData";
import AddExcelData from "@/components/AddExcelData";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  AudioLines,
  BadgeCheck,
  Car,
  LifeBuoy,
  ShieldCheck,
  SprayCan,
  Upload,
  User,
  Wrench,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

// Définitions des types pour les véhicules
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

// interface CompletedVehicle {
//   _id: string;
//   vin: string;
//   statut: string;
//   dateCompletion: string;
//   user: {
//     username: string;
//   };
// }

// Fonction pour calculer le nombre de jours depuis la création
const daysSince = (dateString: string): number => {
  const creationDate = new Date(dateString);
  const today = new Date();
  const timeDiff = today.getTime() - creationDate.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

// Fonction pour récupérer les véhicules en cours
const fetchVehicles = async (): Promise<Vehicle[]> => {
  const response = await fetch("https://crvo-back.onrender.com/api/vehicles");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des véhicules.");
  }
  const data = await response.json();
  return data;
};

// Fonction pour récupérer les véhicules terminés
// const fetchCompletedVehicles = async (): Promise<CompletedVehicle[]> => {
//   const response = await fetch("https://crvo-back.onrender.com/api/completed");
//   if (!response.ok) {
//     throw new Error("Erreur lors de la récupération des véhicules terminés.");
//   }
//   const data = await response.json();
//   return data;
// };

const AdminDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFileInputVisible, setIsFileInputVisible] = useState(false);
  const [isCompletedFileInputVisible, setIsCompletedFileInputVisible] =
    useState(false);
  // const [viewCompletedVehicles, setViewCompletedVehicles] = useState(false);

  // Utilisation de React Query pour récupérer les données des véhicules en cours et terminés
  const {
    data: vehicles,
    isLoading: isLoadingVehicles,
    isError: isErrorVehicles,
    error: errorVehicles,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
  });

  // const {
  //   data: completedVehicles,
  //   isLoading: isLoadingCompletedVehicles,
  //   isError: isErrorCompletedVehicles,
  //   error: errorCompletedVehicles,
  // } = useQuery({
  //   queryKey: ["completed-vehicles"],
  //   queryFn: fetchCompletedVehicles,
  // });

  // Filtrer les véhicules en fonction de la requête de recherche
  const filteredVehicles = vehicles?.filter((vehicle) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vehicle.immatriculation.toLowerCase().includes(searchLower) ||
      vehicle.modele.toLowerCase().includes(searchLower) ||
      vehicle.user.username.toLowerCase().includes(searchLower)
    );
  });

  // Filtrer les véhicules terminés en fonction de la requête de recherche
  // const filteredCompletedVehicles = completedVehicles?.filter((vehicle) => {
  //   const searchLower = searchQuery.toLowerCase();
  //   return (
  //     vehicle.vin.toLowerCase().includes(searchLower) ||
  //     vehicle.statut.toLowerCase().includes(searchLower) ||
  //     vehicle.user.username.toLowerCase().includes(searchLower)
  //   );
  // });

  // Trier les véhicules par date de création
  const sortedVehicles = filteredVehicles?.sort(
    (a, b) => daysSince(b.dateCreation) - daysSince(a.dateCreation)
  );

  // Trier les véhicules terminés par date de complétion
  // const sortedCompletedVehicles = filteredCompletedVehicles?.sort(
  //   (a, b) => daysSince(b.dateCompletion) - daysSince(a.dateCompletion)
  // );

  // Fonction pour afficher le tableau des véhicules en cours
  const renderVehicleTable = () => (
    <table className="w-full">
      <thead>
        <tr className="text-left bg-primary border-b sticky top-[88px] z-10">
          <th className="py-3 px-6 w-[300px]">Client</th>
          <th className="py-3 px-6 w-[200px]">Immatriculation</th>
          <th className="py-3 px-6 w-[250px]">Modèle</th>
          <th className="py-3 px-6 w-[200px] text-center">
            Jours depuis Création
          </th>
          <th className="py-3 px-6 w-[150px] text-center">
            <Wrench className="inline-block mb-0.5" /> Mécanique
          </th>
          <th className="py-3 px-6 w-[150px] text-center">
            <Car className="inline-block mb-0.5" /> Carrosserie
          </th>
          <th className="py-3 px-6 w-[80px] text-center">
            <ShieldCheck className="inline-block mb-0.5" /> CT
          </th>
          <th className="py-3 px-6 w-[100px] text-center">
            <AudioLines className="inline-block mb-0.5" /> DSP
          </th>
          <th className="py-3 px-6 w-[100px] text-center">
            <LifeBuoy className="inline-block mb-0.5" /> Jantes
          </th>
          <th className="py-3 px-6 w-[100px] text-center">
            <SprayCan className="inline-block mb-0.5" /> Esthétique
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedVehicles && sortedVehicles.length > 0 ? (
          sortedVehicles.map((vehicle: Vehicle) => (
            <tr key={vehicle._id} className="border-b last:border-b-0">
              <td className="py-4 px-6">{vehicle.user.username}</td>
              <td className="py-4 px-6">{vehicle.immatriculation}</td>
              <td className="py-4 px-6">{vehicle.modele}</td>
              <td className="py-4 px-6 text-center">
                {daysSince(vehicle.dateCreation)}
              </td>
              <td className="py-4 px-6 text-center">
                {vehicle.mecanique ? (
                  <BadgeCheck className="inline-block" />
                ) : (
                  ""
                )}
              </td>
              <td className="py-4 px-6 text-center">
                {vehicle.carrosserie ? (
                  <BadgeCheck className="inline-block" />
                ) : (
                  ""
                )}
              </td>
              <td className="py-4 px-6 text-center">
                {vehicle.ct ? <BadgeCheck className="inline-block" /> : ""}
              </td>
              <td className="py-4 px-6 text-center">
                {vehicle.dsp ? <BadgeCheck className="inline-block" /> : ""}
              </td>
              <td className="py-4 px-6 text-center">
                {vehicle.jantes ? <BadgeCheck className="inline-block" /> : ""}
              </td>
              <td className="py-4 px-6 text-center">
                {vehicle.esthetique ? (
                  <BadgeCheck className="inline-block" />
                ) : (
                  ""
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={10} className="text-center pt-8 font-medium">
              Aucune donnée disponible actuellement.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  // Fonction pour afficher le tableau des véhicules terminés
  // const renderCompletedVehicleTable = () => (
  //   <table className="w-full">
  //     <thead>
  //       <tr className="text-left bg-primary border-b sticky top-[88px] z-10">
  //         <th className="py-3 px-6 w-[300px]">Client</th>
  //         <th className="py-3 px-6 w-[200px]">VIN</th>
  //         <th className="py-3 px-6 w-[250px]">Statut</th>
  //         <th className="py-3 px-6 w-[200px] text-center">
  //           Date de Complétion
  //         </th>
  //       </tr>
  //     </thead>
  //     <tbody>
  //       {sortedCompletedVehicles && sortedCompletedVehicles.length > 0 ? (
  //         sortedCompletedVehicles.map((vehicle: CompletedVehicle) => (
  //           <tr key={vehicle._id} className="border-b last:border-b-0">
  //             <td className="py-4 px-6">{vehicle.user.username}</td>
  //             <td className="py-4 px-6">{vehicle.vin}</td>
  //             <td className="py-4 px-6">{vehicle.statut}</td>
  //             <td className="py-4 px-6 text-center">
  //               {new Date(vehicle.dateCompletion).toLocaleDateString()}
  //             </td>
  //           </tr>
  //         ))
  //       ) : (
  //         <tr>
  //           <td colSpan={4} className="text-center pt-8 font-medium">
  //             Aucune donnée disponible actuellement.
  //           </td>
  //         </tr>
  //       )}
  //     </tbody>
  //   </table>
  // );

  if (isLoadingVehicles)
    return (
      <div className="flex flex-col items-center mt-60">
        <Loader />
      </div>
    );
  if (isErrorVehicles)
    return (
      // <p>
      //   Error:{" "}
      //   {errorVehicles instanceof Error
      //     ? errorVehicles.message
      //     : errorCompletedVehicles instanceof Error
      //     ? errorCompletedVehicles.message
      //     : "Unknown error"}
      // </p>
      <p>
        Error:{" "}
        {errorVehicles instanceof Error
          ? errorVehicles.message
          : "Unknown error"}
      </p>
    );

  return (
    <div className="py-8 px-12 border rounded-lg shadow-2xl my-8">
      <h1 className="text-left">Tableau de bord Admin</h1>
      <div className="flex flex-row justify-between pb-4 pt-8 sticky top-0 z-10 bg-white">
        <div className="flex flex-row gap-x-3">
          <Input
            placeholder="Recherche"
            className="text-sm"
            value={searchQuery}
            hasSearchIcon
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Bouton pour basculer entre les tableaux */}
          {/* <Button
            onClick={() => setViewCompletedVehicles(!viewCompletedVehicles)}
          >
            {viewCompletedVehicles ? "Voir les Véhicules" : "Voir les Terminés"}
          </Button> */}
        </div>
        <div className="flex flex-row gap-x-2 ml-8 2xl:ml-60">
          <Button className="space-x-[5px]" asChild>
            <Link to="/clients">
              <User size={20} />
              <span>Infos Client</span>
            </Link>
          </Button>
          {/* <Button
            className="space-x-[5px]"
            onClick={() => setIsCompletedFileInputVisible(true)}
          >
            <Upload size={20} /> <span>Fichier Réparations Terminées</span>
          </Button> */}
          <Button
            className="space-x-[5px]"
            onClick={() => setIsFileInputVisible(true)}
          >
            <Upload size={20} /> <span>Nouveau Fichier</span>
          </Button>
        </div>
      </div>

      {/* Affichage conditionnel des tableaux */}
      {/* {viewCompletedVehicles ? renderCompletedVehicleTable() : renderVehicleTable()} */}

      {renderVehicleTable()}

      {isFileInputVisible && (
        <AddExcelData onClose={() => setIsFileInputVisible(false)} />
      )}

      {isCompletedFileInputVisible && (
        <AddCompletedExcelData
          onClose={() => setIsCompletedFileInputVisible(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
