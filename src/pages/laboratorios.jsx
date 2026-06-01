import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  obtenerLaboratoriosPorEdificio,
  crearLaboratorio,
  actualizarEstadoLaboratorio,
  eliminarLaboratorio,
} from "../services/laboratorioService";

import { obtenerEquipos } from "../services/equipoFijoService";

import {
  obtenerEdificios,
} from "../services/edificioService";

import LaboratorioModal from "../components/laboratorios/LaboratorioModal";
import { PageHeader } from "../components/SharedUi";

import {
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

import { FiMonitor } from "react-icons/fi";

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
 
        console.log("LABORATORIOS:", data);

        console.log("PRIMER LAB EQUIPOS:", data[0].equiposFijos);
      
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

      console.log("EQUIPOS RAW:", data);

      const equiposFijos = data.filter(
        (eq) => eq.esFijo && eq.laboratorioId
      );

      console.log("EQUIPOS FILTRADOS:", equiposFijos);

      equiposFijos.forEach((eq) => {
        console.log(
          "Equipo:",
          eq.nombre,
          "-> Laboratorio:",
          eq.laboratorioId?.nombre
        );
      });

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

  /*
    =========================
    ELIMINAR
    =========================
  */
  const handleEliminar = async (id) => {
    try {
      await eliminarLaboratorio(id);

      // opcional: refrescar lista
      setLaboratorios((prev) =>
        prev.filter(
          (lab) => (lab._id || lab.id) !== id
        )
      );

    } catch (error) {
      console.error("Error eliminando laboratorio:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <PageHeader
          preTitle="Edificio"
          title={edificioActual.nombre}
          description=""
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

      {/* METRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-14">

        <div
          className="
            bg-white rounded-2xl
            border border-emerald-200
            shadow-sm p-5
          "
        >
          <p className="text-sm text-emerald-700 font-medium">
            Laboratorios
          </p>

          <p className="text-3xl font-bold text-slate-800 mt-2">
            {laboratorios.length}
          </p>
        </div>

        <div
          className="
            bg-white rounded-2xl
            border border-emerald-200
            shadow-sm p-5
          "
        >
          <p className="text-sm text-emerald-700 font-medium">
            Equipos fijos
          </p>

          <p className="text-3xl font-bold text-slate-800 mt-2">
            {equipos.length}
          </p>
        </div>

        <div
          className="
            bg-white rounded-2xl
            border border-emerald-200
            shadow-sm p-5
          "
        >
          <p className="text-sm text-emerald-700 font-medium">
            Disponibles
          </p>

          <p className="text-3xl font-bold text-slate-800 mt-2">
            {
              laboratorios.filter(
                (lab) => lab.estado === "disponible"
              ).length
            }
          </p>
        </div>

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
            border border-slate-100
            rounded-[2.5rem]
            shadow-lg
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

              const equiposDelLab = equipos.filter(
                (eq) =>
                  String(eq.laboratorioId?.id) ===
                  String(lid)
              );

              const equiposVisibles = equiposDelLab.slice(0, 3);

              const equiposRestantes =
                equiposDelLab.length - equiposVisibles.length;


              const tieneEquipos =
                equipos.some(
                  (eq) =>
                    String(eq.laboratorioId?.id) ===
                    String(lid)
                );

              return (
                <div
                  key={lid}
                  className="
                    relative overflow-hidden
                    bg-gradient-to-br
                    border border-slate-300
                    rounded-3xl
                    p-6
                    shadow-lg
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
                          {equiposDelLab.length > 0
                            ? `Laboratorio con ${equiposDelLab.length} equipos fijos`
                            : "Laboratorio sin equipos fijos"
                          }
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditar(lab)}
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
                          onClick={() => {
                            if (!confirm("¿Seguro que querés eliminar este laboratorio?")) return;
                            handleEliminar(lab._id || lab.id);
                          }}
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
                    </div>

                    <div
                      className="
                        w-12 h-[2px]
                        bg-emerald-500
                        rounded-full
                        my-4
                      "
                    />

                    {/* EQUIPOS */}
                    <div className="mb-5">

                      {equiposDelLab.length === 0 ? (
                        <span className="text-xs text-slate-400">
                          Sin equipos registrados
                        </span>
                      ) : (
                        <div className="flex-wrap">
                          <p className="text-xs font-semibold text-slate-500 mb-2">
                            Equipo fijo instalado: 
                          </p>
                          {equiposVisibles.map((eq) => (
                            <span
                              key={eq.id}
                              className="
                                px-2 py-1
                                rounded-lg
                                bg-emerald-100
                                text-emerald-700
                                text-xs
                              "
                            >
                              {eq.nombre}
                            </span>
                          ))}

                          {equiposRestantes > 0 && (
                            <span
                              className="
                                px-2 py-1
                                rounded-lg
                                bg-emerald-100
                                text-emerald-700
                                text-xs
                                font-medium
                              "
                            >
                              +{equiposRestantes} más...
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* FOOTER */}
                    <div className="mt-4 flex justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-500">Capacidad:</p>
                          <p className="text-lg font-semibold text-slate-700">{lab.capacidad}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-500">Tipo:</p>
                          <p className="font-semibold text-slate-700 capitalize">{lab.tipo}</p>
                        </div>
                      </div>

                      <div className="flex items-end">
                        <span
                          className={`
                            px-3 py-1 rounded-full
                            text-xs font-medium capitalize
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
                        </span>
                      </div>
                    </div>
                        
                    
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

