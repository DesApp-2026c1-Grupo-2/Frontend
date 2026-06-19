import { useState, useMemo, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export function LabCalendar({ scheduleData = [], onDateChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { days, weekSpan, startDateStr, endDateStr } = useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay();
    // Ajustamos para que el lunes sea el primer día de la semana
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(date.setDate(diff));

    const computedDays = [];
    const weekDaysStr = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');

      computedDays.push({
        key: `${yyyy}-${mm}-${dd}`,
        label: `${weekDaysStr[d.getDay()]} ${d.getDate()}`,
      });
    }

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const startDay = monday.getDate();
    const endDay = sunday.getDate();
    const startMonth = monthNames[monday.getMonth()];
    const endMonth = monthNames[sunday.getMonth()];
    const startYear = monday.getFullYear();
    const endYear = sunday.getFullYear();

    let computedSpan = "";
    if (startMonth === endMonth && startYear === endYear) {
      computedSpan = `${startDay} - ${endDay} de ${startMonth} de ${startYear}`;
    } else if (startYear === endYear) {
      computedSpan = `${startDay} de ${startMonth} - ${endDay} de ${endMonth} de ${startYear}`;
    } else {
      computedSpan = `${startDay} de ${startMonth} de ${startYear} - ${endDay} de ${endMonth} de ${endYear}`;
    }

    const formatYMD = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    return { 
      days: computedDays, 
      weekSpan: computedSpan,
      startDateStr: formatYMD(monday),
      endDateStr: formatYMD(sunday)
    };
  }, [currentDate]);

  useEffect(() => {
    if (onDateChange) {
      onDateChange(startDateStr, endDateStr);
    }
  }, [startDateStr, endDateStr, onDateChange]);

  const getStatusClass = (status) => {
    if (status === "available") return "bg-emerald-100 text-emerald-800";
    if (status === "reserved") return "bg-blue-100 text-blue-800";
    if (status === "reserved-alt") return "bg-amber-100 text-amber-800";
    return "bg-slate-100 text-slate-800";
  };

  const getStatusLabel = (slot) => {
    if (slot.estado) return slot.estado;
    if (slot.status === "available") return "Disponible";
    if (slot.status === "reserved") return "Reservado";
    if (slot.status === "reserved-alt") return "Reserva parcial";
    return "Mantenimiento";
  };

  const getSlotsForDay = (lab, day, dayIndex) => {
    const datedSlots = lab.schedule.filter((slot) => slot.date === day.key);
    if (datedSlots.length > 0) return datedSlots;

    const legacySlot = lab.schedule[dayIndex];
    return legacySlot && !legacySlot.date ? [legacySlot] : [];
  };

  const labsWithVisibleSlots = scheduleData
    .map((lab) => ({
      ...lab,
      days: days.map((day, dayIndex) => ({
        ...day,
        slots: getSlotsForDay(lab, day, dayIndex),
      })),
    }))
    .filter((lab) => lab.days.some((day) => day.slots.length > 0));

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="w-full max-w-full overflow-hidden bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 shadow-lg">
      <div className="flex min-w-0 flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="min-w-0 text-2xl font-semibold leading-tight text-gray-900 sm:text-3xl lg:text-2xl">
          Calendario de laboratorios - Vista semanal
        </h2>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <button onClick={goToToday} className="shrink-0 text-gray-600 text-sm hover:text-gray-900 font-medium transition-colors">Hoy</button>
          <button onClick={prevWeek} className="shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={nextWeek} className="shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex min-w-0 flex-1 basis-full items-center justify-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 sm:basis-auto sm:flex-none sm:max-w-full">
            <Calendar className="w-4 h-4 text-gray-600 shrink-0" />
            <span className="min-w-0 text-center text-sm text-gray-700 leading-tight break-words">{weekSpan}</span>
          </div>
          <select className="min-w-0 flex-1 basis-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 sm:basis-auto sm:flex-none">
            <option>Todos los laboratorios</option>
          </select>
        </div>
      </div>

      {/* Mobile schedule */}
      <div className="space-y-4 md:hidden">
        {labsWithVisibleSlots.length > 0 ? (
          labsWithVisibleSlots.map((lab) => (
            <div key={lab.lab} className="border-t border-gray-200 pt-4">
              <div className="mb-3">
                <p className="text-sm font-semibold leading-tight text-gray-900">{lab.lab}</p>
                <p className="text-xs leading-tight text-gray-600">{lab.capacity}</p>
              </div>

              <div className="space-y-3">
                {lab.days
                  .filter((day) => day.slots.length > 0)
                  .map((day) => (
                    <div key={`${lab.lab}-${day.key}`} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3">
                      <div className="rounded-lg bg-gray-50 px-2 py-2 text-center text-xs font-semibold leading-tight text-gray-700">
                        {day.label}
                      </div>
                      <div className="min-w-0 space-y-2">
                        {day.slots.map((slot, idx) => (
                          <div
                            key={`${day.key}-${slot.time}-${idx}`}
                            className={`min-w-0 rounded-lg px-3 py-2 text-xs font-semibold leading-snug ${getStatusClass(slot.status)}`}
                          >
                            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
                              <span className="whitespace-nowrap">{slot.time}</span>
                              <span className="text-right">{getStatusLabel(slot)}</span>
                            </div>
                            <p className="mt-1 break-words">{slot.subject}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
            No hay reservas para esta semana.
          </div>
        )}
      </div>

      {/* Desktop schedule table */}
      <div className="hidden w-full max-w-full overflow-hidden md:block">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[25%] sm:w-[22%]" />
            {days.map((day) => (
              <col key={day.key} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="text-left text-[11px] sm:text-xs font-semibold text-gray-700 pb-4 pr-2 bg-white break-words">
                Laboratorio
              </th>
              {days.map((day) => (
                <th key={day.key} className="text-center text-[10px] sm:text-xs font-semibold text-gray-700 pb-4 px-0.5 sm:px-2">
                  <span className="block leading-tight break-words">{day.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((lab) => (
              <tr key={lab.lab} className="border-t border-gray-200">
                <td className="py-4 pr-2 bg-white align-top">
                  <p className="font-medium text-[11px] leading-tight text-gray-900 break-words sm:text-sm">{lab.lab}</p>
                  <p className="text-[10px] leading-tight text-gray-600 break-words sm:text-xs">{lab.capacity}</p>
                </td>
                {days.map((day, dayIndex) => (
                  <td key={day.key} className="px-0.5 py-4 align-top sm:px-2">
                    <div className="space-y-2">
                      {getSlotsForDay(lab, day, dayIndex).map((slot, idx) => (
                        <div
                          key={`${day.key}-${slot.time}-${idx}`}
                          className={`overflow-hidden rounded p-1 text-center text-[10px] font-semibold leading-tight sm:p-2 sm:text-xs ${getStatusClass(slot.status)}`}
                        >
                          <p className="break-words">{slot.time}</p>
                          <p className="mt-1 break-words">{slot.subject}</p>
                          <p className="mt-1 break-words">{getStatusLabel(slot)}</p>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-6 pt-6 border-t border-gray-200 text-xs">
        <div className="flex min-w-0 items-center gap-2">
          <div className="w-3 h-3 shrink-0 bg-blue-500 rounded-full" />
          <span className="text-slate-700 font-medium">Reservado</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <div className="w-3 h-3 shrink-0 bg-emerald-500 rounded-full" />
          <span className="text-slate-700 font-medium">Disponible</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <div className="w-3 h-3 shrink-0 bg-amber-500 rounded-full" />
          <span className="text-slate-700 font-medium">Reserva parcial</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <div className="w-3 h-3 shrink-0 bg-slate-500 rounded-full" />
          <span className="text-slate-700 font-medium">Mantenimiento</span>
        </div>
      </div>
    </div>
  );
}
