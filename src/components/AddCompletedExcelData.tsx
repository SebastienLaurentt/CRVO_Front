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
  dateCompletion: Date | null;
};

interface FileInputProps {
  onClose: () => void;
}

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

// Fonction pour convertir un numéro de série Excel en Date avec inversion des jours et mois
const excelDateToJSDate = (serial: number): Date => {
  // Excel utilise le 30 décembre 1899 comme point de départ pour les dates
  const epoch = new Date(Date.UTC(1899, 11, 30)); // 30 décembre 1899
  const days = Math.floor(serial);
  const milliseconds = Math.round((serial - days) * 86400000); // Fraction du jour en millisecondes

  // Calculer la date de base
  const baseDate = new Date(epoch.getTime() + days * 86400000 + milliseconds);

  // Récupérer le jour, le mois et l'année de la date de base
  const day = baseDate.getUTCDate();
  const month = baseDate.getUTCMonth(); // Les mois sont indexés de 0 à 11
  const year = baseDate.getUTCFullYear();

  // Créer une nouvelle date avec jour et mois inversés
  // Les mois en JavaScript sont indexés de 0 à 11, donc on ajuste cela pour obtenir le mois correct
  const correctedDate = new Date(Date.UTC(year, day - 1, month + 1)); // Inverser jour et mois

  console.log(
    `Converted Excel serial ${serial} to base date ${baseDate.toISOString()}`
  );
  console.log(
    `Corrected Excel serial ${serial} to date ${correctedDate.toISOString()}`
  );

  return correctedDate;
};

const convertToDate = (value: string | number): Date | null => {
  if (typeof value === "number") {
    const date = excelDateToJSDate(value);
    return date;
  }

  const dateString = String(value).trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("/");
    const date = new Date(`${year}-${month}-${day}`);
    return date;
  }

  return null;
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
          dateCompletion: row[5] ? convertToDate(row[5]) : null,
        }))
        .filter(
          (row) => row.client || row.vin || row.statut || row.dateCompletion
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
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
            {isPending ? (
              <span className="flex flex-row gap-x-3">
                {" "}
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
