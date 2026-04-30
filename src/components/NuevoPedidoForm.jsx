import { useState } from "react";
import { STEPS, LABS, ACTIVIDADES } from '../data/pedidos';

export default function NuevoPedidoForm({ onClose, onCrear }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    docente: "", alumnos: "", fecha: "", hora: "10:00",
    duracion: "2 horas", lab: "", actividad: "", observaciones: "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCrear = () => {
    onCrear(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl shadow-xl">
        <div className="px-8 pt-6 pb-4">
          
          {/* Stepper */}
          <div className="flex items-center mb-8">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
                    ${i < step ? "bg-emerald-500 border-emerald-500 text-white" : i === step ? "border-emerald-500 text-emerald-600" : "border-zinc-200 text-zinc-400"}`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${i <= step ? "text-emerald-600" : "text-zinc-400"}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full ${i < step ? "bg-emerald-500" : "bg-zinc-100"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 0: Datos */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              {[["Docente solicitante","docente","text","Dr. Herrera"],["Cantidad de alumnos","alumnos","number","28"]].map(([label,key,type,ph]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-zinc-600 mb-1">{label}</label>
                  <input type={type} placeholder={ph} value={form[key]} onChange={set(key)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-zinc-400" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Fecha</label>
                <input type="date" value={form.fecha} onChange={set("fecha")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Hora de inicio</label>
                <input type="time" value={form.hora} onChange={set("hora")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Duración</label>
                <select value={form.duracion} onChange={set("duracion")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all">
                  {["1 hora","2 horas","3 horas","4 horas"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Laboratorio (opcional)</label>
                <select value={form.lab} onChange={set("lab")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all">
                  <option value="">Sin preferencia</option>
                  {LABS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-600 mb-1">Actividad tipo</label>
                <select value={form.actividad} onChange={set("actividad")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all">
                  <option value="">Seleccionar actividad...</option>
                  {ACTIVIDADES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-600 mb-1">Observaciones</label>
                <textarea rows={3} value={form.observaciones} onChange={set("observaciones")}
                  placeholder="Notas adicionales..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 resize-none transition-all placeholder:text-zinc-400" />
              </div>
            </div>
          )}

          {/* Step 1: Recursos */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-zinc-500 text-sm italic">Recursos sugeridos para <span className="text-emerald-600 font-semibold">{form.actividad || "la actividad"}</span>:</p>
              {["Tubos eppendorf × 60","Buffer de lisis × 500 ml","Micropipetas P200 × 4","Espectrofotómetro UV (EQ-004)","Centrífuga de mesa × 2"].map((r, i) => (
                <label key={i} className="flex items-center gap-3 bg-white hover:bg-emerald-50 rounded-xl px-4 py-3 cursor-pointer border border-zinc-200 hover:border-emerald-200 transition-colors group">
                  <input type="checkbox" defaultChecked className="accent-emerald-500 w-4 h-4" />
                  <span className="text-zinc-700 text-sm font-medium group-hover:text-emerald-800">{r}</span>
                </label>
              ))}
            </div>
          )}

          {/* Step 2: Revisión */}
          {step === 2 && (
            <div className="space-y-1 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
              <p className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-4">Resumen del pedido</p>
              {[
                ["Docente", form.docente || "—"],["Alumnos", form.alumnos || "—"],
                ["Fecha y hora", form.fecha ? `${form.fecha} ${form.hora}` : "—"],
                ["Duración", form.duracion],["Laboratorio", form.lab || "Sin preferencia"],
                ["Actividad", form.actividad || "—"],["Observaciones", form.observaciones || "Sin observaciones"],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between border-b border-zinc-200/60 py-2 last:border-0">
                  <span className="text-zinc-500 text-sm">{k}</span>
                  <span className="text-zinc-800 font-semibold text-sm text-right max-w-[200px]">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Envío */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-white shadow-sm flex items-center justify-center text-emerald-600 text-3xl">✓</div>
              <p className="text-zinc-800 font-bold text-xl">¡Pedido enviado!</p>
              <p className="text-zinc-500 text-sm text-center max-w-xs">Tu solicitud ha sido registrada y será revisada por el equipo técnico a la brevedad.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between px-8 py-5 border-t border-zinc-100 bg-zinc-50/50 rounded-b-2xl">
          <button onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
            className="px-5 py-2 rounded-xl text-sm font-medium text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 hover:text-zinc-800 transition-all shadow-sm">
            {step === 0 ? "Cancelar" : "Anterior"}
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-6 py-2 rounded-xl text-sm bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200">
              Siguiente
            </button>
          ) : (
            <button onClick={handleCrear}
              className="px-6 py-2 rounded-xl text-sm bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200">
              Cerrar y Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}