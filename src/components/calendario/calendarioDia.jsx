import { useMemo, useState } from "react";
import {
    FiClipboard,
    FiCalendar,
    FiTool,
    FiChevronDown,
    FiChevronUp,
} from "react-icons/fi";

function formatHora(fecha) {
    return new Date(fecha).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function generarResumenPorHora(bloques) {
    const horas = {};

    bloques.forEach((bloque) => {

        const prepInicio = new Date(
            bloque.extendedProps.preparacionInicio
        );

        const reservaInicio = new Date(
            bloque.extendedProps.reservaInicio
        );

        const reservaFin = new Date(
            bloque.extendedProps.reservaFin
        );

        const mantenimientoFin = new Date(
            bloque.extendedProps.mantenimientoFin
        );

        const inicio = prepInicio.getHours();
        const fin = mantenimientoFin.getHours();

        for (let hora = inicio; hora <= fin; hora++) {

            const key = hora.toString().padStart(2, "0") + ":00";

            if (!horas[key]) {

                horas[key] = {
                    hora: key,
                    preparacion: [],
                    clase: [],
                    mantenimiento: [],
                };

            }

            const inicioHora = new Date(prepInicio);
            inicioHora.setHours(hora, 0, 0, 0);

            const finHora = new Date(prepInicio);
            finHora.setHours(hora + 1, 0, 0, 0);

            // PREPARACIÓN

            if (
                prepInicio < finHora &&
                reservaInicio > inicioHora
            ) {

                bloque.extendedProps.reservas.forEach((r) => {

                    horas[key].preparacion.push({
                        ...r,
                        materia: r.materia,
                        profesor: r.profesor,
                        inicio: formatHora(prepInicio),
                        fin: formatHora(reservaInicio),
                    });

                });

            }

            // CLASE

            if (
                reservaInicio < finHora &&
                reservaFin > inicioHora
            ) {

                bloque.extendedProps.reservas.forEach((r) => {

                    horas[key].clase.push({
                        ...r,
                        materia: r.materia,
                        profesor: r.profesor,
                        inicio: formatHora(reservaInicio),
                        fin: formatHora(reservaFin),
                    });

                });

            }

            // MANTENIMIENTO

            if (
                reservaFin < finHora &&
                mantenimientoFin > inicioHora
            ) {

                bloque.extendedProps.reservas.forEach((r) => {

                    horas[key].mantenimiento.push({
                        ...r,
                        materia: r.materia,
                        profesor: r.profesor,
                        inicio: formatHora(reservaFin),
                        fin: formatHora(mantenimientoFin),
                    });

                });

            }

        }

    });

    return Object.values(horas).sort(
        (a, b) => a.hora.localeCompare(b.hora)
    );
}

export default function CalendarioDia({ bloques }) {

    const horas = useMemo(
        () => generarResumenPorHora(bloques),
        [bloques]
    );

    const [abiertas, setAbiertas] = useState({});

    const toggle = (hora) => {

        setAbiertas((prev) => ({
            ...prev,
            [hora]: !prev[hora],
        }));

    };

    if (horas.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 px-8 text-center">
            <FiCalendar
                size={40}
                className="mx-auto text-slate-400 mb-4"
            />

            <h3 className="text-lg font-semibold text-slate-700">
                Sin reservas para este día
            </h3>

            <p className="mt-2 text-slate-500">
                No hay reservas programadas para la fecha seleccionada.
            </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {horas.map((item) => (

                <div
                    key={item.hora}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >

                    {/* CABECERA */}

                    <button
                        onClick={() => toggle(item.hora)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                    >

                        <div className="flex items-center gap-6">

                            <div className="text-lg font-bold text-green-900 w-16 text-left">
                                {item.hora}
                            </div>

                            <div className="flex gap-8">

                                <div className="flex items-center gap-2">

                                    <FiClipboard className="text-slate-500" />

                                    <div>

                                        <div className="text-xs text-slate-500">
                                            Preparación
                                        </div>

                                        <div className="font-semibold text-slate-600">
                                            {item.preparacion.length}
                                        </div>

                                    </div>

                                </div>

                                <div className="flex items-center gap-2">

                                    <FiCalendar className="text-emerald-600" />

                                    <div>

                                        <div className="text-xs text-slate-500">
                                            Clase
                                        </div>

                                        <div className="font-semibold text-slate-500">
                                            {item.clase.length}
                                        </div>

                                    </div>

                                </div>

                                <div className="flex items-center gap-2">

                                    <FiTool className="text-slate-500" />

                                    <div>

                                        <div className="text-xs text-slate-500">
                                            Mantenimiento
                                        </div>

                                        <div className="font-semibold text-slate-600">
                                            {item.mantenimiento.length}
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {abiertas[item.hora]
                            ? <FiChevronUp size={20}/>
                            : <FiChevronDown size={20}/>
                        }

                    </button>

                    {/* DETALLE */}

                    {abiertas[item.hora] && (

                        <div className="border-t bg-slate-50 px-6 py-5 space-y-6">

                            <Seccion
                                titulo="Preparación"
                                icono={<FiTool className="text-amber-500"/>}
                                datos={item.preparacion}
                            />

                            <Seccion
                                titulo="Clase"
                                icono={<FiClipboard className="text-emerald-600"/>}
                                datos={item.clase}
                            />

                            <Seccion
                                titulo="Mantenimiento"
                                icono={<FiCalendar className="text-slate-500"/>}
                                datos={item.mantenimiento}
                            />

                        </div>

                    )}

                </div>

            ))}

        </div>
    );

}

function Seccion({ titulo, icono, datos }) {

    if (datos.length === 0) return null;

    return (

        <div>

            <div className="flex items-center gap-2 font-semibold text-slate-700 mb-3">

                {icono}

                {titulo}

            </div>

            <div className="space-y-3">

                {datos.map((r, i) => (

                    <div
                        key={i}
                        className="rounded-xl border bg-white px-4 py-3"
                    >

                        <div className="font-semibold text-slate-800">
                            {r.laboratorio}
                        </div>

                        <div className="text-sm text-slate-500 mt-1">
                            {r.inicio} - {r.fin}
                        </div>

                        {r.materia && (

                            <div className="text-sm mt-2">

                                {r.materia}

                            </div>

                        )}

                        {r.profesor && (

                            <div className="text-xs text-slate-500">

                                {r.profesor}

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </div>

    );

}