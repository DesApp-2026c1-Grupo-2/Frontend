import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  obtenerLaboratoriosPorEdificio,
  crearLaboratorio,
  actualizarEstadoLaboratorio,
} from "../services/laboratorioService";

import { obtenerEquipos } from "../services/equipoFijoService";

import {
  obtenerEdificios,
} from "../services/edificioService";

import LaboratorioModal from "../components/laboratorios/LaboratorioModal";
import { PageHeader } from "../components/SharedUi";

export default function Laboratorios() {

  const { id } = useParams();

  /*
    =========================
    ESTADOS
    =========================
  */
  const [laboratorios, setLaboratorios] = useState([]);

  const [equipos, setEquipos] = useState([]);

  const [edificioActual, setEdificioActual] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [laboratorioEditando, setLaboratorioEditando] =
    useState(null);

  /*
    =========================
    FORM
    =========================
  */
  const [formData, setFormData] = useState({
    nombre: "",
    capacidad: "",
    tipo: "",
    estado: "disponible",
  });

  /*
    =========================
    CARGAR EDIFICIO
    =========================
  */
  const cargarEdificio = async () => {

    try {

      const edificios =
        await obtenerEdificios();

      const edificio = edificios.find(
        (e) =>
          String(e._id || e.id) === String(id)
      );

      setEdificioActual(edificio);

    } catch (error) {
      console.error(error);
    }
  };

  /*
    =========================
    CARGAR LABORATORIOS
    =========================
  */
  const cargarLaboratorios = async () => {

    try {

      const data =
        await obtenerLaboratoriosPorEdificio(id);
      setLaboratorios(data);
      
    } catch (error) {
      console.error(error);
    }
  };

  /*
    =========================
    CARGAR EQUIPOS
    =========================
  */
  const cargarEquipos = async () => {

    try {

      const data = await obtenerEquipos();

      const equiposFijos = data.filter(
        (eq) => eq.esFijo && eq.laboratorioId
      );

      setEquipos(equiposFijos);

    } catch (error) {
      console.error(error);
    }
  };

  /*
    =========================
    USE EFFECT
    =========================
  */
  useEffect(() => {

    cargarEdificio();
    cargarLaboratorios();
    cargarEquipos();

  }, [id]);

  /*
    =========================
    INPUTS
    =========================
  */
  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  /*
    =========================
    CREAR / EDITAR
    =========================
  */
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      // EDITAR
      if (laboratorioEditando) {

        await actualizarEstadoLaboratorio(
          laboratorioEditando._id ||
            laboratorioEditando.id,
          formData.estado
        );

        setLaboratorios((prev) =>
          prev.map((lab) => {

            const lid =
              lab._id || lab.id;

            const editId =
              laboratorioEditando._id ||
              laboratorioEditando.id;

            return lid === editId
              ? {
                  ...lab,
                  estado: formData.estado,
                }
              : lab;
          })
        );

        setLaboratorioEditando(null);
      }

      // CREAR
      else {

        const nuevoLab =
          await crearLaboratorio({
            ...formData,
            capacidad: Number(
              formData.capacidad
            ),
            edificioId: id,
          });

        setLaboratorios((prev) => [
          ...prev,
          nuevoLab,
        ]);
      }

      setFormData({
        nombre: "",
        capacidad: "",
        tipo: "",
        estado: "disponible",
      });

      setMostrarModal(false);

    } catch (error) {

      console.error(
        "ERROR BACK:",
        error.response?.data || error
      );
    }
  };

  /*
    =========================
    EDITAR
    =========================
  */
  const handleEditar = (lab) => {

    setLaboratorioEditando(lab);

    setFormData({
      nombre: lab.nombre,
      capacidad: lab.capacidad,
      tipo: lab.tipo,
      estado: lab.estado,
    });

    setMostrarModal(true);
  };

  /*
    =========================
    LOADING
    =========================
  */
  if (!edificioActual) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">
          Cargando edificio...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">

        <PageHeader
          preTitle="Edificio"
          title={edificioActual.nombre}
          description={`Cantidad de laboratorios: ${laboratorios.length}`}
        />

        {/* BOTON */}
        <button
          onClick={() => {

            setLaboratorioEditando(null);

            setFormData({
              nombre: "",
              capacidad: "",
              tipo: "",
              estado: "disponible",
            });

            setMostrarModal(true);
          }}
          className="
            px-4 py-2 rounded-xl text-sm font-medium border
            border-emerald-200 text-emerald-700 bg-white
            hover:bg-emerald-50 transition shadow-sm
          "
        >
          + Nuevo laboratorio
        </button>
      </div>

      {/* CONTENEDOR */}
      <div className="relative">

        {/* BASE */}
        <div
          className="
            absolute bottom-0 left-0 w-full
            h-40 bg-emerald-100 rounded-[2rem]
            opacity-40
          "
        />

        {/* ESTRUCTURA */}
        <div
          className="
            relative z-10
            bg-white/80 backdrop-blur-sm
            border border-emerald-100
            rounded-[2.5rem]
            shadow-xl
            p-8 md:p-10
          "
        >

          {/* TECHO */}
          <div
            className="
              absolute -top-5 left-10 right-10
              h-6 rounded-t-[2rem]
              bg-stone-700 rounded-sm
            "
          />

          {/* GRID */}
          <div
            className="
              grid grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-6
            "
          >

            {laboratorios.map((lab) => {

              const lid =
                lab._id || lab.id;

              const tieneEquipos =
                equipos.some(
                  (eq) =>
                    String(eq.laboratorioId) ===
                    String(lid)
                );

              return (
                <div
                  key={lid}
                  className="
                    relative overflow-hidden
                    bg-gradient-to-br
                    from-white to-emerald-50
                    border border-emerald-100
                    rounded-3xl
                    p-6
                    shadow-sm
                    hover:shadow-xl
                    hover:-translate-y-1
                    transition-all duration-300
                  "
                >

                  {/* TOP */}
                  <div className="relative z-10">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <h2
                          className="
                            text-xl font-bold
                            text-slate-800
                          "
                        >
                          {lab.nombre}
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                          {tieneEquipos
                            ? "Laboratorio con equipos fijos"
                            : "Laboratorio sin equipos fijos"}
                        </p>
                      </div>

                      <div
                        className={`
                          px-3 py-1 rounded-full
                          text-xs font-medium
                          whitespace-nowrap
                          ${
                            lab.estado === "disponible"
                              ? "bg-emerald-100 text-emerald-700"
                              : lab.estado === "ocupado"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        `}
                      >
                        {lab.estado}
                      </div>
                    </div>

                    {/* VISUAL */}
                    <div className="mt-8">

                      <div className="flex flex-wrap gap-3">

                        {Array.from({
                          length: Math.min(
                            Number(
                              lab.capacidad || 0
                            ),
                            24
                          ),
                        }).map((_, i) => (

                          <div
                            key={i}
                            className="
                              relative
                              w-5 h-7
                              flex items-end justify-center
                            "
                          >

                            {/* CABEZA */}
                            <div
                              className="
                                absolute top-0
                                w-3 h-3 rounded-full
                                bg-amber-600
                              "
                            />

                            {/* CUERPO */}
                            <div
                              className="
                                w-4 h-4 rounded-md
                                bg-stone-700
                              "
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div
                      className="
                        mt-6 pt-4
                        border-t border-slate-100
                        flex items-center
                        justify-between
                      "
                    >

                      <div>

                        <p className="text-xs text-slate-400">
                          Capacidad
                        </p>

                        <p
                          className="
                            text-lg font-bold
                            text-slate-700
                          "
                        >
                          {lab.capacidad}
                        </p>
                      </div>

                      <div
                        className="
                          px-3 py-2 rounded-2xl
                          bg-emerald-100
                          text-emerald-700
                          text-xs font-semibold
                          capitalize
                          text-center
                          min-w-[70px]
                        "
                      >
                        {lab.tipo}
                      </div>
                    </div>

                    {/* BOTON EDITAR */}
                    <button
                      onClick={() =>
                        handleEditar(lab)
                      }
                      className="
                        mt-5 w-full
                        px-4 py-2 rounded-xl
                        border border-slate-200
                        bg-white text-slate-600
                        hover:border-emerald-300
                        hover:text-emerald-700
                        transition
                        text-sm font-medium
                      "
                    >
                      Editar estado
                    </button>

                  </div>
                </div>
              );
            })}
          </div>

          {/* EMPTY */}
          {laboratorios.length === 0 && (

            <div className="py-20 text-center">

              <p className="text-slate-400 text-lg">
                Este edificio todavía no tiene laboratorios.
              </p>

              <p className="text-slate-400 text-sm mt-2">
                Creá el primero para comenzar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <LaboratorioModal
        mostrar={mostrarModal}
        cerrarModal={() =>
          setMostrarModal(false)
        }
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        esEdicion={!!laboratorioEditando}
      />
    </div>
  );
}

