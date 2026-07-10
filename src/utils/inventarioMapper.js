// Utilidades de mapeo de inventario (items, lotes y equipos) del backend al
// modelo del frontend. Compartidas entre la página de Equipamiento y la de
// Historial de descartes.

export const discardCategories = ["Todos", "Equipos", "Materiales", "Reactivos"];

// Mapeo de tipos del backend a categorías del frontend
export const tipoToCategoria = {
  'material': 'Materiales',
  'reactivo': 'Reactivos',
  'sustancia': 'Sustancias basicas',
  'equipo': 'Equipos'
};

// Mapear estados del backend al frontend
export const mapearEstado = (estadoBackend) => {
  const estadoMap = {
    'disponible': 'Disponible',
    'reservado': 'Reservado',
    'en_uso': 'En uso',
    'descartado': 'Descartado',
    'mantenimiento': 'Mantenimiento',
    'fuera_de_servicio': 'Fuera de servicio',
    'fuera de servicio': 'Fuera de servicio',
  };
  return estadoMap[estadoBackend] || 'Disponible';
};

// Función para mapear datos del backend a la estructura del frontend
export const mapearDatosBackend = (items, lotes) => {
  const inventario = [];
  const lotesPorItemId = new Map();

  lotes.forEach(lote => {
    const itemId = typeof lote.itemId === 'object' ? lote.itemId._id : lote.itemId;
    const lotesDelItem = lotesPorItemId.get(itemId);

    if (lotesDelItem) {
      lotesDelItem.push(lote);
    } else {
      lotesPorItemId.set(itemId, [lote]);
    }
  });

  items.forEach(item => {
    const lotesDelItem = lotesPorItemId.get(item._id) || [];

    lotesDelItem.forEach(lote => {
      inventario.push({
        id: lote._id,
        loteId: lote._id,
        itemId: item._id,
        categoria: tipoToCategoria[item.tipo] || 'Equipos',
        tipo: item.nombre,
        codigo: item.codigo,
        ubicacion: lote.ubicacion,
        estado: mapearEstado(lote.estado),
        cantidad: lote.cantidadDisponible,
        movilidad: lote.movilidad || "Fija",
        unidad: item.unidad,
        esConsumible: item.esConsumible,
        fechaDescarte: lote.fechaDescarte || lote.descartadoEn || lote.updatedAt || lote.createdAt,
        motivoDescarte: lote.motivoDescarte || lote.motivo || "",
        responsableDescarte: lote.responsableDescarte || lote.responsable || "",
      });
    });
  });

  return inventario;
};

// Función para mapear los equipos desde el backend a la estructura del frontend
export const mapearEquiposBackend = (equipos) => {
  return equipos.map(equipo => {
    let ubicacion = "Sin asignar";
    if (equipo.laboratorioId) {
      ubicacion = typeof equipo.laboratorioId === 'object' ? equipo.laboratorioId.nombre : "Laboratorio asignado";
    } else if (equipo.edificioId) {
      ubicacion = typeof equipo.edificioId === 'object' ? equipo.edificioId.nombre : "Edificio asignado";
    }

    return {
      id: equipo.id || equipo._id,
      itemId: equipo.id || equipo._id,
      categoria: 'Equipos',
      tipo: equipo.nombre,
      codigo: equipo.codigo,
      ubicacion: ubicacion,
      estado: mapearEstado(equipo.estado),
      cantidad: 1,
      movilidad: equipo.esFijo ? "Fija" : "Movible",
      esConsumible: false,
      fechaDescarte: equipo.fechaDescarte || equipo.descartadoEn || equipo.updatedAt || equipo.createdAt,
      motivoDescarte: equipo.motivoDescarte || equipo.motivo || "",
      responsableDescarte: equipo.responsableDescarte || equipo.responsable || "",
      equipoOriginal: equipo
    };
  });
};

// Formatea una fecha a formato local es-AR (dd/mm/aaaa)
export function formatDate(value) {
  if (!value) return "Sin fecha registrada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha registrada";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
