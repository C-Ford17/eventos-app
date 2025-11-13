// src/components/DataTable.tsx
import React from 'react';

interface DataTableProps {
  title: string;
  columns: string[];
  data: Record<string, any>[];
}

export default function DataTable({ title, columns, data }: DataTableProps) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-2 border-b text-left text-sm">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-2 border-b text-sm">{row[col]}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-2 text-center text-gray-400">Sin datos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
