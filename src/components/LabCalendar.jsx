import { useState, useMemo, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export function LabCalendar({ scheduleData, dateRange, onDateChange }) {
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
      computedDays.push(`${weekDaysStr[d.getDay()]} ${d.getDate()}`);
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
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Calendario de laboratorios - Vista semanal</h2>
        <div className="flex items-center gap-4">
          <button onClick={goToToday} className="text-gray-600 text-sm hover:text-gray-900 font-medium transition-colors">Hoy</button>
          <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 w-[300px]">
            <Calendar className="w-4 h-4 text-gray-600 shrink-0" />
            <span className="text-sm text-gray-700">{weekSpan}</span>
          </div>
          <select className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700">
            <option>Todos los laboratorios</option>
          </select>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold text-gray-700 pb-4 sticky left-0 bg-white">
                Laboratorio
              </th>
              {days.map((day) => (
                <th key={day} className="text-center text-xs font-semibold text-gray-700 pb-4 px-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((lab) => (
              <tr key={lab.lab} className="border-t border-gray-200">
                <td className="py-4 sticky left-0 bg-white">
                  <p className="font-medium text-sm text-gray-900">{lab.lab}</p>
                  <p className="text-xs text-gray-600">{lab.capacity}</p>
                </td>
                {lab.schedule.map((slot, idx) => (
                  <td key={idx} className="px-2 py-4">
                    {slot.time && (
                      <div
                        className={`text-xs p-2 rounded text-center font-semibold ${
                          slot.status === "available"
                            ? "bg-emerald-100 text-emerald-800"
                            : slot.status === "reserved"
                            ? "bg-blue-100 text-blue-800"
                            : slot.status === "reserved-alt"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <p>{slot.time}</p>
                        <p>{slot.subject}</p>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-slate-700 font-medium">Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span className="text-slate-700 font-medium">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span className="text-slate-700 font-medium">Reserva parcial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-500 rounded-full" />
          <span className="text-slate-700 font-medium">Mantenimiento</span>
        </div>
      </div>
    </div>
  );
}