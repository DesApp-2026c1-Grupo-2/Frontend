import { useState, useEffect } from "react";
import api from "../api/axios";
import { getAllItems, getAllEquipos } from "./equipamiento";

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

export const useMateriales = () => {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // El backend ya calcula el stock disponible por ítem (stockDisponible); no
    // hace falta cruzar con /lotes ni sumar en memoria.
    getAllItems()
      .then((items) => {
        setMateriales(items.map((item) => ({ ...item, stock: item.stockDisponible ?? 0 })));
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { materiales, loading, error };
};
