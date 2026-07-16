import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useRef, useEffect } from "react";

export default function CalendarioMini({
    fechaSeleccionada,
    setFechaSeleccionada,
    setVistaActual,
    reservas,
}) {
    const calendarRef = useRef(null);

    // Agrupamos por día registrando si tiene reservas activas y/o finalizadas,
    // para pintar un punto verde (activas) y/o gris (finalizadas) por día,
    // igual que el calendario grande.
    const diasPorEstado = reservas.reduce((acc, r) => {
        const fecha = r.reservaInicio.split("T")[0];

        if (!acc[fecha]) {
            acc[fecha] = { activas: false, finalizadas: false };
        }

        if (r.estado === "Finalizada") {
            acc[fecha].finalizadas = true;
        } else {
            acc[fecha].activas = true;
        }

        return acc;
    }, {});

    const eventos = Object.entries(diasPorEstado).map(([fecha, datos]) => ({
        id: fecha,
        start: fecha,
        title: "•",
        extendedProps: {
            activas: datos.activas,
            finalizadas: datos.finalizadas,
        },
    }));

    useEffect(() => {
        const api = calendarRef.current?.getApi();

        if (!api) return;

        api.gotoDate(fechaSeleccionada);

    }, [fechaSeleccionada]);

    return (

        <div className="w-full">

            <FullCalendar
                ref={calendarRef}
                plugins={[
                    dayGridPlugin,
                    interactionPlugin,
                ]}

                locale={esLocale}
                initialView="dayGridMonth"
                initialDate={fechaSeleccionada}
                firstDay={1}
                headerToolbar={{
                    left: "prev",
                    center: "title",
                    right: "next",
                }}
                height="auto"
                fixedWeekCount={false}
                showNonCurrentDates={true}
                selectable={true}
                events={eventos}
                eventDisplay="list-item"
                dayMaxEvents={false}

                dateClick={(info) => {
                    setFechaSeleccionada(info.date);
                    setVistaActual("timeGridDay");

                }}

                eventContent={(info) => {
                    const { activas, finalizadas } =
                        info.event.extendedProps;

                    return (
                        <div className="flex justify-center items-center gap-0.5 w-full">
                            {activas && (
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            )}

                            {finalizadas && (
                                <div className="w-2 h-2 rounded-full bg-slate-400" />
                            )}
                        </div>
                    );
                }}

                dayCellClassNames={(info) => {

                    const seleccionada =
                        info.date.toDateString() === fechaSeleccionada.toDateString();

                    return seleccionada
                        ? ["bg-emerald-100", "rounded-full"]
                        : [];
                }}
            />
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">

                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"/>
                    <span>Activas</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400"/>
                    <span>Finalizadas</span>
                </div>

            </div>

        </div>

    );

}