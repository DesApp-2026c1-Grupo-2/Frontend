import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import CrearEdificioModal from "../components/edificios/CrearEdificioModal";
import { PageHeader } from "../components/SharedUi";

import {
  obtenerEdificios,
  crearEdificio,
  actualizarEdificio,
  eliminarEdificio,
} from "../services/edificioService";

import { obtenerEquipos } from "../services/equipoFijoService";
import api from "../api/axios";

import { FiEdit2, FiTrash2, FiHome, FiMapPin } from "react-icons/fi";

export default function Edificios() {

  const navigate = useNavigate();
  const location = useLocation();

  /*
    =========================
    STATES
    =========================
  */
  const [edificios, setEdificios] = useState([]);

  const [cantidadEquiposFijos, setCantidadEquiposFijos] =
  useState(0);

  const [cantidadPedidos, setCantidadPedidos] = useState(0);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [edificioEditando, setEdificioEditando] =
  useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
  });

  /*
    =========================
    OBTENER EDIFICIOS, equipos fijos y pedidos
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

  const cargarEquiposFijos = async () => {

    try {

      const equipos = await obtenerEquipos();

      const equiposFijos = equipos.filter(
        (eq) => eq.esFijo
      );

      setCantidadEquiposFijos(
        equiposFijos.length
      );

    } catch (error) {

      console.error(error);
    }
  };

  const cargarPedidos = async () => {
    try {
      const res = await api.get("/pedido");

      setCantidadPedidos(res.data.length);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarEdificios();
    cargarEquiposFijos();
    cargarPedidos();
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

      if (edificioEditando) {

        await actualizarEdificio(
          edificioEditando._id || edificioEditando.id,
          {
            nombre: formData.nombre,
            direccion: formData.direccion,
          }
        );

        setEdificioEditando(null);

      } else {

        await crearEdificio({
          nombre: formData.nombre,
          direccion: formData.direccion,
        });

      }

      await cargarEdificios();

      setFormData({
        nombre: "",
        direccion: "",
      });

      setEdificioEditando(null);
      setMostrarModal(false);

    } catch (error) {

      console.error(
        "ERROR BACK:",
        error.response?.data || error
      );
    }
  };

  /*
    ========================
    ACTUALIZAR EDIFICIO
    =========================
  */
    const handleEditar = (edificio) => {

    setEdificioEditando(edificio);

    setFormData({
      nombre: edificio.nombre,
      direccion: edificio.direccion,
    });

    setMostrarModal(true);
  };


  /*
    =========================
    ELIMINAR EDIFICIO
    =========================
  */
  const handleEliminar = async (id, nombre) => {

    const confirmar = window.confirm(
      `¿Eliminar el edificio "${nombre}"?`
    );

    if (!confirmar) return;

    try {

      await eliminarEdificio(id);

      await cargarEdificios();

    } catch (error) {

      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 px-6 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <PageHeader
          preTitle=""
          title="Edificios"
        />

        <button
          onClick={() => {

            setEdificioEditando(null);

            setFormData({
              nombre: "",
              direccion: "",
            });

            setMostrarModal(true);
          }}
          className="
            px-4 py-2 rounded-xl text-sm font-medium border
            border-emerald-200 text-emerald-700 bg-white
            hover:bg-emerald-50 transition shadow-sm
          "
        >
          + Nuevo edificio
        </button>

      </div>

      {/* CAMPUS */}
      <div className="relative w-full overflow-hidden">

      {/* METRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-emerald-700 font-medium">
            Edificios
          </p>

          <p className="text-2xl font-bold text-slate-800">
            {edificios.length}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-emerald-700 font-medium">
            Equipos fijos
          </p>

          <p className="text-2xl font-bold text-slate-800">
            {cantidadEquiposFijos}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-emerald-700 font-medium">
            Pedidos
          </p>

          <p className="text-2xl font-bold text-slate-800">
            {cantidadPedidos}
          </p>
        </div>

      </div>

        {/* EDIFICIOS */}
        <div
          className="
            relative z-10
            flex flex-wrap justify-center items-end
            gap-x-10 gap-y-10
            pb-16 pt-4 px-4
          "
        >

          {edificios.map((e) => {

            const eid = e._id || e.id;

            const cantidadLabs =
              e.cantidadLaboratorios ?? 0;

            const altura = 150;

            return (
              <div
                key={eid}
                className="
                  flex flex-col items-center
                  group w-[240px]
                "
              >

                {/* EDIFICIO */}
                <div
                  onClick={() =>
                    navigate(
                      `/edificios/${String(eid)}/laboratorios`
                    )
                  }
                  className="
                    relative cursor-pointer
                    transition-all duration-300
                    hover:-translate-y-2
                  "
                  style={{
                    height: `${altura}px`,
                    width: "130px",
                  }}
                >

                  {/* CUERPO */}
                  <div
                    className="
                      absolute bottom-0 w-full
                      rounded-t-md
                      bg-gradient-to-b
                      from-stone-300 via-stone-400 to-stone-400
                      shadow-xl
                      border border-stone-300
                      overflow-hidden
                    "
                    style={{
                      height: `${altura}px`,
                    }}
                  >

                    {/* VENTANAS */}
                    <div className="grid grid-cols-3 gap-2 p-3 pt-5">

                      {Array.from({
                        length: 12,
                      }).map((_, i) => (
                        <div
                          key={i}
                          className="
                            h-4 rounded-[2px]
                            bg-slate-200
                            border border-slate-400/40
                          "
                        />
                      ))}

                      <div
                        className="
                          absolute bottom-0 left-1/2
                          -translate-x-1/2
                          w-6 h-7
                          bg-stone-600
                          rounded-t-md
                        "
                      />

                    </div>
                  </div>

                  {/* TECHO */}
                  <div
                    className="
                      absolute -top-2 left-2 right-2 h-3
                      bg-stone-700 rounded-sm
                    "
                  />
                </div>

                {/* INFO */}
                <div
                  className="
                    -mt-2
                    bg-white
                    rounded-3xl
                    shadow-lg
                    border border-slate-100
                    px-5 py-6
                    w-full
                    text-center
                  "
                >
                  <div className="flex justify-end gap-2 mb-2">

                  <button
                    title="Editar edificio"
                    onClick={() => handleEditar(e)}
                    className="
                      p-1 rounded-lg
                      hover:bg-emerald-50
                      text-emerald-700
                      transition
                    "
                  >
                    <FiEdit2 size={16} />
                  </button>

                  <button
                    title="Eliminar edificio"
                    onClick={() => handleEliminar(e._id || e.id, e.nombre)}
                    className="
                      p-1 rounded-lg
                      hover:bg-red-50
                      text-red-600
                      transition
                    "
                  >
                    <FiTrash2 size={16} />
                  </button>

                </div>
                  <h2 className="font-bold text-slate-800 text-2xl">
                    {e.nombre}
                  </h2>

                  <div className="mt-2 flex items-center justify-center gap-1 text-sm text-emerald-700 font-medium">
                    <FiHome size={16} />
                    <span>{cantidadLabs} laboratorios</span>
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-400 max-w-[220px] mx-auto capitalize">
                    <FiMapPin size={14} className="shrink-0" />
                    <span>{e.direccion}</span>
                  </div>
                  
                  <div
                    className="
                      w-10 h-[2px]
                      bg-emerald-500
                      mx-auto my-3
                      rounded-full
                    "
                  />

                  <button
                    onClick={() =>
                      navigate(
                        `/edificios/${String(eid)}/laboratorios`
                      )
                    }
                    className="
                    px-4 py-2 rounded-xl text-sm font-medium border
                    border-emerald-200 text-emerald-700 bg-white
                    hover:bg-emerald-50 transition shadow-sm
                    "
                    >
                    Ver edificio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
