import { useState, useEffect } from "react";
import NuevoPedidoForm from "../components/NuevoPedidoForm";
import EstadoBadge from "../components/EstadoBadge";
import Navbar from "../components/Navbar";
import { PageHeader } from "../components/SharedUi";

const PENDING_STATES = ["Pendiente", "En Revisión"];

// 1. Reconstruimos el Modal adaptado a Mongoose
function Modal({ pedido, onClose, onAprobar, onRechazar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-slate-800 font-semibold text-lg flex items-center gap-2">
            <span className="text-slate-400 font-mono text-sm">#{pedido._id?.slice(-6)}</span>
            {pedido.materia}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none transition-colors">×</button>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
          {[
            ["Docente", pedido.docente], 
            ["Fecha y Hora", `${pedido.fecha} a las ${pedido.hora}`],
            ["Laboratorio", pedido.laboratorio], 
            ["Alumnos", pedido.alumnos],
          ].map(([label, val]) => (
            <div key={label}>
              <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">{label}</span>
              <span className="text-slate-800 font-medium">{val}</span>
            </div>
          ))}
        </div>

        {/* Sección de Recursos pedidos */}
        {pedido.recursos?.length > 0 && (
          <div className="px-6 pb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recursos Solicitados</p>
            <div className="grid grid-cols-1 gap-2">
              {pedido.recursos.map((r, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <div>
                    <p className="text-slate-800 text-sm font-medium">{r.nombre}</p>
                    <p className="text-slate-400 text-xs">{r.tipo}</p>
                  </div>
                  <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">
                    x{r.cantidad}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de acción del modal */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-600 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors">
            Cerrar
          </button>
          {PENDING_STATES.includes(pedido.estado) && (
            <>
              <button onClick={() => onRechazar(pedido._id)} className="px-4 py-2 rounded-xl text-sm text-red-600 bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors">
                Rechazar
              </button>
              <button onClick={() => onAprobar(pedido._id)} className="px-4 py-2 rounded-xl text-sm bg-emerald-500 text-white font-semibold hover:bg-emerald-600 shadow-sm transition-colors">
                Aprobar pedido
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PedidosLaboratorio() {
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("todos");
  const [modalPedido, setModalPedido] = useState(null);
  const [showNuevo, setShowNuevo] = useState(false);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch("http://localhost:3000/pedido");
        if (!res.ok) throw new Error("Error al cargar los pedidos");
        const data = await res.json();
        setPedidos(data);
      } catch (error) {
        console.error("Hubo un problema con la petición:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const pendientes = pedidos.filter((p) => PENDING_STATES.includes(p.estado));
  const lista = tab === "pendientes" ? pendientes : pedidos;

  const actualizarEstadoPedido = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:3000/pedido/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error("Error al actualizar el estado");

      setPedidos((ps) => ps.map((p) => (p._id === id ? { ...p, estado: nuevoEstado } : p)));
      setModalPedido(null);
    } catch (error) {
      console.error("No se pudo actualizar el estado:", error);
    }
  };

  const aprobar = (id) => actualizarEstadoPedido(id, "Aceptado");
  const rechazar = (id) => actualizarEstadoPedido(id, "Rechazado");

  // 2. Ajustamos la creación para que tome los datos reales del nuevo formulario
  const crearPedido = async (datosFormulario) => {
    const payload = {
      materia: datosFormulario.materia, // Ahora toma la materia del formulario
      docente: datosFormulario.docente,
      fecha: datosFormulario.fecha,
      hora: datosFormulario.hora,
      laboratorio: datosFormulario.laboratorio,
      alumnos: datosFormulario.alumnos, 
      estado: "Pendiente", // Por defecto entra como pendiente
      recursos: datosFormulario.recursos, // Enviamos el array de recursos seleccionados
    };

    try {
      const res = await fetch("http://localhost:3000/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al guardar el pedido");
      }

      const pedidoGuardado = await res.json();

      setPedidos((prevPedidos) => [...prevPedidos, pedidoGuardado]);
      setShowNuevo(false); 
    } catch (error) {
      console.error("Falló la creación:", error);
      alert("Hubo un error al crear el pedido. Revisá la consola.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Cargando pedidos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 px-8 py-8">
      <Navbar />
      <PageHeader title="Pedidos" />

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {["todos", "pendientes"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-slate-500 bg-white border border-slate-200 hover:text-emerald-600 hover:border-emerald-200"
            }`}
          >
            {t === "todos" ? (
              "Todos"
            ) : (
              <span className="flex items-center gap-2">
                Pendientes
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
                  {pendientes.length}
                </span>
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => setShowNuevo(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium border border-emerald-200 text-emerald-600 bg-white hover:bg-emerald-50 hover:text-emerald-700 transition-colors ml-1 shadow-sm"
        >
          + Nuevo pedido
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {["ID", "MATERIA", "DOCENTE", "FECHA/HORA", "LAB", "ALUMNOS", "ESTADO", "ACCIONES"].map((col) => (
                <th key={col} className="text-left text-xs font-semibold text-slate-500 tracking-wider px-5 py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((p, i) => (
              <tr key={p._id} className={`border-b border-slate-100 last:border-none hover:bg-emerald-50/50 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                <td className="px-5 py-4 text-slate-500 font-mono text-xs">{p._id?.slice(-6)}</td>
                <td className="px-5 py-4 text-slate-800 font-medium">{p.materia}</td>
                <td className="px-5 py-4 text-slate-600">{p.docente}</td>
                <td className="px-5 py-4 text-slate-600">{p.fecha} {p.hora}</td>
                <td className="px-5 py-4 text-slate-600">{p.laboratorio}</td>
                <td className="px-5 py-4 text-slate-600">{p.alumnos}</td>
                <td className="px-5 py-4"><EstadoBadge estado={p.estado} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModalPedido(p)} className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors shadow-sm">
                      Ver
                    </button>
                    {PENDING_STATES.includes(p.estado) && (
                      <>
                        <button onClick={() => aprobar(p._id)} className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500 text-white font-semibold hover:bg-emerald-600 shadow-sm transition-colors">
                          Aprobar
                        </button>
                        <button onClick={() => rechazar(p._id)} className="px-3 py-1.5 rounded-lg text-xs bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm transition-colors">
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalPedido && (
        <Modal pedido={modalPedido} onClose={() => setModalPedido(null)} onAprobar={aprobar} onRechazar={rechazar} />
      )}

      {showNuevo && (
        <NuevoPedidoForm onClose={() => setShowNuevo(false)} onCrear={crearPedido} />
      )}
    </div>
  );
}