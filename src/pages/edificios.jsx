import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import CrearEdificioModal from "../components/edificios/CrearEdificioModal";
import { PageHeader } from "../components/SharedUi";

import {
  obtenerEdificios,
  crearEdificio,
} from "../services/edificioService";

export default function Edificios() {

  const navigate = useNavigate();
  const location = useLocation();

  /*
    =========================
    STATES
    =========================
  */
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
    const cargar = async () => {
      try {
        const data = await obtenerEdificios();
        setEdificios(data);
      } catch (error) {
        console.error(error);
      }
    };

    cargar();
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

      console.error(
        "ERROR BACK:",
        error.response?.data || error
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 px-6 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">

        <PageHeader
          preTitle="Gestión"
          title="Edificios"
          description="Visualización dinámica de edificios y laboratorios"
        />

        <button
          onClick={() => setMostrarModal(true)}
          className="
            px-4 py-2 rounded-xl text-sm font-medium border
            border-emerald-200 text-emerald-700 bg-white
            hover:bg-emerald-50 transition shadow-sm
          "
        >
          + Crear edificio
        </button>

      </div>

      {/* CAMPUS */}
      <div className="relative w-full overflow-hidden">

        {/* EDIFICIOS */}
        <div
          className="
            relative z-10
            flex flex-wrap justify-center items-end
            gap-x-10 gap-y-20
            pb-16 pt-4 px-4
          "
        >

          {edificios?.map((e) => {

            const eid = e._id || e.id;

            const cantidadLabs =
              e.cantidadLaboratorios ?? 0;

            const ventanasVisibles =
              Math.min(cantidadLabs, 12);

            const altura =
              cantidadLabs === 0
                ? 140
                : Math.min(
                    140 + cantidadLabs * 12,
                    260
                  );

            return (
              <div
                key={eid}
                className="
                  flex flex-col items-center
                  group w-[160px]
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
                    width: "120px",
                  }}
                >

                  {/* CUERPO */}
                  <div
                    className="
                      absolute bottom-0 w-full
                      rounded-t-md
                      bg-gradient-to-b
                      from-stone-300 to-stone-500
                      shadow-xl
                      border border-stone-600/20
                      overflow-hidden
                    "
                    style={{
                      height: `${altura}px`,
                    }}
                  >

                    {/* VENTANAS */}
                    <div className="grid grid-cols-3 gap-2 p-3 pt-5">

                      {Array.from({
                        length: ventanasVisibles,
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
                <div className="mt-5 text-center">

                  <h2 className="font-bold text-slate-800 text-lg">
                    {e.nombre}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {cantidadLabs} laboratorios
                  </p>

                  <p className="text-xs text-slate-400 mt-1 max-w-[140px]">
                    {e.direccion}
                  </p>

                  <button
                    onClick={() =>
                      navigate(
                        `/edificios/${String(eid)}/laboratorios`
                      )
                    }
                    className="
                      mt-3 px-3 py-1.5 rounded-lg text-xs
                      bg-white border border-slate-200
                      hover:border-emerald-300
                      hover:text-emerald-700
                      transition
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
