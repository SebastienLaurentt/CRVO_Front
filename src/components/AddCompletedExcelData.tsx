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
interface CompletedVehicleRow {
  client: string | null;
  vin: string | null;
  statut: string | null;
  dateCompletion: string | null;
  immatriculation?: string | null;
  price?: number | null;
}

// File2 Data
interface SupplementaryData {
  vin: string | null;
  immatriculation: string | null;
  price: number | null;
}

const isValidCompletedVehicleFile = (
  sheetData: (string | number | null)[][]
): boolean => {
  const headers = sheetData[0]
    .filter((header) => header !== null && String(header).trim() !== "")
    .map((header) => String(header).trim());

  const requiredHeaders = ["Client", "VIN", "Statut", "Date"];

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    console.error("En-têtes manquants:", missingHeaders);
    return false;
  }

  return true;
};

const isValidSupplementaryFile = (
  sheetData: (string | number | null)[][]
): boolean => {
  const headers = sheetData[0]
    .filter((header) => header !== null && String(header).trim() !== "")
    .map((header) => String(header).trim());

  const requiredHeaders = ["VIN", "IMMAT", "FRE Moyens"];

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    console.error(
      "En-têtes manquants du fichier complémentaire:",
      missingHeaders
    );
    return false;
  }

  return true;
};

const excelSerialToDate = (serial: number) => {
  const excelStartDate = new Date(1900, 0, 1);
  const daysOffset = serial - 2;
  const resultDate = new Date(
    excelStartDate.getTime() + daysOffset * 24 * 60 * 60 * 1000
  );

  const day = String(resultDate.getDate()).padStart(2, "0");
  const month = String(resultDate.getMonth() + 1).padStart(2, "0");
  const year = resultDate.getFullYear();

  return `${day}/${month}/${year}`;
};

const uploadCompletedVehiclesBatch = async (vehicles: CompletedVehicleRow[]) => {
  const formattedVehicles = vehicles.map(vehicle => ({
    username: vehicle.client,
    immatriculation: vehicle.immatriculation,
    vin: vehicle.vin,
    statut: vehicle.statut,
    dateCompletion: vehicle.dateCompletion,
    price: vehicle.price,
  }));

  const response = await fetch("https://crvo-back.onrender.com/api/completed/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formattedVehicles),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const deleteExistingCompletedData = async () => {
  const response = await fetch("https://crvo-back.onrender.com/api/cleanUpCompletedVehicle", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete existing completed vehicle data");
  }

  return response.json();
};

const AddExcelData = ({ onClose }: { onClose: () => void }) => {
  const [dataFile1, setDataFile1] = useState<CompletedVehicleRow[]>([]);
  const [dataFile2, setDataFile2] = useState<SupplementaryData[]>([]);
  const [fileName1, setFileName1] = useState<string | null>(null);
  const [fileName2, setFileName2] = useState<string | null>(null);
  const [isValidFile1, setIsValidFile1] = useState<boolean>(true);
  const [isValidFile2, setIsValidFile2] = useState<boolean>(true);

  // Handle first file, upload and remove
  const handleFirstFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileUpload<CompletedVehicleRow>(
      e,
      isValidCompletedVehicleFile,
      setFileName1,
      setDataFile1,
      setIsValidFile1,
      (sheetData) =>
        sheetData.slice(1).map((row) => ({
          client: row[0] ? String(row[0]).trim() : null,
          vin: row[2] ? String(row[2]).trim() : null,
          statut: row[4] ? String(row[4]).trim() : null,
          dateCompletion: row[5] ? excelSerialToDate(Number(row[5])) : null,
        })),
      "Fichier 1 non valide"
    );
  };

  const handleFileRemove1 = () => {
    setFileName1(null);
    setDataFile1([]);
    setIsValidFile1(true);
  };

  // Handle second file, upload and remove
  const handleSecondFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileUpload<SupplementaryData>(
      e,
      isValidSupplementaryFile,
      setFileName2,
      setDataFile2,
      setIsValidFile2,
      (sheetData) =>
        sheetData.slice(1).map((row) => ({
          immatriculation: row[1] ? String(row[1]).trim() : null,
          vin: row[2] ? String(row[2]).trim() : null,
          price: row[4] ? Number(row[4]) : null,
        })),
      "Fichier 2 non valide"
    );
  };

  const handleFileRemove2 = () => {
    setFileName2(null);
    setDataFile2([]);
    setIsValidFile2(true);
  };

  // Handle data merging
  const mergeData = () => {
    const filteredFile2Data = dataFile2.filter((supplement) =>
      dataFile1.some((vehicle) => vehicle.vin === supplement.vin)
    );

    const filteredFile1Data = dataFile1.filter(
      (vehicle) => vehicle.statut === "Sortie Usine"
    );

    const mergedData = filteredFile1Data.map((vehicle) => {
      const matchingSupplement = filteredFile2Data.find(
        (supplement) => supplement.vin === vehicle.vin
      );
      return {
        ...vehicle,
        immatriculation: matchingSupplement?.immatriculation || null,
        price: matchingSupplement?.price || null,
      };
    });

    setDataFile1(mergedData);
  };

  // Handle data submit
  const handleDataSubmit = () => {
    mergeData();
    uploadCompletedVehicles();
  };

  const queryClient = useQueryClient();
  const { mutate: uploadCompletedVehicles, isPending } = useMutation({
    mutationFn: async () => {
      await deleteExistingCompletedData();
      await uploadCompletedVehiclesBatch(dataFile1);
    },
    onSuccess: () => {
      toast({ title: "Données mises à jour avec succès !" });
      queryClient.invalidateQueries({ queryKey: ["completed-vehicles"] });
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
        <div className="flex flex-col">
          <div className="my-4">
            <div className="flex flex-row justify-between">
              <span>
                <span className="font-bold">Fichier 1: </span> Client, VIN et
                Date de Rénovation
              </span>
              {!isValidFile1 && <p className=" text-red-500">Non valide</p>}
            </div>
            <FileUploader onChange={handleFirstFileUpload} />
          </div>
          <div>
            <div className="flex flex-row justify-between">
              <span>
                <span className="font-bold">Fichier 2: </span>
                Immatriculation et Prix
              </span>
              {!isValidFile2 && (
                <span className="text-red-500">Non valide</span>
              )}
            </div>
            <FileUploader onChange={handleSecondFileUpload} />
          </div>

          <div className="flex flex-col justify-between gap-y-1 py-4">
            <FileDisplay
              fileName={fileName1}
              handleRemove={handleFileRemove1}
              label="Fichier 1: "
            />
            <FileDisplay
              fileName={fileName2}
              handleRemove={handleFileRemove2}
              label="Fichier 2: "
            />
          </div>
          <Button
            onClick={handleDataSubmit}
            disabled={
              !fileName1 ||
              !fileName2 ||
              !isValidFile1 ||
              !isValidFile2 ||
              isPending
            }
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