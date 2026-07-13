import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useRef, useEffect } from "react";

export default function CalendarioMini({
    fechaSeleccionada,
    setFechaSeleccionada,
    vistaActual,
    setVistaActual,
    reservas,
}) {
    const calendarRef = useRef(null);

    const dias = [...new Set(
        reservas.map((r) => r.reservaInicio.split("T")[0])
    )];

    const eventos = dias.map((fecha) => ({
        id: fecha,
        start: fecha,
        title: "•",
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
                    console.log("CLICK MINI:", info.date);

                    setFechaSeleccionada(info.date);
                    setVistaActual("timeGridDay");

                }}

                eventContent={() => (
                    <div className="flex justify-center items-center w-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                )}

                dayCellClassNames={(info) => {

                    const seleccionada =
                        info.date.toDateString() === fechaSeleccionada.toDateString();

                    return seleccionada
                        ? ["bg-emerald-100", "rounded-full"]
                        : [];
                }}
            />
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">

                <div className="w-2 h-2 rounded-full bg-emerald-500"/>

                <span>Día con reservas</span>

            </div>

        </div>

    );

}