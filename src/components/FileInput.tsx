import React, { useState, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

type ExcelData = (string | number | null)[];

const FileInput: React.FC = () => {
  const [data, setData] = useState<ExcelData[]>([]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const arrayBuffer = event.target?.result;
      if (!arrayBuffer) return;

      const data = new Uint8Array(arrayBuffer as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as ExcelData[];

      const filteredData = sheetData
        .slice(1)  // Ignore the first row
        .map(row => [
          row[1],  
          row[2],  
          row[3],  
          row[13]   
        ]);

      setData(filteredData);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      {data.length > 0 && (
          <table>
            <thead >
              <tr className='text-left' >
                <th className='px-4'>Client</th>
                <th className='px-4'>Immatriculation</th>
                <th className='px-4' >Modèle</th>
                <th className='px-4'>Jours depuis Reception</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} >
                  <td className='px-4'>{row[0]}</td>
                  <td className='px-4'>{row[1]}</td>
                  <td className='px-4'>{row[2]}</td>
                  <td className='px-4'>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
      )}
    </div>
  );
};

export default FileInput;
