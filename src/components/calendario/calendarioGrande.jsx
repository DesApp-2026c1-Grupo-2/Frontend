import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from "@fullcalendar/core/locales/es";
import { useRef, useState } from "react";
import BarraFiltros from "./BarraFiltros";
import { reservas } from "./reservas";

import {
  FiTool,
  FiClipboard,
} from "react-icons/fi";


export default function CalendarioGrande() {
  const calendarRef = useRef(null);
  const [tituloMes, setTituloMes] = useState("Junio 2026");
  const [vistaActual, setVistaActual] = useState("timeGridWeek");
  const [edificio, setEdificio] = useState("HC");
  const [laboratorio, setLaboratorio] = useState("Todos");
  const eventosFiltrados = reservas
    .filter((reserva) => {
      const coincideEdificio = reserva.edificio === edificio;

      const coincideLaboratorio =
        laboratorio === "Todos" ||
        reserva.laboratorio === laboratorio;

      return coincideEdificio && coincideLaboratorio;
    })
    .flatMap((reserva) => [
      // Preparación
      {
        id: `${reserva.id}-prep`,
        tipo: "preparacion",
        title: "Preparación",
        start: reserva.preparacionInicio,
        end: reserva.reservaInicio,
        reserva,
      },

      // Clase
      {
        id: `${reserva.id}-clase`,
        tipo: "clase",
        title: reserva.materia,
        start: reserva.reservaInicio,
        end: reserva.reservaFin,
        reserva,
      },

      // Mantenimiento
      {
        id: `${reserva.id}-mant`,
        tipo: "mantenimiento",
        title: "Mantenimiento",
        start: reserva.reservaFin,
        end: reserva.mantenimientoFin,
        reserva,
      },
    ]);

  const reservasPorDia = reservas
    .filter((reserva) => {
      const coincideEdificio = reserva.edificio === edificio;

      const coincideLaboratorio =
        laboratorio === "Todos" ||
        reserva.laboratorio === laboratorio;

      return coincideEdificio && coincideLaboratorio;
    })
    .reduce((acc, reserva) => {
      const fecha = reserva.reservaInicio.split("T")[0];

      acc[fecha] = (acc[fecha] || 0) + 1;

      return acc;
    }, {});
    
  const cambiarVista = (vista) => {
    const calendarApi = calendarRef.current?.getApi();

    if (!calendarApi) return;

    if (vista === "timeGridDay") {
      calendarApi.changeView(vista, new Date());
    } else {
      calendarApi.changeView(vista);
    }
  };

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
          />
        </div>

      </div>

      <div className="flex gap-2">

        <button
          onClick={() => cambiarVista("dayGridMonth")}
          className={`px-3 py-2 rounded-xl transition
            ${
              vistaActual === "dayGridMonth"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-50"
            }
          `}
        >
          Mes
        </button>

        <button
          onClick={() => cambiarVista("timeGridWeek")}
          className={`px-3 py-2 rounded-xl transition
            ${
              vistaActual === "timeGridWeek"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-50"
            }
          `}
        >
          Semana
        </button>

        <button
          onClick={() => cambiarVista("timeGridDay")}
          className={`px-3 py-2 rounded-xl transition
            ${
              vistaActual === "timeGridDay"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-50"
            }
          `}
        >
          Día
        </button>

      </div>

    </div>

      <FullCalendar
        datesSet={(info) => {
          console.log(info.view);
          const fecha = info.view.currentStart;

          const mes = fecha.toLocaleDateString("es-AR", {
            month: "long",
          });

          const anio = fecha.getFullYear();

          const titulo =
            mes[0].toUpperCase() + mes.slice(1) + " de " + anio;

          setTituloMes(titulo);
          setVistaActual(info.view.type);
        }}
        
        plugins={[
          timeGridPlugin,
          dayGridPlugin,
          interactionPlugin,
        ]}
        locale={esLocale}
        firstDay={1}
        initialDate="2026-07-01"
        weekNumberCalculation="ISO"
        initialView="timeGridWeek"
        headerToolbar={false}
        allDaySlot={false}
        slotMinTime="07:00:00"
        slotMaxTime="23:00:00"
        expandRows={true}
        stickyHeaderDates={true}
        height="auto"
        events={eventosFiltrados}
        eventDisplay="block"
        ref={calendarRef}

        eventContent={(info) => {
          const esVistaMes = info.view.type === "dayGridMonth";
          const tipo = info.event.extendedProps.tipo;

          const colores = {
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
          };

          const duracion =
            (info.event.end - info.event.start) / 60000;

          const esEventoCorto = duracion <= 30;

          const estilo = colores[tipo];

          if (esVistaMes) {
            return null;
          }

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

              {tipo === "clase" && (
                <>
                  <div className="text-[11px] text-white/90">
                    {info.event.extendedProps.reserva.laboratorio}
                  </div>
                </>
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

        dateClick={(info) => {
          if (info.view.type !== "dayGridMonth") return;

          const api = calendarRef.current?.getApi();

          if (!api) return;

          api.changeView("timeGridDay", info.date);
        }}

        dayCellDidMount={(info) => {
          if (info.view.type !== "dayGridMonth") return;

          const fecha = info.date.toISOString().split("T")[0];
          const cantidad = reservasPorDia[fecha];

          if (!cantidad) return;

          const contenedor = info.el.querySelector(".fc-daygrid-day-frame");

          if (!contenedor) return;

          const tarjeta = document.createElement("div");

          tarjeta.className =
            "absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-xl border border-emerald-200 shadow-sm px-2 py-1 text-center cursor-pointer hover:bg-emerald-100 transition";

          tarjeta.innerHTML = `
            <div style="font-size:12px;font-weight:600;color:#047857;">
              📚 ${cantidad} ${cantidad === 1 ? "reserva" : "reservas"}
            </div>
          `;

          tarjeta.onclick = (e) => {
            e.stopPropagation();

            const api = calendarRef.current?.getApi();

            if (!api) return;

            api.changeView("timeGridDay", info.date);
          };

          contenedor.style.position = "relative";
          contenedor.appendChild(tarjeta);
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

    </div>
  );
}