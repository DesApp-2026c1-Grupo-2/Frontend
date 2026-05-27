import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import EdificioCard from "../components/edificios/EdificioCard";
import CrearEdificioModal from "../components/edificios/CrearEdificioModal";
import { PageHeader } from "../components/SharedUi";

import {obtenerEdificios, crearEdificio } from "../services/edificioService";

export default function Edificios() {

  const location = useLocation();

  const [edificios, setEdificios] = useState([]);

  const [mostrarModal, setMostrarModal] = useState(false);

  const navigate= useNavigate();
  
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
  }, [location.pathname]);

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
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-6">

      {/* HEADER (igual estilo Pedidos) */}
      <div className="flex items-center justify-between mb-6">
        <PageHeader
            preTitle="Gestión"
            title="Edificios"
            description="Administración de edificios y sus laboratorios"
        />

        <button
          onClick={() => setMostrarModal(true)}
          className="
            px-4 py-2 rounded-xl text-sm font-medium border
            border-emerald-200 text-emerald-600 bg-white
            hover:bg-emerald-50 hover:text-emerald-700
            transition-colors shadow-sm
          "
        >
          + Crear edificio
        </button>
      </div>

      {/* TABLA (igual lógica visual que Pedidos) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-sm min-w-[700px]">

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                ID
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                NOMBRE
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                DIRECCIÓN
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                LABORATORIOS
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                ACCIONES
              </th>
            </tr>
          </thead>

          <tbody>
            {edificios.map((e) => {
              const eid = e._id || e.id;

              return (
                <tr
                  key={eid}
                  className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors last:border-none"
                >
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">
                    {eid != null ? String(eid).slice(-6) : ""}
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-800">
                    {e.nombre}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {e.direccion}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {e.cantidadLaboratorios}
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() =>
                        navigate(`/edificios/${String(eid)}/laboratorios`)
                      }
                      className="
                        px-3 py-1.5 rounded-lg text-xs border
                        border-slate-200 bg-white text-slate-600
                        hover:border-emerald-300 hover:text-emerald-700
                        transition
                      "
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
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