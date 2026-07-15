import { PageHeader } from "../components/SharedUi";
import CalendarioGrande from "../components/calendario/calendarioGrande";
import { useState, useEffect } from "react";
import CalendarioMini from "../components/calendario/calendarioMini";
import { getReservasActivas, getReservasFinalizadas } from "../services/reservas";
import { useAuth } from "../context/AuthContext";

export default function Calendario() {
  const { user } = useAuth();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [vistaActual, setVistaActual] = useState("timeGridWeek");
  const [reservas, setReservas] = useState([]);

  //integracion 
  useEffect(() => {
    const cargarReservas = async () => {
      try {
        // Después esto va a salir del calendario.
        // Por ahora traemos todo 2026.
        const startDate = "2026-01-01";
        const endDate = "2026-12-31";

        const [activas, finalizadas] = await Promise.all([
          getReservasActivas(startDate, endDate),
          getReservasFinalizadas(startDate, endDate),
        ]);

        const todasLasReservas = [...activas, ...finalizadas];

        console.log("ACTIVAS:", activas);
        console.log("FINALIZADAS:", finalizadas);

        const reservasAdaptadas = todasLasReservas
          // Una reserva sin laboratorio o sin fecha no se puede ubicar en el
          // calendario. La descartamos en vez de romper todo el .map (que
          // dejaría el calendario vacío ante un solo registro incompleto).
          .filter((r) => r?.laboratorioId && r?.fechaHora)
          .map((r) => {
            const inicioClase = new Date(r.fechaHora);

            const finClase = new Date(
              inicioClase.getTime() + r.duracionClase * 60000
            );

            const inicioPreparacion = r.fechaInicioReal
              ? new Date(r.fechaInicioReal)
              : new Date(inicioClase.getTime() - 60 * 60000);

            const finMantenimiento = r.fechaFinReal
              ? new Date(r.fechaFinReal)
              : new Date(finClase.getTime() + 30 * 60000);

            return {
              id: r._id || r.id,

              edificio: r.laboratorioId.edificioId,

              laboratorioId: r.laboratorioId._id || r.laboratorioId.id,

              laboratorio: r.laboratorioId.nombre,

              materia: r.pedidoId?.materia ?? "Sin materia",

              profesor: r.docenteId
                ? `${r.docenteId.nombre} ${r.docenteId.apellido}`
                : "Sin docente",

              // Id del docente para filtrar las reservas por usuario: la vista
              // del docente muestra solo sus propias reservas. El backend lo
              // puebla como objeto { _id, nombre, apellido, email }.
              docenteId: r.docenteId?._id ?? r.docenteId?.id ?? null,

              preparacionInicio: inicioPreparacion.toISOString(),
              reservaInicio: inicioClase.toISOString(),
              reservaFin: finClase.toISOString(),
              mantenimientoFin: finMantenimiento.toISOString(),

              estado: r.estado,
            };
          });

        console.log("RESERVAS ADAPTADAS:", reservasAdaptadas);
        console.table(
          reservasAdaptadas.map((r) => ({
            materia: r.materia,
            estado: r.estado,
            inicio: r.reservaInicio,
          }))
        );

        setReservas(reservasAdaptadas);
      } catch (error) {
        console.error(error);
      }
    };

    cargarReservas();
  }, []);

  // Filtro por rol centralizado: ADMIN/PERSONAL ven todas las reservas, el
  // DOCENTE solo las suyas. Se computa una única vez acá y se pasa tanto al
  // calendario grande como al mini para que siempre estén en sync (antes el
  // mini recibía todas las reservas y pintaba días de otros docentes).
  const esAdminOPersonal =
    user?.rol === "ADMIN" || user?.rol === "PERSONAL";

  const reservasVisibles = esAdminOPersonal
    ? reservas
    : reservas.filter((r) => r.docenteId === (user?.id || user?._id));

  const hoy = new Date().toISOString().split("T")[0];

  const reservasHoy = reservasVisibles.filter((r) =>
    r.reservaInicio.startsWith(hoy)
  );

  const laboratoriosOcupados = new Set(
    reservasHoy.map((r) => r.laboratorio)
  ).size;

  const inicioSemana = new Date();
  inicioSemana.setHours(0, 0, 0, 0);
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());

  const finSemana = new Date(inicioSemana);
  finSemana.setDate(finSemana.getDate() + 7);

  const reservasSemana = reservasVisibles.filter((r) => {
    const fecha = new Date(r.reservaInicio);
    return fecha >= inicioSemana && fecha < finSemana;
  });


  return (
    <div className="min-h-screen w-full bg-slate-100 px-2 md:px-6 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Calendario"
          preTitle=""
        />
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">

        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">
            Reservas hoy
          </p>

          <p className="text-3xl font-bold text-slate-800">
            {reservasHoy.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">
            Laboratorios ocupados
          </p>

          <p className="text-3xl font-bold text-slate-800">
            {laboratoriosOcupados}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">
            Reservas esta semana
          </p>

          <p className="text-3xl font-bold text-slate-800">
            {reservasSemana.length}
          </p>
        </div>

      </div>

      {/* CONTENEDOR */}
      <div className="relative">

        {/* SOMBRA VERDE */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-emerald-100 opacity-30 rounded-[2rem]" />

        {/* CARD */}
        <div
          className="
            relative z-10
            bg-white/80
            backdrop-blur-sm
            border border-slate-100
            rounded-[2.5rem]
            shadow-lg
            p-2 md:p-6 xl:p-8
          "
        >

          {/* TECHO */}
          <div className="absolute -top-5 left-10 right-10 h-6 rounded-t-[2rem] bg-stone-700" />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 xl:gap-8">

            {/* PANEL IZQUIERDO */}
            <div className="xl:col-span-3">

             <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-4 md:p-8">
                <CalendarioGrande
                  fechaSeleccionada={fechaSeleccionada}
                  setFechaSeleccionada={setFechaSeleccionada}
                  vistaActual={vistaActual}
                  setVistaActual={setVistaActual}
                  reservas={reservasVisibles}
                />
              </div>

            </div>

            {/* PANEL DERECHO */}
            <div className="hidden xl:block space-y-5">

              {/* MINI CALENDARIO */}

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                  <CalendarioMini
                      fechaSeleccionada={fechaSeleccionada}
                      setFechaSeleccionada={setFechaSeleccionada}
                      vistaActual={vistaActual}
                      setVistaActual={setVistaActual}
                      reservas={reservasVisibles}
                  />

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}