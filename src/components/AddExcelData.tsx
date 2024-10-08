import { handleFileUpload } from "@/lib/fileUpload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { ChangeEvent, useState } from "react";
import FileDisplay from "./FileDisplay";
import FileUploader from "./FileUploader";
import Loader from "./Loader";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

// File1  and FileMerged Data
type VehicleRow = {
  client: string | null;
  immatriculation: string | null;
  vin: string | null;
  modele: string | null;
  dateCreation: Date | null;
  mecanique: boolean;
  carrosserie: boolean;
  ct: boolean;
  dsp: boolean;
  jantes: boolean;
  price?: string | null;
};

interface FileInputProps {
  onClose: () => void;
}

const isValidVehicleFile = (
  sheetData: (string | number | null)[][]
): boolean => {
  const headers = sheetData[0]
    .filter((header) => header !== null && String(header).trim() !== "")
    .map((header) => String(header).trim());

  const requiredHeaders = [
    "Client",
    "Immatriculation",
    "VIN",
    "Modèle",
    "Date création",
    "Mécanique",
    "Carrosserie",
    "CT",
    "DSP",
    "Jantes",
  ];

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    console.error("En-têtes manquants:", missingHeaders);
    return false;
  }

  return true;
};

const excelDateToJSDate = (serial: number): Date => {
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const days = Math.floor(serial);
  const milliseconds = Math.round((serial - days) * 86400000);

  const baseDate = new Date(epoch.getTime() + days * 86400000 + milliseconds);
  const day = baseDate.getUTCDate();
  const month = baseDate.getUTCMonth();
  const year = baseDate.getUTCFullYear();

  const correctedDate = new Date(Date.UTC(year, day - 1, month + 1));
  return correctedDate;
};

const convertToDate = (value: string | number): Date | null => {
  if (typeof value === "number") {
    return excelDateToJSDate(value);
  }

  const dateString = String(value).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  return null;
};

const deleteExistingData = async () => {
  const response = await fetch(
    "https://crvo-back.onrender.com/api/cleanUpVehicle",
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete existing data");
  }

  return response.json();
};

const uploadVehiclesBatch = async (vehicles: VehicleRow[]) => {
  const formattedVehicles = vehicles.map((vehicle) => ({
    username: vehicle.client,
    immatriculation: vehicle.immatriculation,
    vin: vehicle.vin,
    modele: vehicle.modele,
    price: vehicle.price,
    dateCreation: vehicle.dateCreation,
    mecanique: vehicle.mecanique,
    carrosserie: vehicle.carrosserie,
    ct: vehicle.ct,
    dsp: vehicle.dsp,
    jantes: vehicle.jantes,
  }));

  const response = await fetch(
    "https://crvo-back.onrender.com/api/vehicles/batch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedVehicles),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const AddExcelData = ({ onClose }: FileInputProps) => {
  const [dataFile1, setDataFile1] = useState<VehicleRow[]>([]);
  const [fileName1, setFileName1] = useState<string | null>(null);
  const [isValidFile1, setIsValidFile1] = useState<boolean>(true);

  const handleFirstFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileUpload<VehicleRow>(
      e,
      isValidVehicleFile,
      setFileName1,
      setDataFile1,
      setIsValidFile1,
      (sheetData) =>
        sheetData.slice(1).map((row) => ({
          client: row[1] ? String(row[1]).trim() : null,
          immatriculation: row[2] ? String(row[2]).trim() : null,
          vin: row[5] ? String(row[5]).trim() : null,
          modele: row[3] ? String(row[3]).trim() : null,
          dateCreation: row[8] ? convertToDate(row[8]) : null,
          mecanique: String(row[16]).trim().toLowerCase() === "oui",
          carrosserie: String(row[17]).trim().toLowerCase() === "oui",
          ct: String(row[18]).trim().toLowerCase() === "oui",
          dsp: String(row[19]).trim().toLowerCase() === "oui",
          jantes: String(row[20]).trim().toLowerCase() === "oui",
        })),
      "Fichier 1 non valide"
    );
  };

  const queryClient = useQueryClient();

  const handleFileRemove1 = () => {
    setFileName1(null);
    setDataFile1([]);
    setIsValidFile1(true);
  };

  const handleDataSubmit = () => {
    uploadVehicles();
  };

  const { mutate: uploadVehicles, isPending } = useMutation({
    mutationFn: async () => {
      await deleteExistingData();
      await uploadVehiclesBatch(dataFile1);
    },
    onSuccess: () => {
      toast({ title: "Données mises à jour avec succès !" });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur lors de la mise à jour des données",
        description: (error as Error).message,
      });
    },
  });

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
      <div className="relative w-[90%] max-w-lg rounded-lg bg-white p-4 shadow-lg">
        <button
          className="absolute right-2 top-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <X />
        </button>
        <div className=" flex flex-col">
          <div className="my-4">
            <div className="flex flex-row justify-between">
              <span>
                <span className="font-bold">Fichier 1: </span> Client,
                Immatriculation, Modèle, J+ et étapes
              </span>
              {!isValidFile1 && <p className=" text-red-500">Non valide</p>}
            </div>
            <FileUploader onChange={handleFirstFileUpload} />
          </div>

          <div className="flex flex-col justify-between gap-y-1 py-4">
            <FileDisplay
              fileName={fileName1}
              handleRemove={handleFileRemove1}
              label="Fichier 1: "
            />
          </div>

          <Button
            onClick={handleDataSubmit}
            disabled={!fileName1 || !isValidFile1 || isPending}
          >
            {isPending ? (
              <span className="flex flex-row gap-x-3">
                Import en cours <Loader isButtonSize />
              </span>
            ) : (
              "Mettre à jour"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddExcelData;
