import { PageHeader } from "../components/SharedUi";
import CalendarioGrande from "../components/calendario/CalendarioGrande";
import { useState, useEffect } from "react";
import CalendarioMini from "../components/calendario/calendarioMini";
import { reservas } from "../components/calendario/reservas";
import { getReservasActivas } from "../services/reservas";

export default function Calendario() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [vistaActual, setVistaActual] = useState("timeGridWeek");
  const [reservas, setReservas] = useState([]);

  //integracion 
  useEffect(() => {
    getReservasActivas()
      .then((data) => {
        console.log(JSON.stringify(data, null, 2));
        const reservasAdaptadas = data.map((r) => {
          console.log("LABORATORIO:", r.laboratorioId);

          const inicioClase = new Date(r.fechaHora);

          const finClase = new Date(
            inicioClase.getTime() + r.duracionClase * 60000
          );

          const inicioPreparacion = new Date(
            inicioClase.getTime() - 60 * 60000
          );

          const finMantenimiento = new Date(
            finClase.getTime() + 30 * 60000
          );

          return {
            id: r._id,

            docenteId: r.docenteId._id,

            edificio: r.laboratorioId.edificioId,

            laboratorioId: r.laboratorioId._id || r.laboratorioId.id,

            laboratorio: r.laboratorioId.nombre,

            materia: r.pedidoId.materia,
            
            profesor: `${r.docenteId.nombre} ${r.docenteId.apellido}`,

            preparacionInicio: inicioPreparacion.toISOString(),
            reservaInicio: inicioClase.toISOString(),
            reservaFin: finClase.toISOString(),
            mantenimientoFin: finMantenimiento.toISOString(),

            estado: r.estado,
          };

        });

        console.log("RESPUESTA BACK:", data);
        console.log("RESERVAS ADAPTADAS:", reservasAdaptadas);

        setReservas(reservasAdaptadas);

      })
      .catch(console.error);

  }, []);

  const hoy = new Date().toISOString().split("T")[0];

  const reservasHoy = reservas.filter((r) =>
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

  const reservasSemana = reservas.filter((r) => {
    const fecha = new Date(r.reservaInicio);
    return fecha >= inicioSemana && fecha < finSemana;
  });


  return (
    <div className="min-h-screen w-full bg-slate-100 px-6 py-6">

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
            p-8
          "
        >

          {/* TECHO */}
          <div className="absolute -top-5 left-10 right-10 h-6 rounded-t-[2rem] bg-stone-700" />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

            {/* PANEL IZQUIERDO */}
            <div className="xl:col-span-3">

              <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-6">
                <CalendarioGrande 
                  fechaSeleccionada={fechaSeleccionada}
                  setFechaSeleccionada={setFechaSeleccionada}
                  vistaActual={vistaActual}
                  setVistaActual={setVistaActual}
                  reservas={reservas}
                />
              </div>

            </div>

            {/* PANEL DERECHO */}
            <div className="space-y-5">

              {/* MINI CALENDARIO */}

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                  <CalendarioMini
                      fechaSeleccionada={fechaSeleccionada}
                      setFechaSeleccionada={setFechaSeleccionada}
                      vistaActual={vistaActual}
                      setVistaActual={setVistaActual}
                      reservas={reservas}
                  />

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}