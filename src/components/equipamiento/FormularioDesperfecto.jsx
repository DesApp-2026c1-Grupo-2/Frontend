import { MdOutlineArrowCircleDown } from "react-icons/md";

export default function FormularioDesperfecto({
  desperfectoItem,
  desperfectoForm,
  handleChange,
  handleSubmit,
  cerrarModal,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* EQUIPO (Solo lectura) */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Equipo
        </label>
        <input
          type="text"
          readOnly
          value={desperfectoItem ? `[ ${desperfectoItem.tipo} ]` : ""}
          className="
            w-full px-4 py-3 rounded-xl
            border border-slate-200
            bg-slate-50 text-slate-700
            font-medium cursor-not-allowed
            outline-none select-none
          "
        />
      </div>

      {/* RESERVA ASOCIADA */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Reserva asociada
        </label>
        <select
          name="reservaId"
          value={desperfectoForm.reservaId || ""}
          onChange={handleChange}
          className="
            w-full px-4 py-3 rounded-xl
            border border-slate-200
            bg-white text-slate-800
            focus:outline-none
            focus:ring-2 focus:ring-emerald-200
            focus:border-emerald-300
            transition
          "
        >
          <option value="">[ Seleccionar reserva ] </option> <MdOutlineArrowCircleDown /> 
          <option value="res-1">Reserva #4012 - Laboratorio A</option>
          <option value="res-2">Reserva #4592 - Clase práctica de Física</option>
        </select>
      </div>

      {/* FECHA */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Fecha
        </label>
        <input
          type="date"
          name="fecha"
          value={desperfectoForm.fecha || ""}
          onChange={handleChange}
          required
          className="
            w-full px-4 py-3 rounded-xl
            border border-slate-200
            bg-white text-slate-800
            focus:outline-none
            focus:ring-2 focus:ring-emerald-200
            focus:border-emerald-300
            transition
          "
        />
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Descripción
        </label>
        <textarea
          name="descripcion"
          value={desperfectoForm.descripcion || ""}
          onChange={handleChange}
          placeholder="Escribir detalle del desperfecto..."
          rows="4"
          required
          className="
            w-full px-4 py-3 rounded-xl
            border border-slate-200
            bg-white text-slate-800
            placeholder-slate-400
            focus:outline-none
            focus:ring-2 focus:ring-emerald-200
            focus:border-emerald-300
            transition resize-none
          "
        />
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-3 pt-2">
        
        <button
          type="button"
          onClick={cerrarModal}
          className="
            px-4 py-2 rounded-xl text-sm
            border border-slate-200
            text-slate-600 bg-white
            hover:bg-slate-50 hover:border-slate-300
            transition
          "
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="
            px-6 py-2 rounded-xl text-sm
            bg-emerald-500 text-white font-bold
            hover:bg-emerald-600 transition-all
            shadow-md shadow-emerald-200
          "
        >
          Guardar
        </button>

      </div>

    </form>
  );
}