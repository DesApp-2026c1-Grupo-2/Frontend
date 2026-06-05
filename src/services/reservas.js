import api from "../api/axios";

// Servicio para interactuar con los endpoints de reservas
export const getReservasActivas = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    // Consumiendo la ruta enviando los query params
    const response = await api.get(`/reservas/activas?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener reservas activas:", error);
    throw error;
  }
};