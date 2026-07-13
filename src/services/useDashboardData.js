import { useState, useEffect } from "react";
import api from "../api/axios";
import { getAllItems, getAllEquipos, getEstadisticasUso } from "./equipamiento";

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/pedido")
      .then((res) => setPedidos(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { pedidos, loading, error };
};

export const useEquipamiento = () => {
  const [equipamiento, setEquipamiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // GET /equipo ahora es paginado; getAllEquipos recorre las páginas y
    // devuelve el array completo de equipos.
    getAllEquipos()
      .then((equipos) => setEquipamiento(equipos))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { equipamiento, loading, error };
};

// Ranking de equipos más usados en el período (día/semana/mes) para la card
// "Uso de equipos" del Dashboard. Recarga al cambiar `periodo`. Pide limit=100
// en una sola llamada para cubrir el inventario real (convención de getAllEquipos).
// `enabled: false` desactiva la consulta (útil para no duplicar un fetch cuando
// otra instancia del hook ya trae ese mismo período).
export const useUsoEquipos = (periodo = "semana", { enabled = true } = {}) => {
  const [estadisticas, setEstadisticas] = useState({
    equipos: [],
    desde: null,
    hasta: null,
    paginacion: {},
  });
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      if (!enabled) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getEstadisticasUso({ periodo, limit: 100 });
        if (cancelado) return;
        setEstadisticas({
          equipos: data.equipos ?? [],
          desde: data.desde ?? null,
          hasta: data.hasta ?? null,
          paginacion: data.paginacion ?? {},
        });
      } catch (err) {
        if (!cancelado) setError(err);
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [periodo, enabled]);

  return { estadisticas, loading, error };
};

export const useMateriales = () => {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Solo materiales, igual que el panel "Alertas de inventario" de la página
    // de equipamiento. El backend ya calcula el stock disponible por ítem
    // (stockDisponible); no hace falta cruzar con /lotes ni sumar en memoria.
    getAllItems({ tipo: "material" })
      .then((items) => {
        setMateriales(items.map((item) => ({ ...item, stock: item.stockDisponible ?? 0 })));
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { materiales, loading, error };
};
