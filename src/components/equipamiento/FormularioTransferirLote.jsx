import { useEffect, useState } from "react";
import CustomSelect from "../common/CustomSelect";
import { obtenerEdificios } from "../../services/edificioService";
import { obtenerLaboratoriosPorEdificio } from "../../services/laboratorioService";

// Formulario para MOVER un lote entre el depósito y los laboratorios
// (POST /lotes/:id/transferir). Es auto-contenido: gestiona la cascada
// Edificio → Laboratorio y arma el payload; el padre solo recibe `onSubmit`.
//
// Modos de destino:
//  - "laboratorio": traslada el lote a un laboratorio (requiere elegir lab).
//  - "deposito": devuelve el lote al depósito (laboratorioDestinoId = null).
// La cantidad es opcional: vacía = mueve el lote completo; un valor menor a la
// cantidad disponible hace un traslado PARCIAL (el backend hace split).
export default function FormularioTransferirLote({
  lote,
  onSubmit,
  cerrarModal,
  enviando = false,
}) {
  const cantidadDisponible = lote?.cantidad ?? 0;
  const enDeposito = !lote?.laboratorioId; // el lote ya está en el depósito

  // Por defecto: si está en el depósito, el destino natural es un laboratorio;
  // si está en un laboratorio, ofrecer devolverlo al depósito.
  const [modo, setModo] = useState(enDeposito ? "laboratorio" : "deposito");
  const [edificioId, setEdificioId] = useState("");
  const [laboratorioId, setLaboratorioId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [observacion, setObservacion] = useState("");

  const [edificios, setEdificios] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [loadingEdificios, setLoadingEdificios] = useState(false);
  const [loadingLaboratorios, setLoadingLaboratorios] = useState(false);
  const [errorUbicaciones, setErrorUbicaciones] = useState("");
  const [errores, setErrores] = useState({});

  // Cargar edificios una sola vez cuando el modo es "laboratorio".
  useEffect(() => {
    if (modo !== "laboratorio" || edificios.length > 0) return;
    let cancelado = false;
    const cargar = async () => {
      try {
        setLoadingEdificios(true);
        setErrorUbicaciones("");
        const data = await obtenerEdificios();
        if (!cancelado) setEdificios((data || []).filter((e) => e.estado !== false));
      } catch (err) {
        console.error("Error al cargar edificios:", err);
        if (!cancelado) setErrorUbicaciones("No se pudieron cargar los edificios.");
      } finally {
        if (!cancelado) setLoadingEdificios(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [modo, edificios.length]);

  // Cargar laboratorios del edificio seleccionado.
  useEffect(() => {
    if (!edificioId) return;
    let cancelado = false;
    const cargar = async () => {
      try {
        setLoadingLaboratorios(true);
        setErrorUbicaciones("");
        const data = await obtenerLaboratoriosPorEdificio(edificioId);
        if (!cancelado) setLaboratorios((data || []).filter((l) => l.estado !== "eliminado"));
      } catch (err) {
        console.error("Error al cargar laboratorios:", err);
        if (!cancelado) setErrorUbicaciones("No se pudieron cargar los laboratorios de ese edificio.");
      } finally {
        if (!cancelado) setLoadingLaboratorios(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [edificioId]);

  const cambiarEdificio = (v) => {
    setEdificioId(v);
    setLaboratorioId("");
    if (!v) setLaboratorios([]);
  };

  const inputClass = (campo) =>
    `w-full px-3 py-2 rounded-lg border bg-white text-slate-800 focus:outline-none focus:ring-2 transition ${
      errores[campo]
        ? "border-red-400 focus:ring-red-100 focus:border-red-400"
        : "border-slate-200 focus:ring-emerald-200 focus:border-emerald-300"
    }`;

  const validar = () => {
    const errs = {};
    if (modo === "laboratorio") {
      if (!laboratorioId) errs.laboratorioId = "Elegí un laboratorio destino.";
      else if (laboratorioId === lote?.laboratorioId)
        errs.laboratorioId = "El lote ya está en ese laboratorio.";
    }
    if (cantidad !== "") {
      const n = Number(cantidad);
      if (!Number.isInteger(n) || n <= 0) errs.cantidad = "Ingresá un entero mayor a 0.";
      else if (n > cantidadDisponible)
        errs.cantidad = `No puede superar la cantidad disponible (${cantidadDisponible}).`;
    }
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validar()) return;
    onSubmit({
      laboratorioDestinoId: modo === "deposito" ? null : laboratorioId,
      cantidad: cantidad !== "" ? Number(cantidad) : undefined,
      observacion: observacion.trim() || undefined,
    });
  };

  // Si el lote ya está en el depósito, devolverlo no es un destino posible: se
  // omite la opción en vez de mostrarla deshabilitada.
  const opcionesDestino = [
    { value: "laboratorio", label: "Trasladar a un laboratorio" },
    ...(enDeposito ? [] : [{ value: "deposito", label: "Devolver al depósito" }]),
  ];

  return (
    <form onSubmit={submit} className="space-y-4 px-3 py-3">
      {/* LOTE Y UBICACIÓN ACTUAL (solo lectura) */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Ubicación actual
        </label>
        <input
          type="text"
          readOnly
          value={`${lote?.ubicacionLote || "Depósito"} · ${cantidadDisponible} disponible${cantidadDisponible === 1 ? "" : "s"}`}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium cursor-not-allowed outline-none select-none"
        />
      </div>

      {/* DESTINO */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Destino
        </label>
        <CustomSelect
          name="modo"
          value={modo}
          onChange={(e) => {
            setModo(e.target.value);
            setErrores({});
          }}
          options={opcionesDestino}
        />
      </div>

      {/* CASCADA EDIFICIO → LABORATORIO */}
      {modo === "laboratorio" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
          {errorUbicaciones && (
            <p className="sm:col-span-2 text-red-500 text-xs">{errorUbicaciones}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Edificio
            </label>
            <CustomSelect
              name="edificioId"
              value={edificioId}
              onChange={(e) => cambiarEdificio(e.target.value)}
              disabled={loadingEdificios}
              placeholder={loadingEdificios ? "Cargando edificios..." : "Seleccionar edificio"}
              options={edificios.map((edificio) => ({
                value: edificio.id || edificio._id,
                label: edificio.nombre,
              }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Laboratorio
            </label>
            <CustomSelect
              name="laboratorioId"
              value={laboratorioId}
              onChange={(e) => setLaboratorioId(e.target.value)}
              disabled={!edificioId || loadingLaboratorios}
              error={!!errores.laboratorioId}
              placeholder={
                !edificioId
                  ? "Elegí un edificio primero"
                  : loadingLaboratorios
                  ? "Cargando laboratorios..."
                  : "Seleccionar laboratorio"
              }
              options={laboratorios.map((lab) => ({
                value: lab.id || lab._id,
                label: `${lab.nombre} · ${lab.tipo} (cap. ${lab.capacidad})`,
              }))}
            />
            {errores.laboratorioId && (
              <p className="text-red-500 text-xs mt-1">{errores.laboratorioId}</p>
            )}
          </div>
        </div>
      )}

      {/* CANTIDAD (opcional, traslado parcial) */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Cantidad <span className="text-slate-400 normal-case">(opcional, vacío = lote completo)</span>
        </label>
        <input
          type="number"
          name="cantidad"
          min="1"
          max={cantidadDisponible}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder={`Máximo ${cantidadDisponible}`}
          className={inputClass("cantidad")}
        />
        {errores.cantidad && <p className="text-red-500 text-xs mt-1">{errores.cantidad}</p>}
      </div>

      {/* OBSERVACIÓN (opcional) */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Observación <span className="text-slate-400 normal-case">(opcional)</span>
        </label>
        <textarea
          name="observacion"
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          rows="2"
          maxLength={500}
          placeholder="Motivo o detalle del traslado..."
          className={`${inputClass("observacion")} resize-none`}
        />
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={cerrarModal}
          disabled={enviando}
          className="px-4 py-2 rounded-lg text-sm border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="px-5 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm transition disabled:opacity-50"
        >
          {enviando ? "Moviendo..." : "Mover lote"}
        </button>
      </div>
    </form>
  );
}
