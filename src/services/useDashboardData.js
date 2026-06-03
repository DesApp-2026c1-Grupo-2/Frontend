import { useState, useEffect } from "react";
import api from "../api/axios";

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
    api.get("/equipo")
      .then((res) => setEquipamiento(res.data))
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
    // Se consultan ambos endpoints para cruzar Ítems con su Stock en Lotes
    Promise.all([
      api.get("/items"),
      api.get("/lotes")
    ])
      .then(([resItems, resLotes]) => {
        const items = resItems.data;
        const lotes = resLotes.data;

        const inventario = items.map(item => {
          const lotesDelItem = lotes.filter(lote => 
            (lote.itemId?._id || lote.itemId) === item._id && lote.estado === "disponible"
          );
          const stockDisponible = lotesDelItem.reduce((acc, lote) => acc + (lote.cantidadDisponible || 0), 0);
          return { ...item, stock: stockDisponible };
        });
        
        setMateriales(inventario);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { materiales, loading, error };
};
