import { FiAlertTriangle, FiX, FiRepeat } from "react-icons/fi";

/**
 * Formulario inline para finalizar un pedido.
 *
 * Es solo presentación: el fetch de la reserva, el estado y el submit viven en la
 * página. Tiene dos bloques con fuentes distintas a propósito:
 *   - Consumo real: lo dirige la reserva (GET /reservas/pedido/:id), que es la única
 *     fuente válida de los itemId que el backend exige. No usar pedido.recursos acá.
 *   - Descartes y desperfectos: los dirige pedido.recursos.
 *
 * Props:
 *   consumosRequeridos – materiales de la reserva con requiereConsumo: true
 *   consumosForm       – { [itemId]: string } cantidades tipeadas (string, ver página)
 *   erroresConsumo     – { [itemId]: string } error por input
 *   onChangeConsumo    – fn(itemId, valor)
 *   cargandoReserva / errorReserva / onReintentarReserva – estado del fetch
 *   recursosFinalizacion / formFinalizacion / onChangeRecurso – descartes y desperfectos
 *   errorFinalizacion / onCerrarError – error del PATCH
 *   bloqueado          – deshabilita confirmar (cargando, error o consumos sin completar)
 *   onConfirmar / onVolver – acciones del pie
 */
export default function FinalizarPedidoForm({
  consumosRequeridos,
  consumosForm,
  erroresConsumo,
  onChangeConsumo,
  cargandoReserva,
  errorReserva,
  onReintentarReserva,
  recursosFinalizacion,
  formFinalizacion,
  onChangeRecurso,
  errorFinalizacion,
  onCerrarError,
  bloqueado,
  onConfirmar,
  onVolver,
}) {
  return (
    <div className="border border-blue-300 bg-blue-50 rounded-xl p-4 space-y-4">
      <p className="text-sm font-semibold text-blue-800">Finalizar pedido: reportá consumo real, descartes y desperfectos</p>
      <p className="text-xs text-blue-700">Los reutilizables vuelven al stock solos. De los consumibles que ya salieron del inventario tenés que reportar cuánto se usó.</p>

      {errorFinalizacion && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg flex justify-between items-start">
          <span className="flex items-center gap-2"><strong className="flex items-center gap-1"><FiAlertTriangle /> Error:</strong> {errorFinalizacion}</span>
          <button onClick={onCerrarError} className="ml-4 text-red-400 hover:text-red-600 font-bold text-lg"><FiX /></button>
        </div>
      )}

      {/* CONSUMO REAL: lo dirige la reserva, no pedido.recursos */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-blue-700">Consumo real (obligatorio)</p>

        {cargandoReserva && (
          <p className="text-xs text-slate-500">Cargando el detalle de la reserva...</p>
        )}

        {errorReserva && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
            <p className="text-xs text-red-600">{errorReserva}</p>
            <button onClick={onReintentarReserva} className="px-3 py-1 border border-red-300 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold">Reintentar</button>
          </div>
        )}

        {!cargandoReserva && !errorReserva && consumosRequeridos.length === 0 && (
          <p className="text-xs text-slate-500 italic">No hay consumibles pendientes de reportar.</p>
        )}

        {!cargandoReserva && !errorReserva && consumosRequeridos.map((material) => (
          <div key={material.itemId} className="rounded-lg border border-blue-200 bg-white p-3 space-y-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">{material.nombre}</p>
              <p className="text-xs text-slate-500">Reservado: {material.cantidadTotal}</p>
            </div>
            <input
              type="number"
              min="0"
              max={material.cantidadPendiente}
              value={consumosForm[material.itemId] ?? ""}
              onChange={(e) => onChangeConsumo(material.itemId, e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder={`Consumido de ${material.cantidadPendiente}`}
              aria-label={`Cantidad consumida de ${material.nombre}`}
            />
            {erroresConsumo[material.itemId] ? (
              <p className="text-xs text-red-600">{erroresConsumo[material.itemId]}</p>
            ) : (
              <p className="text-xs text-slate-500">Lo no consumido vuelve al stock. Poné 0 si no se usó nada.</p>
            )}
          </div>
        ))}
      </div>

      {/* DESCARTES Y DESPERFECTOS: los dirige pedido.recursos */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-blue-700">Descartes y desperfectos (opcional)</p>
        <div className="space-y-3">
          {recursosFinalizacion.map((recurso) => {
            const recursoForm = formFinalizacion.recursos.find((entry) => entry.recursoId === recurso.recursoId) || recurso;
            const esEquipo = recurso.tipo === "Equipo";
            const esConsumible = !esEquipo && (recurso.esConsumible ?? true);

            return (
              <div key={recurso.recursoId} className="rounded-lg border border-blue-200 bg-white p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{recurso.nombre}</p>
                    <p className="text-xs text-slate-500">Solicitado: {recurso.cantidadSolicitada} · {recurso.tipoDetalle}</p>
                  </div>
                  <span className="text-xs font-medium text-blue-700">{esEquipo ? "Equipo" : "Inventario"}</span>
                </div>

                {!esEquipo && !esConsumible && (
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!recursoForm.registrarDescarte}
                      onChange={(e) => onChangeRecurso(recurso.recursoId, { registrarDescarte: e.target.checked, cantidadDescartada: e.target.checked ? recurso.cantidadSolicitada : 0 })}
                    />
                    Registrar descarte
                  </label>
                )}

                {esEquipo ? (
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!recursoForm.registrarDefecto}
                      onChange={(e) => onChangeRecurso(recurso.recursoId, { registrarDefecto: e.target.checked, motivoDefecto: e.target.checked ? recursoForm.motivoDefecto || "" : "" })}
                    />
                    Marcar como desperfecto
                  </label>
                ) : recursoForm.registrarDescarte ? (
                  <>
                    <input
                      type="number"
                      min="1"
                      max={recurso.cantidadSolicitada}
                      value={recursoForm.cantidadDescartada === undefined ? "" : recursoForm.cantidadDescartada}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChangeRecurso(recurso.recursoId, {
                          cantidadDescartada: val === "" ? "" : Number(val)
                        });
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Cantidad descartada"
                    />
                    <input
                      type="text"
                      value={recursoForm.motivo || ""}
                      onChange={(e) => onChangeRecurso(recurso.recursoId, { motivo: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Motivo"
                    />
                  </>
                ) : null}

                {esEquipo && recursoForm.registrarDefecto ? (
                  <input
                    type="text"
                    value={recursoForm.motivoDefecto || ""}
                    onChange={(e) => onChangeRecurso(recurso.recursoId, { motivoDefecto: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Motivo del desperfecto"
                  />
                ) : null}

                {esConsumible && (
                  <p className="text-xs text-slate-500 italic">Consumible — el consumo se reporta arriba.</p>
                )}

                {!esEquipo && !esConsumible && (
                  <p className="text-xs text-slate-500 italic flex items-center gap-1"><FiRepeat /> Reutilizable — vuelve al stock al finalizar.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onConfirmar}
          disabled={bloqueado}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold"
        >
          Confirmar Finalización
        </button>
        <button onClick={onVolver} className="flex-1 px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-semibold">Volver</button>
      </div>
    </div>
  );
}
