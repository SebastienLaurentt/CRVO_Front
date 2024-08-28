import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, X } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import FileUploader from "./FileUploader";
import Loader from "./Loader";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

type CompletedVehicleRow = {
  client: string | null;
  vin: string | null;
  statut: string | null;
  dateCompletion: string | null;
  immatriculation?: string | null;
  price?: number | null;
};

interface SupplementaryData {
  vin: string | null;
  immatriculation: string | null;
  price: number | null;
}

interface FileInputProps {
  onClose: () => void;
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

const uploadCompletedVehicleData = async (vehicle: CompletedVehicleRow) => {
  console.log("Données envoyées au backend:", vehicle);

  const response = await fetch("https://crvo-back.onrender.com/api/completed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: vehicle.client,
      immatriculation: vehicle.immatriculation,
      vin: vehicle.vin,
      statut: vehicle.statut,
      dateCompletion: vehicle.dateCompletion,
      price: vehicle.price,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to upload completed vehicle data");
  }

  return response.json();
};

const AddExcelData: React.FC<FileInputProps> = ({ onClose }) => {
  const [data, setData] = useState<CompletedVehicleRow[]>([]);
  const [fileName1, setFileName1] = useState<string | null>(null);
  const [fileName2, setFileName2] = useState<string | null>(null);
  const [isValidFile1, setIsValidFile1] = useState<boolean>(true);
  const [isValidFile2, setIsValidFile2] = useState<boolean>(true);
  const [supplementaryData, setSupplementaryData] = useState<
    SupplementaryData[]
  >([]);

  const handleFirstFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName1(file.name);

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const arrayBuffer = event.target?.result;
      if (!arrayBuffer) return;

      const data = new Uint8Array(arrayBuffer as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (
        | string
        | number
        | null
      )[][];

      if (!isValidCompletedVehicleFile(sheetData)) {
        setIsValidFile1(false);
        toast({
          variant: "destructive",
          title: "Fichier 1 non valide",
        });
        return;
      }

      setIsValidFile1(true);

      const vehicleData: CompletedVehicleRow[] = sheetData
        .slice(1)
        .map((row) => ({
          client: row[0] ? String(row[0]).trim() : null,
          vin: row[2] ? String(row[2]).trim() : null,
          statut: row[4] ? String(row[4]).trim() : null,
          dateCompletion: row[5] ? excelSerialToDate(Number(row[5])) : null,
        }));

      setData(vehicleData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSecondFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName2(file.name);

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const arrayBuffer = event.target?.result;
      if (!arrayBuffer) return;

      const data = new Uint8Array(arrayBuffer as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (
        | string
        | number
        | null
      )[][];

      if (!isValidSupplementaryFile(sheetData)) {
        setIsValidFile2(false);
        toast({
          variant: "destructive",
          title: "Fichier 2 non valide",
        });
        return;
      }

      setIsValidFile2(true);

      const supplementaryData: SupplementaryData[] = sheetData
        .slice(1)
        .map((row) => ({
          immatriculation: row[1] ? String(row[1]).trim() : null, 
          vin: row[2] ? String(row[2]).trim() : null, 
          price: row[4] ? Number(row[4]) : null, 
        }));

      setSupplementaryData(supplementaryData);
    };

    reader.readAsArrayBuffer(file);
  };

  const mergeData = () => {
    const filteredSupplementaryData = supplementaryData.filter((supplement) =>
      data.some((vehicle) => vehicle.vin === supplement.vin)
    );

    const filteredData = data.filter(
      (vehicle) => vehicle.statut === "Sortie Usine"
    );

    const mergedData = filteredData.map((vehicle) => {
      const matchingSupplement = filteredSupplementaryData.find(
        (supplement) => supplement.vin === vehicle.vin
      );
      return {
        ...vehicle,
        immatriculation: matchingSupplement?.immatriculation || null,
        price: matchingSupplement?.price || null,
      };
    });

    setData(mergedData);
  };

  const queryClient = useQueryClient();

  const { mutate: uploadCompletedVehicles, isPending } = useMutation({
    mutationFn: async () => {
      const promises = data.map((vehicle) =>
        uploadCompletedVehicleData(vehicle)
      );
      await Promise.all(promises);
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

  const handleDataSubmit = () => {
    mergeData();
    uploadCompletedVehicles();
  };

  const handleFileRemove1 = () => {
    setFileName1(null);
    setData([]);
    setIsValidFile1(true);
  };

  const handleFileRemove2 = () => {
    setFileName2(null);
    setSupplementaryData([]);
    setIsValidFile2(true);
  };

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
                <span className="font-bold">Fichier 1: </span> Client, Vin, Date
                de Rénovation
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

          <div className="flex flex-col justify-between py-4">
            <div className="flex flex-row items-center gap-x-4">
              <span>
                {" "}
                <span className="font-bold">Fichier 1: </span>
                {fileName1 ? (
                  <>{fileName1} </>
                ) : (
                  <span className="text-red-500">
                    Aucun fichier sélectionné{" "}
                  </span>
                )}
              </span>
              {fileName1 ? (
                <button
                  onClick={handleFileRemove1}
                  className=" text-red-500 hover:text-red-700"
                >
                  <Trash2 />
                </button>
              ) : (
                ""
              )}
            </div>
            <div className="flex flex-row items-center">
              <span>
                {" "}
                <span className="font-bold">Fichier 2: </span>
                {fileName2 ? (
                  <>{fileName2} </>
                ) : (
                  <span className="text-red-500">
                    Aucun fichier sélectionné{" "}
                  </span>
                )}
              </span>
              {fileName2 ? (
                <button
                  onClick={handleFileRemove2}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 />
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
          <Button
            onClick={handleDataSubmit}
            disabled={!fileName1 || !fileName2 || isPending}
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
