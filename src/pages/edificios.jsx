import { useEffect, useState } from "react";

import EdificioCard from "../components/edificios/EdificioCard";
import CrearEdificioModal from "../components/edificios/CrearEdificioModal";

import {
  obtenerEdificios,
  crearEdificio,
} from "../services/edificioService";

export default function Edificios() {

  const [edificios, setEdificios] = useState([]);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
  });

  /*
    =========================
    OBTENER EDIFICIOS
    =========================
  */
  const cargarEdificios = async () => {
    try {
      const data = await obtenerEdificios();

      setEdificios(data);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarEdificios();
  }, []);

  /*
    =========================
    HANDLE INPUTS
    =========================
  */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /*
    =========================
    CREAR EDIFICIO
    =========================
  */
  const handleCrearEdificio = async (e) => {
    e.preventDefault();

    try {

      await crearEdificio({
        nombre: formData.nombre,
        direccion: formData.direccion,
      });

      await cargarEdificios();

      setFormData({
        nombre: "",
        direccion: "",
      });

      setMostrarModal(false);

    } catch (error) {
      console.error("ERROR BACK:", error.response?.data || error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">

        <h1 className="text-3xl font-bold text-gray-800">
          Edificios
        </h1>

        <button
          onClick={() => setMostrarModal(true)}
          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-5
            py-3
            rounded-xl
            shadow-md
            transition
          "
        >
          Crear edificio
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {edificios.map((edificio) => (
          <EdificioCard
            key={edificio.id}
            edificio={edificio}
          />
        ))}

      </div>

      {/* MODAL */}
      <CrearEdificioModal
        mostrar={mostrarModal}
        cerrarModal={() => setMostrarModal(false)}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleCrearEdificio}
      />

    </div>
  );
}