import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {obtenerLaboratoriosPorEdificio, crearLaboratorio } from "../services/laboratorioService";

import LaboratorioTable from "../components/laboratorios/LaboratorioTable";
import LaboratorioModal from "../components/laboratorios/LaboratorioModal";
import { PageHeader } from "../components/SharedUi";

export default function Laboratorios() {
  const { id } = useParams();

  const [laboratorios, setLaboratorios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [laboratorioEditando, setLaboratorioEditando] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    capacidad: "",
    tipo: "",
    tieneEquipos: false,
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
  /*const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };*/

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // =========================
  // CREATE y editar
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // EDITAR
      if (laboratorioEditando) {
      setLaboratorios((prev) =>
        prev.map((lab) =>
          lab.id === laboratorioEditando.id
            ? {
                ...lab,
                ...formData,
              }
            : lab
        )
      );
        setLaboratorioEditando(null);
      }

      // CREAR
      else {
      const nuevoLab = await crearLaboratorio({
        ...formData,
        capacidad: Number(formData.capacidad),
        edificioId: id,
      });

      setLaboratorios((prev) => [
        ...prev,
        {
          ...nuevoLab,
          tieneEquipos: formData.tieneEquipos,
        },
      ]);
    }

      setFormData({
        nombre: "",
        capacidad: "",
        tipo: "",
        estado: "disponible",
        tieneEquipos: false,
      });

      setMostrarModal(false);

    } catch (error) {
      console.error("ERROR BACK:", error.response?.data || error);
    }
  };

  const handleEditar = (lab) => {
    setLaboratorioEditando(lab);

    setFormData({
      nombre: lab.nombre,
      capacidad: lab.capacidad,
      tipo: lab.tipo,
      estado: lab.estado,
      tieneEquipos: false,
    });

    setMostrarModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 px-8 py-8">

      {/* HEADER */}
      <PageHeader title="Laboratorios" />

      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => {
            setLaboratorioEditando(null);

            setFormData({
              nombre: "",
              capacidad: "",
              tipo: "",
              tieneEquipos: false,
            });

            setMostrarModal(true);
          }}
          className="px-4 py-2 rounded-xl text-sm font-medium border border-emerald-200 text-emerald-600 bg-white hover:bg-emerald-50 hover:text-emerald-700 transition-colors ml-1 shadow-sm"
        >
          + Nuevo laboratorio
        </button>
      </div>

      {/* TABLE */}
      <LaboratorioTable
        laboratorios={laboratorios}
        onEditar={handleEditar}
      />

      {/* MODAL */}
      <LaboratorioModal
        mostrar={mostrarModal}
        cerrarModal={() => setMostrarModal(false)}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        esEdicion={!!laboratorioEditando}
      />
    </div>
  );
}