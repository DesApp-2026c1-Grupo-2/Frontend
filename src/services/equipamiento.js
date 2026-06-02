import api from "../api/axios";

// Obtener todos los Items
export const getItems = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.tipo) params.append("tipo", filtros.tipo);
    if (filtros.esConsumible !== undefined) params.append("esConsumible", filtros.esConsumible);
    
    const response = await api.get(`/items${params.toString() ? "?" + params.toString() : ""}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener items:", error);
    throw error;
  }
};

// Obtener un Item por ID
export const getItemById = async (itemId) => {
  try {
    const response = await api.get(`/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener item ${itemId}:`, error);
    throw error;
  }
};

// Obtener todos los Lotes
export const getLotes = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.itemId) params.append("itemId", filtros.itemId);
    if (filtros.estado) params.append("estado", filtros.estado);
    if (filtros.ubicacion) params.append("ubicacion", filtros.ubicacion);
    
    const response = await api.get(`/lotes${params.toString() ? "?" + params.toString() : ""}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener lotes:", error);
    throw error;
  }
};

// Obtener Lotes de un Item específico
export const getLotesByItemId = async (itemId) => {
  try {
    const response = await api.get(`/lotes?itemId=${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener lotes del item ${itemId}:`, error);
    throw error;
  }
};

// Obtener un Lote por ID
export const getLoteById = async (loteId) => {
  try {
    const response = await api.get(`/lotes/${loteId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener lote ${loteId}:`, error);
    throw error;
  }
};

// Crear un nuevo Item
export const createItem = async (itemData) => {
  try {
    const response = await api.post("/items", itemData);
    return response.data;
  } catch (error) {
    console.error("Error al crear item:", error);
    throw error;
  }
};

// Crear un nuevo Lote
export const createLote = async (loteData) => {
  try {
    const payload = {
      ...loteData,
      movilidad: loteData?.movilidad || "Fija",
    };
    const response = await api.post("/lotes", payload);
    return response.data;
  } catch (error) {
    console.error("Error al crear lote:", error);
    throw error;
  }
};

// Actualizar un Item
export const updateItem = async (itemId, itemData) => {
  try {
    const response = await api.put(`/items/${itemId}`, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar item ${itemId}:`, error);
    throw error;
  }
};

// Actualizar un Lote
export const updateLote = async (loteId, loteData) => {
  try {
    const payload = {
      ...loteData,
      movilidad: loteData?.movilidad || "Fija",
    };
    const response = await api.put(`/lotes/${loteId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar lote ${loteId}:`, error);
    throw error;
  }
};

// Eliminar un Item
export const deleteItem = async (itemId) => {
  try {
    const response = await api.delete(`/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar item ${itemId}:`, error);
    throw error;
  }
};

// Eliminar un Lote
export const deleteLote = async (loteId) => {
  try {
    const response = await api.delete(`/lotes/${loteId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar lote ${loteId}:`, error);
    throw error;
  }
};

// Obtener inventario completo (Items con sus Lotes)
export const getInventarioCompleto = async () => {
  try {
    const items = await getItems();
    const lotes = await getLotes();
    
    // Agrupar lotes por item
    const inventario = items.map(item => ({
      ...item,
      lotes: lotes.filter(lote => lote.itemId._id === item._id || lote.itemId === item._id)
    }));
    
    return inventario;
  } catch (error) {
    console.error("Error al obtener inventario completo:", error);
    throw error;
  }
};

// --- Servicios para la colección Equipos ---

export const getEquipos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.estado) params.append("estado", filtros.estado);
    if (filtros.edificioId) params.append("edificioId", filtros.edificioId);
    if (filtros.laboratorioId) params.append("laboratorioId", filtros.laboratorioId);
    
    const response = await api.get(`/equipo${params.toString() ? "?" + params.toString() : ""}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener equipos:", error);
    throw error;
  }
};

export const getEquipoById = async (equipoId) => {
  try {
    const response = await api.get(`/equipo/${equipoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener equipo ${equipoId}:`, error);
    throw error;
  }
};

export const createEquipo = async (equipoData) => {
  try {
    const response = await api.post("/equipo", equipoData);
    return response.data;
  } catch (error) {
    console.error("Error al crear equipo:", error);
    throw error;
  }
};

export const updateEquipo = async (equipoId, equipoData) => {
  try {
    const response = await api.put(`/equipo/${equipoId}`, equipoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar equipo ${equipoId}:`, error);
    throw error;
  }
};

export const deleteEquipo = async (equipoId) => {
  try {
    const response = await api.delete(`/equipo/${equipoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar equipo ${equipoId}:`, error);
    throw error;
  }
};
