import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function Laboratorios() {
  const { id } = useParams();

  const [laboratorios, setLaboratorios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLaboratorios = async () => {
      try {
        const res = await api.get(
          `/laboratorio/edificio/${id}`
        );

        setLaboratorios(res.data);
      } catch (error) {
        console.error(
          "Error al cargar laboratorios:",
          error.response?.data || error.message
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLaboratorios();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Cargando laboratorios...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 px-8 py-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Laboratorios del edificio
        </h1>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {["ID", "NOMBRE", "CAPACIDAD", "ESTADO"].map((col) => (
                <th
                  key={col}
                  className="text-left text-xs font-semibold text-slate-500 tracking-wider px-5 py-3"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {laboratorios.map((lab, i) => (
              <tr
                key={lab._id}
                className={`border-b border-slate-100 last:border-none hover:bg-emerald-50/50 transition-colors ${
                  i % 2 === 1 ? "bg-slate-50/30" : ""
                }`}
              >
                <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                  {lab._id?.slice(-6)}
                </td>

                <td className="px-5 py-4 text-slate-800 font-medium">
                  {lab.nombre}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {lab.capacidad ?? "—"}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      lab.disponible
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {lab.disponible ? "Disponible" : "Ocupado"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}