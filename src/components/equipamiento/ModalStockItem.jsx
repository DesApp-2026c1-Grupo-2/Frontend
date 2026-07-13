import { useEffect, useState } from "react";
import { getStockItem } from "../../services/equipamiento";
import { formatDate } from "../../utils/inventarioMapper";

// Vista de stock de un ítem por ventana temporal (GET /items/:id/stock).
// Muestra la distinción clave del nuevo modelo:
//  - `disponible`: lo RESERVABLE en la ventana (autoritativo para reservar).
//  - `total`: stock físico PRESENTE ahora (baja mientras hay stock "en uso").
//  - `enUso` / `aceptado`: reservas En Curso / Pendiente que pesan sobre la ventana.
export default function ModalStockItem({ group }) {
  const itemId = group?.itemId;
  const unidad = group?.unidad || "";
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!itemId) return;
    let cancelado = false;
    const cargar = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getStockItem(itemId);
        if (!cancelado) setStock(data);
      } catch (err) {
        console.error("Error al obtener stock del item:", err);
        if (!cancelado) setError(err.response?.data?.error || "No se pudo obtener el stock.");
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [itemId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500"></div>
          <p className="text-sm text-slate-500">Cargando stock...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <p className="text-sm font-medium text-rose-700">{error}</p>
      </div>
    );
  }

  const aceptado = stock?.aceptado || [];
  const enUso = stock?.enUso || [];

  const Reserva = ({ r }) => (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-700">Pedido {r.pedidoId || "—"}</p>
        <p className="text-xs text-slate-400">
          {formatDate(r.fechaInicioReal)} → {formatDate(r.fechaFinReal)}
        </p>
      </div>
      <span className="shrink-0 text-sm font-semibold text-slate-900">{r.cantidad} {unidad}</span>
    </li>
  );

  return (
    <div className="space-y-5">
      {/* Ventana consultada */}
      {stock?.desde && stock?.hasta && (
        <p className="text-xs text-slate-400">
          Ventana: {formatDate(stock.desde)} → {formatDate(stock.hasta)}
        </p>
      )}

      {/* Valores principales */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-indigo-500">Disponible para reservar</span>
          <span className="mt-1 block text-2xl font-bold text-indigo-700">{stock?.disponible ?? "—"} {unidad}</span>
          <span className="mt-1 block text-xs text-indigo-500/80">Valor autoritativo en esta ventana.</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Stock físico presente</span>
          <span className="mt-1 block text-2xl font-bold text-slate-800">{stock?.total ?? "—"} {unidad}</span>
          <span className="mt-1 block text-xs text-slate-400">Baja mientras hay stock en uso; vuelve al finalizar.</span>
        </div>
      </div>

      {/* En uso (reservas En Curso que solapan) */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          En uso ({enUso.length})
        </h3>
        {enUso.length > 0 ? (
          <ul className="space-y-2">
            {enUso.map((r, i) => (
              <Reserva key={r.pedidoId || i} r={r} />
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-400">
            Nada en uso en esta ventana.
          </p>
        )}
      </div>

      {/* Aceptado (reservas Pendiente que pesan sobre la ventana) */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Reservado / pendiente ({aceptado.length})
        </h3>
        {aceptado.length > 0 ? (
          <ul className="space-y-2">
            {aceptado.map((r, i) => (
              <Reserva key={r.pedidoId || i} r={r} />
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-400">
            Sin reservas pendientes en esta ventana.
          </p>
        )}
      </div>
    </div>
  );
}
