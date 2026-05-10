import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function Laboratorios() {
  const { id } = useParams();

  const [laboratorios, setLaboratorios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    capacidad: "",
    tipo: "",
    estado: "Disponible",
  });

  // =========================
  // GET LABS POR EDIFICIO
  // =========================
  useEffect(() => {
    const fetchLaboratorios = async () => {
      try {
        const res = await api.get(`/laboratorio/edificio/${id}`);
        setLaboratorios(res.data);
      } catch (error) {
        console.error(error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLaboratorios();
  }, [id]);

  // =========================
  // CREATE LAB
  // =========================
  const crearLaboratorio = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/laboratorio", {
        ...formData,
        edificioId: id,
      });

      setLaboratorios((prev) => [...prev, res.data]);

      setFormData({
        nombre: "",
        capacidad: "",
        tipo: "",
        estado: "Disponible",
      });

      setMostrarModal(false);
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  // =========================
  // LOADING
  // =========================
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
        <h1 className="text-2xl font-semibold">
          Laboratorios del edificio
        </h1>

        <button
          onClick={() => setMostrarModal(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600"
        >
          + Nuevo laboratorio
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b">
              {["ID", "NOMBRE", "CAPACIDAD", "TIPO", "ESTADO"].map((col) => (
                <th
                  key={col}
                  className="text-left px-5 py-3 text-xs font-semibold text-slate-500"
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
                className={`border-b last:border-none hover:bg-emerald-50/40 ${
                  i % 2 === 1 ? "bg-slate-50/30" : ""
                }`}
              >
                <td className="px-5 py-4 font-mono text-xs text-slate-500">
                  {lab._id?.slice(-6)}
                </td>

                <td className="px-5 py-4 font-medium">
                  {lab.nombre}
                </td>

                <td className="px-5 py-4">
                  {lab.capacidad}
                </td>

                <td className="px-5 py-4">
                  {lab.tipo}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      lab.estado === "Disponible"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {lab.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={crearLaboratorio}
            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold mb-4">
              Nuevo laboratorio
            </h2>

            <input
              className="w-full border p-2 rounded mb-3"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
            />

            <input
              className="w-full border p-2 rounded mb-3"
              placeholder="Capacidad"
              type="number"
              value={formData.capacidad}
              onChange={(e) =>
                setFormData({ ...formData, capacidad: e.target.value })
              }
            />

            <input
              className="w-full border p-2 rounded mb-3"
              placeholder="Tipo"
              value={formData.tipo}
              onChange={(e) =>
                setFormData({ ...formData, tipo: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                className="px-3 py-2 text-sm"
              >
                Cancelar
              </button>

              <button className="px-3 py-2 bg-emerald-500 text-white rounded">
                Crear
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}