import { useState } from "react";
import NuevoPedidoForm from "../components/NuevoPedidoForm";
import { PEDIDOS, PENDING_STATES } from '../data/pedidos';
import EstadoBadge from '../components/EstadoBadge'
import Navbar from "../components/Navbar";
import { PageHeader } from "../components/SharedUi";

function Modal({ pedido, onClose, onAprobar, onRechazar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h2 className="text-slate-800 font-semibold text-lg">{pedido.id} — {pedido.docente}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none transition-colors">×</button>
        </div>

        <div className="px-6 py-4 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          {[
            ["Docente", pedido.docente], ["Fecha", `${pedido.fecha}/2026 ${pedido.hora}`],
            ["Laboratorio", pedido.laboratorio], ["Alumnos", pedido.alumnos],
            ["Duración", pedido.duracion], ["Actividad", pedido.actividad],
          ].map(([label, val]) => (
            <div key={label}>
              <span className="text-slate-500">{label}: </span>
              <span className="text-slate-800 font-medium">{val}</span>
            </div>
          ))}
        </div>

        {pedido.conflictos?.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Conflictos detectados</p>
            {pedido.conflictos.map((c, i) => (
              <div key={i} className="flex gap-3 bg-red-50 border border-red-200 rounded-xl p-3 mb-2 last:mb-0">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-slate-800 text-sm font-medium">{c.equipo} — {c.motivo}</p>
                  <p className="text-slate-500 text-xs mt-0.5">Alternativa disponible: {c.alternativa}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-6 pb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Historial de modificaciones</p>
          <div className="space-y-2">
            {pedido.historial?.map((h, i) => (
              <div key={i} className="flex gap-2 text-sm border-t border-slate-100 pt-2">
                <span className="text-slate-400 shrink-0">{h.fecha} {h.hora} —</span>
                <span className="text-slate-700">{h.accion}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-600 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors">
            Cerrar
          </button>
          {PENDING_STATES.includes(pedido.estado) && (
            <>
              <button onClick={() => onRechazar(pedido.id)} className="px-4 py-2 rounded-xl text-sm text-red-600 bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors">
                Rechazar
              </button>
              <button onClick={() => onAprobar(pedido.id)} className="px-4 py-2 rounded-xl text-sm bg-emerald-500 text-white font-semibold hover:bg-emerald-600 shadow-sm transition-colors">
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
  const [pedidos, setPedidos] = useState(PEDIDOS);
  const [tab, setTab] = useState("todos");
  const [modalPedido, setModalPedido] = useState(null);
  const [showNuevo, setShowNuevo] = useState(false);

  const pendientes = pedidos.filter(p => PENDING_STATES.includes(p.estado));
  const lista = tab === "pendientes" ? pendientes : pedidos;

  const aprobar = (id) => {
    setPedidos(ps => ps.map(p => p.id === id ? { ...p, estado: "Aceptado" } : p));
    setModalPedido(null);
  };
  
  const rechazar = (id) => {
    setPedidos(ps => ps.map(p => p.id === id ? { ...p, estado: "Rechazado" } : p));
    setModalPedido(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 px-8 py-8">
      <Navbar />
      <PageHeader title="Pedidos" />
      
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {["todos","pendientes"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "text-slate-500 bg-white border border-slate-200 hover:text-emerald-600 hover:border-emerald-200"
            }`}>
            {t === "todos" ? "Todos" : (
              <span className="flex items-center gap-2">
                Pendientes
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
                  {pendientes.length}
                </span>
              </span>
            )}
          </button>
        ))}
        <button onClick={() => setShowNuevo(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium border border-emerald-200 text-emerald-600 bg-white hover:bg-emerald-50 hover:text-emerald-700 transition-colors ml-1 shadow-sm">
          + Nuevo pedido
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {["ID","DOCENTE","FECHA/HORA","LAB","ALUMNOS","ESTADO","ACCIONES"].map(col => (
                <th key={col} className="text-left text-xs font-semibold text-slate-500 tracking-wider px-5 py-3">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((p, i) => (
              <tr key={p.id} className={`border-b border-slate-100 last:border-none hover:bg-emerald-50/50 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                <td className="px-5 py-4 text-slate-500 font-mono text-xs">{p.id}</td>
                <td className="px-5 py-4 text-slate-800 font-medium">{p.docente}</td>
                <td className="px-5 py-4 text-slate-600">{p.fecha} {p.hora}</td>
                <td className="px-5 py-4 text-slate-600">{p.lab}</td>
                <td className="px-5 py-4 text-slate-600">{p.alumnos}</td>
                <td className="px-5 py-4"><EstadoBadge estado={p.estado} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModalPedido(p)}
                      className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors shadow-sm">
                      Ver
                    </button>
                    {PENDING_STATES.includes(p.estado) && (
                      <>
                        <button onClick={() => aprobar(p.id)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500 text-white font-semibold hover:bg-emerald-600 shadow-sm transition-colors">
                          Aprobar
                        </button>
                        <button onClick={() => rechazar(p.id)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm transition-colors">
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
        <Modal
          pedido={modalPedido}
          onClose={() => setModalPedido(null)}
          onAprobar={aprobar}
          onRechazar={rechazar}
        />
      )}

      {showNuevo && (
        <NuevoPedidoForm 
          onClose={() => setShowNuevo(false)} 
          onCrear={(nuevoPedido) => {
            console.log("Creando pedido:", nuevoPedido);
          }} 
        />
      )}
    </div>
  );
}