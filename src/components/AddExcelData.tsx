import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import FileUploader from "./FileUploader";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

type ExcelRow = {
  client: string | null;
  immatriculation: string | null;
  modele: string | null;
  dateCreation: Date | null;
};

interface FileInputProps {
  onClose: () => void;
}

const deleteExistingData = async () => {
  const response = await fetch("http://localhost:5000/api/cleanup", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete existing data");
  }

  return response.json();
};

const uploadVehicleData = async (vehicle: ExcelRow) => {
  const response = await fetch("http://localhost:5000/api/vehicles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: vehicle.client,
      password: "motdepasse",
      immatriculation: vehicle.immatriculation,
      modele: vehicle.modele,
      dateCreation: vehicle.dateCreation,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to upload vehicle data");
  }

  return response.json();
};

// Fonction pour convertir un numéro de série Excel en Date
const excelDateToJSDate = (serial: number): Date => {
  const epoch = new Date(Date.UTC(1899, 11, 30)); // 30 décembre 1899
  const days = Math.floor(serial);
  const milliseconds = Math.round((serial - days) * 86400000); // Fraction du jour en millisecondes

  return new Date(epoch.getTime() + days * 86400000 + milliseconds);
};

// Fonction améliorée pour convertir une chaîne de date ou un numéro de série en objet Date
const convertToDate = (value: string | number): Date | null => {
  if (typeof value === 'number') {
    return excelDateToJSDate(value);
  }

  const dateString = String(value);

  // Vérifie si le format est bien DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("/");
    const dayInt = parseInt(day, 10);
    const monthInt = parseInt(month, 10) - 1; // Les mois sont indexés à partir de 0
    const yearInt = parseInt(year, 10);

    return new Date(yearInt, monthInt, dayInt);
  }

  console.error(`Invalid format: ${value}`);
  return null;
};

const AddExcelData: React.FC<FileInputProps> = ({ onClose }) => {
  const [data, setData] = useState<ExcelRow[]>([]);
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

      const filteredData: ExcelRow[] = sheetData
        .slice(1)
        .map((row) => ({
          client:
            row[1] !== null && row[1] !== undefined
              ? String(row[1]).trim()
              : null,
          immatriculation:
            row[2] !== null && row[2] !== undefined
              ? String(row[2]).trim()
              : null,
          modele:
            row[3] !== null && row[3] !== undefined
              ? String(row[3]).trim()
              : null,
          dateCreation: row[8] ? convertToDate(row[8]) : null,
        }))
        .filter(
          (row) =>
            row.client ||
            row.immatriculation ||
            row.modele ||
            row.dateCreation !== null
        );

      setData(filteredData);
    };

    reader.readAsArrayBuffer(file);
  };

  const queryClient = useQueryClient();

  const { mutate: uploadVehicles, isPending } = useMutation({
    mutationFn: async () => {
      await deleteExistingData();
      const promises = data.map((vehicle) => uploadVehicleData(vehicle));
      await Promise.all(promises);
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

  const handleDataSubmit = () => {
    uploadVehicles();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="relative bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-lg">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <X />
        </button>
        <div className="flex flex-col">
          <FileUploader onChange={handleFileUpload} />

          {fileName ? (
            <span className="mt-2 text-gray-700 flex flex-col items-center">
              <span className="font-bold">Fichier sélectionné :</span>{" "}
              {fileName}
            </span>
          ) : (
            <span className="mt-2 text-destructive text-center font-bold">
              Aucun fichier sélectionné
            </span>
          )}

          <Button
            className="mt-3"
            onClick={handleDataSubmit}
            disabled={!fileName || isPending}
          >
            {isPending ? "Chargement..." : "Mettre à jour"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddExcelData;
