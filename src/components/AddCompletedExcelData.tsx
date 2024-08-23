import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
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
};

interface FileInputProps {
  onClose: () => void;
}

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
  const response = await fetch("https://crvo-back.onrender.com/api/completed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: vehicle.client,
      password: "motdepasse",
      vin: vehicle.vin,
      statut: vehicle.statut,
      dateCompletion: vehicle.dateCompletion,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to upload completed vehicle data");
  }

  return response.json();
};

const AddExcelData: React.FC<FileInputProps> = ({ onClose }) => {
  const [data, setData] = useState<CompletedVehicleRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

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

      const filteredData: CompletedVehicleRow[] = sheetData
        .slice(1)
        .map((row) => ({
          client: row[0] ? String(row[0]).trim() : null,
          vin: row[2] ? String(row[2]).trim() : null,
          statut: row[4] ? String(row[4]).trim() : null,
          dateCompletion: row[5] ? excelSerialToDate(Number(row[5])) : null,
        }))
        .filter(
          (row) =>
            row.statut === "Sortie Usine" &&
            (row.client || row.vin || row.dateCompletion) 
        );

      setData(filteredData);
    };

    reader.readAsArrayBuffer(file);
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
    uploadCompletedVehicles();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-[90%] max-w-lg rounded-lg bg-white p-4 shadow-lg">
        <button
          className="absolute right-2 top-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <X />
        </button>
        <div className="flex flex-col">
          <FileUploader onChange={handleFileUpload} />

          {fileName ? (
            <span className="mt-2 flex flex-col items-center text-gray-700">
              <span className="font-bold">Fichier sélectionné :</span>{" "}
              {fileName}
            </span>
          ) : (
            <span className="mt-2 text-center font-bold text-destructive">
              Aucun fichier sélectionné
            </span>
          )}

          <Button
            className="mt-3"
            onClick={handleDataSubmit}
            disabled={!fileName || isPending}
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
