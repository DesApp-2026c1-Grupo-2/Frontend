export const PEDIDOS = [
  {
    id: "#PED-041", docente: "Dr. Herrera", fecha: "22/04", hora: "10:00",
    lab: "Lab 5", alumnos: 28, estado: "En evaluación",
    laboratorio: "Lab 5 — Bioquímica", duracion: "2 horas",
    actividad: "Extracción de ADN", observaciones: "",
    conflictos: [{ equipo: "EQ-004 Espectrofotómetro UV", motivo: "Fuera de servicio", alternativa: "EQ-007 en Lab 5. Requiere aprobación manual." }],
    historial: [
      { fecha: "16/04", hora: "11:32", accion: "Pedido creado por Dr. Herrera" },
      { fecha: "17/04", hora: "09:15", accion: "Laboratorio asignado por María López (Lab 5)" },
    ],
  },
  {
    id: "#PED-042", docente: "Mg. Castro", fecha: "24/04", hora: "14:00",
    lab: "—", alumnos: 22, estado: "Pendiente",
    laboratorio: "Sin asignar", duracion: "3 horas",
    actividad: "Microscopía óptica", observaciones: "Requiere microscopios de alta resolución.",
    conflictos: [],
    historial: [{ fecha: "18/04", hora: "08:00", accion: "Pedido creado por Mg. Castro" }],
  },
  {
    id: "#PED-043", docente: "Dra. Rojas", fecha: "25/04", hora: "09:00",
    lab: "Lab 2", alumnos: 30, estado: "Modificado",
    laboratorio: "Lab 2 — Química", duracion: "2 horas",
    actividad: "Titulación ácido-base", observaciones: "",
    conflictos: [],
    historial: [
      { fecha: "15/04", hora: "10:00", accion: "Pedido creado por Dra. Rojas" },
      { fecha: "19/04", hora: "14:30", accion: "Modificado: laboratorio cambiado a Lab 2" },
    ],
  },
  {
    id: "#PED-040", docente: "Lic. Vega", fecha: "28/04", hora: "08:00",
    lab: "Lab 1", alumnos: 38, estado: "Aceptado",
    laboratorio: "Lab 1 — General", duracion: "4 horas",
    actividad: "Disección animal", observaciones: "Material quirúrgico ya reservado.",
    conflictos: [],
    historial: [
      { fecha: "10/04", hora: "09:00", accion: "Pedido creado por Lic. Vega" },
      { fecha: "12/04", hora: "11:00", accion: "Aprobado por coordinación" },
    ],
  },
  {
    id: "#PED-039", docente: "Dr. Ramírez", fecha: "17/04", hora: "08:00",
    lab: "Lab 3", alumnos: 28, estado: "Aceptado",
    laboratorio: "Lab 3 — Física", duracion: "2 horas",
    actividad: "Experimentos de óptica", observaciones: "",
    conflictos: [],
    historial: [
      { fecha: "05/04", hora: "12:00", accion: "Pedido creado por Dr. Ramírez" },
      { fecha: "07/04", hora: "09:00", accion: "Aprobado por coordinación" },
    ],
  },
  {
    id: "#PED-038", docente: "Mg. Torres", fecha: "15/04", hora: "14:00",
    lab: "Lab 1", alumnos: 32, estado: "Rechazado",
    laboratorio: "Lab 1 — General", duracion: "2 horas",
    actividad: "Síntesis de nylon", observaciones: "Laboratorio no disponible en esa fecha.",
    conflictos: [{ equipo: "Campana de extracción", motivo: "En mantenimiento", alternativa: "No hay alternativa disponible para esa fecha." }],
    historial: [
      { fecha: "01/04", hora: "15:00", accion: "Pedido creado por Mg. Torres" },
      { fecha: "03/04", hora: "10:00", accion: "Rechazado: laboratorio sin disponibilidad" },
    ],
  },
];

export const ESTADO_STYLES = {
  "En evaluación": { 
    bg: "bg-amber-100", 
    text: "text-amber-800", 
    dot: "bg-amber-500" 
  },
  "Pendiente": { 
    bg: "bg-zinc-100", 
    text: "text-zinc-700", 
    dot: "bg-zinc-500" 
  },
  "Modificado": { 
    bg: "bg-blue-100", 
    text: "text-blue-800", 
    dot: "bg-blue-600" 
  },
  "Aceptado": { 
    bg: "bg-emerald-100", 
    text: "text-emerald-800", 
    dot: "bg-emerald-600" 
  },
  "Rechazado": { 
    bg: "bg-red-100", 
    text: "text-red-800", 
    dot: "bg-red-600" 
  },
};

export const PENDING_STATES = ["En evaluación", "Pendiente", "Modificado"];

export const ACTIVIDADES = ["Extracción de ADN", "Microscopía óptica", "Titulación ácido-base", "Disección animal", "Síntesis de nylon", "Experimentos de óptica"];
export const LABS = ["Lab 1 — General (40 alumnos)", "Lab 2 — Química (30 alumnos)", "Lab 3 — Física (32 alumnos)", "Lab 5 — Bioquímica (35 alumnos)"];
export const STEPS = ["Datos", "Recursos", "Revisión", "Envío"];