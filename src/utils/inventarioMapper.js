// Utilidades de mapeo de inventario (items, lotes y equipos) del backend al
// modelo del frontend. Compartidas entre la página de Equipamiento y la de
// Historial de descartes.

export const discardCategories = ["Todos", "Equipos", "Materiales", "Reactivos"];

// Mapeo de tipos del backend a categorías del frontend.
// La entrada 'equipo' se conserva a propósito: aunque "equipo" ya NO es un tipo
// válido de Item (la pantalla de Stock nunca lo deriva), el historial de
// descartes (PanelDescartes.jsx, contrato de /descartes) sí trae descartes cuyo
// tipo puede ser 'equipo'. Quitarla rompería ese mapeo.
export const tipoToCategoria = {
  'material': 'Materiales',
  'reactivo': 'Reactivos',
  'sustancia': 'Sustancias basicas',
  'equipo': 'Equipos'
};

// Etiqueta legible por tipo de movimiento de stock (contrato /movimientos).
// Se usa en el Historial de Movimientos (PanelMovimientos.jsx) para mostrar el
// enum del backend de forma amigable.
export const tipoMovimientoLabel = {
  APROBACION_RESERVA: 'Aprobación de reserva',
  DESCARTE: 'Descarte',
  COMPRA: 'Compra',
  AJUSTE_MANUAL: 'Ajuste manual',
  BAJA: 'Baja',
  DEVOLUCION: 'Devolución',
  TRANSFERENCIA: 'Transferencia',
  MANTENIMIENTO: 'Mantenimiento',
};

// Opciones del filtro por tipo de movimiento: "Todos" (→ sin filtro) seguido de
// los tipos del enum en el orden declarado arriba. Se excluye MANTENIMIENTO del
// filtro (el mantenimiento tiene su propia pestaña); la etiqueta se conserva en
// `tipoMovimientoLabel` para mostrarlo legible si el backend lo devuelve.
export const tiposMovimiento = [
  'Todos',
  ...Object.keys(tipoMovimientoLabel).filter((t) => t !== 'MANTENIMIENTO'),
];

// Tipos de mantenimiento de equipos (contrato /equipo/:id/mantenimientos).
// Se usan en el Historial de Mantenimiento (PanelMantenimiento.jsx).
export const tipoMantenimientoLabel = {
  preventivo: 'Preventivo',
  correctivo: 'Correctivo',
};

// Opciones del filtro por tipo de mantenimiento: "Todos" (→ sin filtro) seguido
// de los tipos válidos del backend.
export const tiposMantenimiento = ['Todos', 'preventivo', 'correctivo'];

// Mapeo inverso SOLO para la pantalla de Stock: categoría del front -> tipo de
// Item válido para el backend. No incluye 'Equipos' porque los equipos son una
// entidad aparte (nunca se crean como Item con tipo=equipo, que daría 400).
export const categoriaATipoItem = {
  'Materiales': 'material',
  'Reactivos': 'reactivo',
  'Sustancias basicas': 'sustancia',
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

// Mapea los items paginados del backend (GET /items) al modelo de "grupo" del
// frontend. El stock total viene calculado por el backend (stockDisponible); el
// front ya NO suma lotes en memoria. Los lotes de cada item se piden aparte al
// expandirlo (GET /lotes?itemId=...).
export const mapearItemsBackend = (items) => {
  return items.map(item => {
    const id = item.id || item._id;
    return {
      id,
      itemId: id,
      categoria: tipoToCategoria[item.tipo] || 'Materiales',
      tipo: item.nombre,
      codigo: item.codigo,
      unidad: item.unidad,
      esConsumible: item.esConsumible,
      requiereReceta: item.requiereReceta,
      stockDisponible: item.stockDisponible ?? 0,
    };
  });
};

// Mapea un lote del backend (GET /lotes) a una fila del frontend. Se usa tanto
// en el desplegable de un item (lotes disponibles) como en el panel de
// descartados. `itemId` puede venir poblado (objeto) o como ObjectId (string).
export const mapearLoteBackend = (lote) => {
  const itemPoblado = typeof lote.itemId === 'object' && lote.itemId !== null ? lote.itemId : null;
  const itemId = itemPoblado ? (itemPoblado.id || itemPoblado._id) : lote.itemId;
  const loteId = lote.id || lote._id;

  // Ubicación estructurada del lote (contrato /lotes): laboratorioId null = depósito,
  // o el laboratorio físico donde está el lote (puede venir poblado o como ObjectId).
  // Distinto de `ubicacion` (string libre, detalle físico fino como "Armario 3").
  const labPoblado = typeof lote.laboratorioId === 'object' && lote.laboratorioId !== null ? lote.laboratorioId : null;
  const laboratorioId = labPoblado ? (labPoblado.id || labPoblado._id) : (lote.laboratorioId ?? null);
  const ubicacionLote = laboratorioId ? (labPoblado?.nombre || 'Laboratorio asignado') : 'Depósito';

  return {
    id: loteId,
    loteId,
    itemId,
    tipo: itemPoblado?.nombre,
    codigo: itemPoblado?.codigo,
    laboratorioId,
    ubicacionLote,
    ubicacion: lote.ubicacion,
    estado: mapearEstado(lote.estado),
    cantidad: lote.cantidadDisponible,
    movilidad: lote.movilidad || "Fija",
    fechaVencimiento: lote.fechaVencimiento || null,
    fechaDescarte: lote.fechaDescarte || lote.descartadoEn || lote.updatedAt || lote.createdAt,
    motivoDescarte: lote.motivoDescarte || lote.motivo || "",
    responsableDescarte: lote.responsableDescarte || lote.responsable || "",
  };
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
