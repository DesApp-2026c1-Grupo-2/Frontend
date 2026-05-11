import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  obtenerLaboratoriosPorEdificio,
  crearLaboratorio,
} from "../services/laboratorioService";

import LaboratorioTable from "../components/laboratorios/LaboratorioTable";
import LaboratorioModal from "../components/laboratorios/LaboratorioModal";

export default function Laboratorios() {
  const { id } = useParams();

  if (!id) { // hay q eliminar todo el if???????
    return (
      <div className="p-6 text-red-600">  
        Error: no se recibió el ID del edificio
      </div>
    );
  }

  const [laboratorios, setLaboratorios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    capacidad: "",
    tipo: "",
    estado: "disponible",
  });

  // =========================
  // GET
  // =========================
  const cargarLaboratorios = async () => {
    try {
      const data = await obtenerLaboratoriosPorEdificio(id);
      setLaboratorios(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarLaboratorios();
  }, [id]);

  // =========================
  // INPUTS
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // CREATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("FORM DATA:", formData); // eliminaraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    console.log("FORM:", formData);
    console.log("ID:", id);

    try {
      const nuevoLab = await crearLaboratorio({
        ...formData,
        capacidad: Number(formData.capacidad),
        edificioId: id,
      });

      setLaboratorios((prev) => [...prev, nuevoLab]);

      setFormData({
        nombre: "",
        capacidad: "",
        tipo: "",
        estado: "disponible",
      });

      setMostrarModal(false);
    } catch (error) {
      console.error("ERROR BACK:", error.response?.data || error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Cargando laboratorios...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-8">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          Laboratorios del edificio
        </h1>

        <button
          onClick={() => setMostrarModal(true)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-xl"
        >
          + Nuevo laboratorio
        </button>
      </div>

      {/* TABLE */}
      <LaboratorioTable laboratorios={laboratorios} />

      {/* MODAL */}
      <LaboratorioModal
        mostrar={mostrarModal}
        cerrarModal={() => setMostrarModal(false)}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}