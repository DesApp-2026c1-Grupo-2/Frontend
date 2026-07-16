import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from "@fullcalendar/core/locales/es";
import { useRef, useState, useEffect } from "react";
import BarraFiltros from "./barraFiltros";
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
        fondo: "bg-slate-50",
        texto: "text-slate-700",
        borde: "border-slate-200",
      },
      clase: {
        fondo: "bg-slate-400",
        texto: "text-white",
        borde: "border-slate-300",
      },
      mantenimiento: {
        fondo: "bg-slate-50",
        texto: "text-slate-700",
        borde: "border-slate-200",
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
  const [esMobile, setEsMobile] = useState(window.innerWidth < 768);
  
  const [tituloMes, setTituloMes] = useState("Junio 2026");

  const [edificio, setEdificio] = useState("");
  const [laboratorio, setLaboratorio] = useState("");
  
  const [edificios, setEdificios] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [todosLosLaboratorios, setTodosLosLaboratorios] = useState([]);
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

        // Mes y Día muestran todos los laboratorios ("todos"). La vista semanal
        // se acota a un laboratorio concreto para ADMIN/PERSONAL, pero el
        // DOCENTE también arranca en "todos" para ver sus reservas en todos los
        // laboratorios de un vistazo.
        const esAdminOPersonal =
          user?.rol === "ADMIN" || user?.rol === "PERSONAL";

        if (
          vistaActual === "dayGridMonth" ||
          vistaActual === "timeGridDay" ||
          !esAdminOPersonal
        ) {
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

    const esAdminOPersonal =
      user?.rol === "ADMIN" || user?.rol === "PERSONAL";

    if (
      vistaActual === "dayGridMonth" ||
      vistaActual === "timeGridDay" ||
      !esAdminOPersonal
    ) {
      setLaboratorio("todos");
    } else if (laboratorio === "todos") {
      setLaboratorio(laboratorios[0]._id || laboratorios[0].id);
    }
  }, [vistaActual, laboratorios]);

  useEffect(() => {
    const handleResize = () => {
      setEsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // En mobile el botón "Semana" está oculto y esa vista queda muy apretada:
    // si el usuario quedó en vista semanal al achicar la pantalla, pasamos a mes.
    // En desktop NO forzamos ninguna vista: las tres (mes/semana/día) son válidas.
    if (esMobile && vistaActual === "timeGridWeek") {
      setVistaActual("dayGridMonth");
    }
  }, [esMobile, vistaActual, setVistaActual]);

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

  // Las reservas ya llegan filtradas por rol desde la página (el DOCENTE solo
  // recibe las suyas), por eso acá usamos el prop `reservas` directamente.
  // `esAdminOPersonal` se conserva solo para decidir qué edificios/labs se
  // ofrecen en los filtros: ADMIN/PERSONAL ven todos; el DOCENTE, únicamente
  // los que tienen reservas suyas.
  const esAdminOPersonal =
    user?.rol === "ADMIN" || user?.rol === "PERSONAL";

  const edificiosDisponibles = esAdminOPersonal
    ? edificios
    : edificios.filter((ed) =>
        todosLosLaboratorios.some((lab) => {
          const laboratorioTieneReserva = reservas.some(
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
        reservas.some(
          (r) => r.laboratorioId === (lab.id || lab._id)
        )
      );

  const idsLaboratorios = laboratorios.map(
    (l) => l._id || l.id
  );

  const reservasFiltradas = reservas.filter((reserva) => {
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

  const eventosSemana = reservasFiltradas.flatMap((reserva) => {
    const bloqueClase = {
      id: `${reserva.id}-clase`,
      title: reserva.materia,
      start: reserva.reservaInicio,
      end: reserva.reservaFin,

      extendedProps: {
        tipo: "clase",
        reserva,
      },
    };

    // El DOCENTE solo ve la clase; ADMIN/PERSONAL ven también los bloques de
    // preparación y mantenimiento.
    if (!esAdminOPersonal) {
      return [bloqueClase];
    }

    return [
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

      bloqueClase,

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
    ];
  });


  // --- Rango horario dinámico de la vista semana ---
  // Si la semana visible tiene pocas reservas (<= UMBRAL), recortamos la grilla
  // para que arranque en la primera reserva y termine en la última, de modo que
  // queden arriba y visibles sin scroll. Con más reservas (o en otras vistas)
  // usamos el rango completo por defecto.
  const SLOT_MIN_DEFECTO = "06:00:00";
  const SLOT_MAX_DEFECTO = "23:00:00";
  const UMBRAL_POCAS_RESERVAS = 5;

  let slotMinTime = SLOT_MIN_DEFECTO;
  let slotMaxTime = SLOT_MAX_DEFECTO;

  if (vistaActual === "timeGridWeek") {
    // Lunes de la semana que contiene la fecha seleccionada (firstDay = 1).
    const inicioSemanaVista = new Date(fechaSeleccionada);
    inicioSemanaVista.setHours(0, 0, 0, 0);
    const diaSemana = inicioSemanaVista.getDay();
    const diffALunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    inicioSemanaVista.setDate(inicioSemanaVista.getDate() + diffALunes);

    const finSemanaVista = new Date(inicioSemanaVista);
    finSemanaVista.setDate(finSemanaVista.getDate() + 7);

    const reservasSemanaVista = reservasFiltradas.filter((r) => {
      const inicio = new Date(r.reservaInicio);
      return inicio >= inicioSemanaVista && inicio < finSemanaVista;
    });

    if (
      reservasSemanaVista.length > 0 &&
      reservasSemanaVista.length <= UMBRAL_POCAS_RESERVAS
    ) {
      // Franja más temprana y más tardía visibles, en hora local, para que
      // todos los bloques de cada reserva entren en el rango. El DOCENTE solo
      // ve la clase, así que su rango se basa en la clase (no en la
      // preparación/mantenimiento, que no se muestran).
      let minHora = 23;
      let maxHora = 0;

      reservasSemanaVista.forEach((r) => {
        const inicio = new Date(
          esAdminOPersonal ? r.preparacionInicio : r.reservaInicio
        );
        const fin = new Date(
          esAdminOPersonal ? r.mantenimientoFin : r.reservaFin
        );

        minHora = Math.min(minHora, inicio.getHours());

        const horaFin =
          fin.getMinutes() > 0 ? fin.getHours() + 1 : fin.getHours();
        maxHora = Math.max(maxHora, horaFin);
      });

      minHora = Math.max(0, minHora);
      maxHora = Math.min(24, maxHora);

      // Solo aplicamos el recorte si el rango resultante es coherente.
      if (maxHora > minHora) {
        slotMinTime = `${String(minHora).padStart(2, "0")}:00:00`;
        slotMaxTime = `${String(maxHora).padStart(2, "0")}:00:00`;
      }
    }
  }

  const reservasDelDia = reservasFiltradas.filter((reserva) => {
    const fechaReserva = reserva.reservaInicio.split("T")[0];
    const fechaActual = fechaSeleccionada.toISOString().split("T")[0];

    return fechaReserva === fechaActual;
  });

  const bloquesDia = agruparReservasPorHorario(reservasDelDia);

  const reservasPorDia = reservasFiltradas.reduce((acc, reserva) => {
    const fecha = reserva.reservaInicio.split("T")[0];

    if (!acc[fecha]) {
      acc[fecha] = {
        activas: 0,
        finalizadas: 0,
        laboratorios: {},
      };
    }

    if (reserva.estado === "Finalizada") {
      acc[fecha].finalizadas++;
    } else {
      acc[fecha].activas++;
    }

    acc[fecha].laboratorios[reserva.laboratorio] =
      (acc[fecha].laboratorios[reserva.laboratorio] || 0) + 1;

    return acc;
  }, {});

  const eventosMes = Object.entries(reservasPorDia).map(([fecha, datos]) => ({
    id: fecha,
    title: `${datos.activas + datos.finalizadas} ${
      datos.activas + datos.finalizadas === 1 ? "reserva" : "reservas"
    }`,
    start: fecha,
    allDay: true,
    extendedProps: {
      activas: datos.activas,
      finalizadas: datos.finalizadas,
      laboratorios: datos.laboratorios,
    },
  }));

  return (
    <div className="bg-white px-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

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
            permitirTodosEnSemana={!esAdminOPersonal}
          />
        </div>

      </div>

      <div className="flex flex-wrap gap-2">

        <button
          onClick={() => setVistaActual("dayGridMonth")}
          className={`flex-1 sm:flex-none px-3 py-2 rounded-xl transition
            ${
              vistaActual === "dayGridMonth"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
            }
          `}
        >
          Mes
        </button>
        
        {!esMobile && (
          <button
            onClick={() => setVistaActual("timeGridWeek")}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-xl transition
              ${
                vistaActual === "timeGridWeek"
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
              }
            `}
          >
            Semana
          </button>
        )}

        <button
          onClick={() => {
              actualizarTitulo(fechaSeleccionada);
              setVistaActual("timeGridDay");
            }}
          className={`flex-1 sm:flex-none px-3 py-2 rounded-xl transition
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
            soloClase={!esAdminOPersonal}
        />

      ) : (
        <FullCalendar
          key={`${vistaActual}-${fechaSeleccionada.toISOString()}-${slotMinTime}-${slotMaxTime}`}
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
          slotMinTime={slotMinTime}
          slotMaxTime={slotMaxTime}
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

              const activas = info.event.extendedProps.activas || 0;
              const finalizadas = info.event.extendedProps.finalizadas || 0;
              const esMobileVista = window.innerWidth <= 640;

              return (
                <div className="flex flex-col gap-1">
                  {activas > 0 && (
                    <div className="evento-resumen-mes">
                      <div className="titulo-resumen">
                        {esMobileVista
                          ? activas
                          : `${activas} ${
                              activas === 1 ? "activa" : "activas"
                            }`}
                      </div>
                    </div>
                  )}

                  {finalizadas > 0 && (
                    <div className="evento-resumen-mes evento-resumen-mes-finalizado">
                      <div className="titulo-resumen">
                        {esMobileVista
                          ? finalizadas
                          : `${finalizadas} ${
                              finalizadas === 1 ? "finalizada" : "finalizadas"
                            }`}
                      </div>
                    </div>
                  )}

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
                    className={`text-[12px] ${
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
            info.el.classList.add("evento-click");
              setTimeout(() => {
              setFechaSeleccionada(info.event.start);
              actualizarTitulo(info.event.start);
              setVistaActual("timeGridDay");
            }, 120);
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