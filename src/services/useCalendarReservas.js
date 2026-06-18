import { useState, useEffect, useCallback } from "react";
import { getReservasActivas } from "../services/reservas";

export function useCalendarReservas(initialStartDate, initialEndDate) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // El estado mantiene el rango actual renderizado en el calendario
  const [dateRange, setDateRange] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });

  useEffect(() => {
    const fetchReservas = async () => {
      if (!dateRange.startDate || !dateRange.endDate) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await getReservasActivas(dateRange.startDate, dateRange.endDate);
        setReservas(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Error al cargar las reservas");
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [dateRange.startDate, dateRange.endDate]);

  // Función expuesta para actualizar dinámicamente cuando el calendario cambia de vista
  // (Ideal para enlazar con eventos de FullCalendar como `datesSet`)
  const handleDateRangeChange = useCallback((start, end) => {
    setDateRange((prev) => {
      if (prev.startDate === start && prev.endDate === end) return prev;
      return { startDate: start, endDate: end };
    });
  }, []);

  // --- MAPEOS DE DATOS ---

  // 1. Mapeo genérico para la librería FullCalendar
  const getEventosFullCalendar = () => {
    return reservas.map((reserva) => {
      const start = new Date(reserva.fechaHora);
      // Asumimos 2 horas de duración si el backend no lo provee nativamente
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); 

      const isEnCurso = reserva.estado === "En Curso";
      const title = `${reserva.pedidoId?.materia || "Reserva"} - ${reserva.laboratorioId?.nombre || "Lab"}`;

      return {
        id: reserva._id || reserva.id,
        title,
        start: start.toISOString(),
        end: end.toISOString(),
        // Diferenciación visual por estado (Verde vs Ámbar)
        backgroundColor: isEnCurso ? "#10b981" : "#f59e0b",
        borderColor: isEnCurso ? "#059669" : "#d97706",
        extendedProps: {
          docente: `${reserva.docenteId?.nombre || ""} ${reserva.docenteId?.apellido || ""}`.trim(),
          alumnos: reserva.pedidoId?.alumnos,
          estado: reserva.estado,
          laboratorio: reserva.laboratorioId,
          equipos: reserva.equiposReservados,
          materiales: reserva.materialesReservados,
        },
      };
    });
  };

  // 2. Mapeo diseñado para tu componente personalizado LabCalendar
  const getEventosLabCalendar = () => {
    const labsMap = new Map();

    reservas.forEach((reserva) => {
      const labId = reserva.laboratorioId?._id || reserva.laboratorioId?.id || reserva.laboratorioId;
      if (!labId) return;

      if (!labsMap.has(labId)) {
        labsMap.set(labId, {
          lab: reserva.laboratorioId?.nombre || "Laboratorio",
          capacity: `Cap. ${reserva.laboratorioId?.capacidad || 0} personas`,
          schedule: [],
        });
      }

      const start = new Date(reserva.fechaHora);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const yyyy = start.getFullYear();
      const mm = String(start.getMonth() + 1).padStart(2, '0');
      const dd = String(start.getDate()).padStart(2, '0');

      labsMap.get(labId).schedule.push({
        date: `${yyyy}-${mm}-${dd}`,
        time: `${startTimeStr} - ${endTimeStr}`,
        subject: reserva.pedidoId?.materia || "Reservado",
        estado: reserva.estado,
        status: reserva.estado === "Pendiente" ? "reserved-alt" : "reserved",
      });
    });
    return Array.from(labsMap.values());
  };

  return {
    loading,
    error,
    dateRange,
    handleDateRangeChange,
    eventosFullCalendar: getEventosFullCalendar(),
    eventosLabCalendar: getEventosLabCalendar(),
  };
}
