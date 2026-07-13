import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from "@fullcalendar/core/locales/es";
import { useRef, useState, useEffect } from "react";
import BarraFiltros from "./BarraFiltros";
import CalendarioDia from "./calendarioDia";
import CalendarioMini from "./calendarioMini";
import { obtenerEdificios } from "../../services/edificioService";
import { obtenerLaboratoriosPorEdificio } from "../../services/laboratorioService";
import { useAuth } from "../../context/AuthContext";

import {
  FiTool,
  FiClipboard,
  FiCalendar,
} from "react-icons/fi";

function agruparReservasPorHorario(reservas) {
  const grupos = {};

  reservas.forEach((reserva) => {
    const key = [
      reserva.preparacionInicio,
      reserva.reservaInicio,
      reserva.reservaFin,
      reserva.mantenimientoFin,
    ].join("|");

    if (!grupos[key]) {
      grupos[key] = {
        id: key,

        start: new Date(reserva.preparacionInicio),
        end: new Date(reserva.mantenimientoFin),

        preparacionInicio: reserva.preparacionInicio,
        reservaInicio: reserva.reservaInicio,
        reservaFin: reserva.reservaFin,
        mantenimientoFin: reserva.mantenimientoFin,

        reservas: [],
      };
    }

    grupos[key].reservas.push({
      ...reserva
    });
  });

  return Object.values(grupos).map((grupo) => ({
    id: grupo.id,
    title: `${grupo.reservas.length} reserva(s)`,

    start: grupo.start,
    end: grupo.end,

    extendedProps: grupo,
  }));
}

function obtenerEstiloEvento(tipo, estado) {

  const esFinalizada = estado === "Finalizada";

  if (esFinalizada) {
    return {
      preparacion: {
        fondo: "bg-slate-100",
        texto: "text-slate-500",
        borde: "border-slate-300",
      },
      clase: {
        fondo: "bg-slate-400",
        texto: "text-white",
        borde: "border-slate-300",
      },
      mantenimiento: {
        fondo: "bg-slate-100",
        texto: "text-slate-500",
        borde: "border-slate-300",
      },
    }[tipo];
  }

  return {
    preparacion: {
      fondo: "bg-slate-50",
      texto: "text-slate-700",
      borde: "border-slate-200",
    },
    clase: {
      fondo: "bg-emerald-500",
      texto: "text-white",
      borde: "border-emerald-200",
    },
    mantenimiento: {
      fondo: "bg-slate-50",
      texto: "text-slate-700",
      borde: "border-slate-200",
    },
  }[tipo];
}

export default function CalendarioGrande({
    fechaSeleccionada,
    setFechaSeleccionada,
    vistaActual,
    setVistaActual,
    reservas,
  }) {
  const { user } = useAuth();
  const calendarRef = useRef(null);
  
  const [tituloMes, setTituloMes] = useState("Junio 2026");

  const [edificio, setEdificio] = useState("");
  const [laboratorio, setLaboratorio] = useState("");
  
  const [edificios, setEdificios] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [todosLosLaboratorios, setTodosLosLaboratorios] = useState([]);
  console.log(laboratorios);

  useEffect(() => {
    const cargarEdificios = async () => {
      try {
        const data = await obtenerEdificios();

        setEdificios(data);

        if (data.length > 0) {
          setEdificio(data[0].id);
        }
      } catch (error) {
        console.error(error);
      }
    };

    cargarEdificios();
  }, []);

  useEffect(() => {
    if (!edificio) return;

    const cargarLaboratorios = async () => {
      try {
        const data = await obtenerLaboratoriosPorEdificio(edificio);

        setLaboratorios(data);

        // Guardamos todos los laboratorios que alguna vez fueron cargados
        setTodosLosLaboratorios((prev) => {
          const nuevos = [...prev];

          data.forEach((lab) => {
            const id = lab.id || lab._id;

            if (!nuevos.some((l) => (l.id || l._id) === id)) {
              nuevos.push(lab);
            }
          });

          return nuevos;
        });

        if (vistaActual === "dayGridMonth") {
          setLaboratorio("todos");
        } else {
          setLaboratorio(data[0]?._id || data[0]?.id || "");
        }

      } catch (error) {
        console.error(error);
      }
    };

    cargarLaboratorios();
  }, [edificio]);

  useEffect(() => {
    if (laboratorios.length === 0) return;

    if (vistaActual === "dayGridMonth") {
      setLaboratorio("todos");
    } else if (laboratorio === "todos") {
      setLaboratorio(laboratorios[0]._id || laboratorios[0].id);
    }
  }, [vistaActual, laboratorios]);

  const actualizarTitulo = (fecha) => {
    const f = new Date(fecha);

    const titulo = f.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    setTituloMes(
      titulo.charAt(0).toUpperCase() + titulo.slice(1)
    );
  };

  console.log("Reserva ejemplo:");
  console.log(reservas[0]);

  const esAdminOPersonal =
    user?.rol === "ADMIN" || user?.rol === "PERSONAL";

  const reservasVisibles = esAdminOPersonal
    ? reservas
    : reservas.filter((r) => r.docenteId === user._id);

  const edificiosDisponibles = esAdminOPersonal
    ? edificios
    : edificios.filter((ed) =>
        todosLosLaboratorios.some((lab) => {
          const laboratorioTieneReserva = reservasVisibles.some(
            (r) => r.laboratorioId === (lab.id || lab._id)
          );

          return (
            laboratorioTieneReserva &&
            lab.edificioId === (ed.id || ed._id)
          );
        })
      );

  const laboratoriosDisponibles = esAdminOPersonal
    ? laboratorios
    : laboratorios.filter((lab) =>
        reservasVisibles.some(
          (r) => r.laboratorioId === (lab.id || lab._id)
        )
      );

  const idsLaboratorios = laboratorios.map(
    (l) => l._id || l.id
  );

  const reservasFiltradas = reservasVisibles.filter((reserva) => {
    if (!laboratorio) return false;

    if (laboratorio === "todos") {
      return idsLaboratorios.includes(reserva.laboratorioId);
    }

    return reserva.laboratorioId === laboratorio;
  });
 
  useEffect(() => {
    if (vistaActual === "timeGridDay") return;

    const api = calendarRef.current?.getApi();

    if (!api) return;

    api.changeView(vistaActual);

    api.gotoDate(fechaSeleccionada);

  }, [fechaSeleccionada, vistaActual]);

  //para hacer funcionar el calendarioMini 
  useEffect(() => {
    if (vistaActual !== "timeGridDay") return;

    actualizarTitulo(fechaSeleccionada);

  }, [vistaActual, fechaSeleccionada]);

  console.table(
    reservasFiltradas.map((r) => ({
      materia: r.materia,
      estado: r.estado,
      laboratorio: r.laboratorio,
    }))
  );

  const eventosSemana = reservasFiltradas.flatMap((reserva) => [
    {
      id: `${reserva.id}-prep`,
      title: "Preparación",
      start: reserva.preparacionInicio,
      end: reserva.reservaInicio,

      extendedProps: {
        tipo: "preparacion",
        reserva,
      },
    },

    {
      id: `${reserva.id}-clase`,
      title: reserva.materia,
      start: reserva.reservaInicio,
      end: reserva.reservaFin,

      extendedProps: {
        tipo: "clase",
        reserva,
      },
    },

    {
      id: `${reserva.id}-mant`,
      title: "Mantenimiento",
      start: reserva.reservaFin,
      end: reserva.mantenimientoFin,

      extendedProps: {
        tipo: "mantenimiento",
        reserva,
      },
    },
  ]);


  console.log("==========");
  console.log("Vista:", vistaActual);
  console.log("Fecha seleccionada:", fechaSeleccionada);

  const reservasDelDia = reservasFiltradas.filter((reserva) => {
    const fechaReserva = reserva.reservaInicio.split("T")[0];
    const fechaActual = fechaSeleccionada.toISOString().split("T")[0];

    return fechaReserva === fechaActual;
  });

  console.log("Reservas encontradas:", reservasDelDia.length);

  const bloquesDia = agruparReservasPorHorario(reservasDelDia);

  const reservasPorDia = reservasFiltradas.reduce((acc, reserva) => {
    const fecha = reserva.reservaInicio.split("T")[0];

    if (!acc[fecha]) {
      acc[fecha] = {
        total: 0,
        laboratorios: {},
        tieneFinalizadas: false,
      };
    }

    acc[fecha].total++;

    acc[fecha].laboratorios[reserva.laboratorio] =
      (acc[fecha].laboratorios[reserva.laboratorio] || 0) + 1;

    if (reserva.estado === "Finalizada") {
      acc[fecha].tieneFinalizadas = true;
    }

    return acc;
  }, {});

  const eventosMes = Object.entries(reservasPorDia).map(([fecha, datos]) => ({
    id: fecha,
    title: `${datos.total} ${datos.total === 1 ? "reserva" : "reservas"}`,
    start: fecha,
    allDay: true,
    className: datos.tieneFinalizadas
      ? "evento-finalizado"
      : "evento-activo",
    extendedProps: {
      laboratorios: datos.laboratorios,
    },
  }));

  console.log("Reservas:", reservas);
  console.log("Reservas filtradas:", reservasFiltradas);
  
  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mb-6">

      <div>

        <h2 className="text-2xl font-bold text-slate-800">
          {tituloMes}
        </h2>

        <div className="mt-4">
          <BarraFiltros
            edificio={edificio}
            setEdificio={setEdificio}
            laboratorio={laboratorio}
            setLaboratorio={setLaboratorio}
            edificios={edificiosDisponibles}
            laboratorios={laboratoriosDisponibles}
            vistaActual={vistaActual}
          />
        </div>

      </div>

      <div className="flex gap-2">

        <button
          onClick={() => setVistaActual("dayGridMonth")}
          className={`px-3 py-2 rounded-xl transition
            ${
              vistaActual === "dayGridMonth"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
            }
          `}
        >
          Mes
        </button>

        <button
          onClick={() => setVistaActual("timeGridWeek")}
          className={`px-3 py-2 rounded-xl transition
            ${
              vistaActual === "timeGridWeek"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
            }
          `}
        >
          Semana
        </button>

        <button
          onClick={() => {
              actualizarTitulo(fechaSeleccionada);
              setVistaActual("timeGridDay");
            }}
          className={`px-3 py-2 rounded-xl transition
            ${
              vistaActual === "timeGridDay"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
            }
          `}
        >
          Día
        </button>

      </div>

    </div>
    
    <>
     {vistaActual === "timeGridDay" ? (

        <CalendarioDia
            bloques={bloquesDia}
        />

      ) : (
        <FullCalendar
          key={`${vistaActual}-${fechaSeleccionada.toISOString()}`}
          datesSet={(info) => {
            const fecha = info.view.currentStart;

            const mes = fecha.toLocaleDateString("es-AR", {
              month: "long",
            });

            const anio = fecha.getFullYear();

            const titulo =
              mes.charAt(0).toUpperCase() +
              mes.slice(1) +
              " de " +
              anio;

            setTituloMes(titulo);
          }}
          
          plugins={[
            timeGridPlugin,
            dayGridPlugin,
            interactionPlugin,
          ]}
          locale={esLocale}
          firstDay={1}
          slotEventOverlap={true}
          eventMaxStack={3}
          eventMinWidth={220}
          initialDate={fechaSeleccionada}
          weekNumberCalculation="ISO"
          initialView={vistaActual}
          headerToolbar={false}
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          expandRows={true}
          stickyHeaderDates={true}
          height="auto"
          events={
            vistaActual === "dayGridMonth"
              ? eventosMes
              : eventosSemana
          }
          eventDisplay="block"
          eventOrder="start"
          ref={calendarRef}

          eventContent={(info) => {
            const esVistaMes = info.view.type === "dayGridMonth";

            if (esVistaMes) {
              const laboratorios = Object.entries(
                info.event.extendedProps.laboratorios || {}
              );

              return (
                <div
                  className="evento-resumen-mes"
                >
                  <div className="font-semibold">
                    {info.event.title}
                  </div>

                  {laboratorio === "todos" && laboratorios.length > 0 && (
                    <div className="labs-resumen mt-1 text-[11px] leading-4">
                      {laboratorios.slice(0, 3).map(([lab, cantidad]) => (
                        <div key={lab}>
                          • {lab}
                          {cantidad > 1 && ` ×${cantidad}`}
                        </div>
                      ))}

                      {laboratorios.length > 3 && (
                        <div className="font-medium">
                          +{laboratorios.length - 3} laboratorios
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            
            
            //Vista semana
            const tipo = info.event.extendedProps.tipo;

            if (!tipo) {
              return null;
            }

            const duracion =
              (info.event.end - info.event.start) / 60000;

            const esEventoCorto = duracion <= 30;

            const estado = info.event.extendedProps.reserva?.estado;
            console.log({
              titulo: info.event.title,
              tipo,
              estado,
              reserva: info.event.extendedProps.reserva,
            })
            const estilo = obtenerEstiloEvento(tipo, estado);

            return (
              <div
                className={`h-full rounded 2x1 border shadow-sm
                ${estilo.borde}
                ${estilo.fondo}
                px-2
                flex
                flex-col
                justify-center
                overflow-hidden`}
              >
                <div className={`flex items-center gap-1 font-semibold text-xs ${estilo.texto}`}>
                  {tipo === "preparacion" && <FiClipboard size={12} />}

                  {tipo === "mantenimiento" && <FiTool size={12} />}

                  <span>{info.event.title}</span>
                </div>

                {tipo === "clase" &&
                  info.event.extendedProps.reserva && (
                    <div className="text-[11px] text-white/90">
                      {info.event.extendedProps.reserva.laboratorio}
                    </div>
                )}

                {!esEventoCorto && (
                  <div
                    className={`text-[10px] ${
                      tipo === "clase"
                        ? "text-white/80"
                        : "text-slate-500"
                    }`}
                  >
                    {info.event.start?.toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                    {" - "}
                    {info.event.end?.toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                </div>
                )}
              </div>
            );
          }}

          eventClick={(info) => {

            if (info.view.type !== "dayGridMonth") return;

            setFechaSeleccionada(info.event.start);

            actualizarTitulo(info.event.start);

            setVistaActual("timeGridDay");

          }}

          dateClick={(info) => {
            if (info.view.type !== "dayGridMonth") return;

            setFechaSeleccionada(info.date);

            actualizarTitulo(info.date);

            setVistaActual("timeGridDay");
          }}

          dayHeaderContent={(arg) => {
            if (arg.view.type === "dayGridMonth") {
              return (
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {arg.text}
                </span>
              );
            }

            const dia = arg.date.toLocaleDateString("es-AR", {
              weekday: "long",
            });

            const numero = arg.date.getDate();

            const hoy = new Date();

            const esHoy =
              hoy.getDate() === arg.date.getDate() &&
              hoy.getMonth() === arg.date.getMonth() &&
              hoy.getFullYear() === arg.date.getFullYear();

            return (
              <div className="flex flex-col items-center py-2">
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  {dia}
                </span>

                <span
                  className={`mt-2 w-9 h-9 rounded-full flex items-center justify-center font-semibold ${
                    esHoy
                      ? "bg-emerald-600 text-white"
                      : "text-slate-800"
                  }`}
                >
                  {numero}
                </span>
              </div>
            );
          }}
        />
      )}
    </>
    </div>
  );
}