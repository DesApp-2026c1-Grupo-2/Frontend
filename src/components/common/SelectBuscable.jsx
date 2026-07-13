import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";

// Combobox con búsqueda. La lista de opciones se renderiza EN FLUJO (no
// `absolute`) para no quedar recortada por ancestros con `overflow-hidden`
// (p. ej. el <Card> de Historial) y comportarse bien en mobile. El ancho se
// adapta: `w-full` en mobile y `sm:w-72` en escritorio.
//
// Props:
//   value            valor seleccionado (o "")
//   onChange(value)  callback al elegir/limpiar
//   options          [{ value, label }]
//   placeholder      texto cuando no hay selección
//   buscarPlaceholder texto del input de búsqueda
function SelectBuscable({
  value,
  onChange,
  options = [],
  placeholder = "Seleccioná una opción…",
  buscarPlaceholder = "Buscar…",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  const seleccionada = options.find((o) => o.value === value);

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const cerrar = () => {
    setOpen(false);
    setQuery("");
  };

  // Cerrar al hacer clic fuera o presionar Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) cerrar();
    };
    const onKey = (e) => {
      if (e.key === "Escape") cerrar();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const elegir = (val) => {
    onChange(val);
    cerrar();
  };

  return (
    <div ref={ref} className="relative w-full sm:w-72">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
      >
        <span className={`min-w-0 truncate text-left ${seleccionada ? "text-slate-800" : "text-slate-400"}`}>
          {seleccionada ? seleccionada.label : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {seleccionada && (
            <FiX
              className="h-4 w-4 text-slate-400 transition hover:text-slate-600"
              role="button"
              aria-label="Limpiar selección"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                cerrar();
              }}
            />
          )}
          <FiChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <div className="z-30 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 p-2">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-amber-100">
              <FiSearch className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={buscarPlaceholder}
                className="w-full min-w-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <ul className="max-h-56 overflow-auto py-1">
            {filtradas.length > 0 ? (
              filtradas.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => elegir(o.value)}
                    className={`block w-full truncate px-3 py-2 text-left text-sm transition ${
                      o.value === value
                        ? "bg-amber-50 font-semibold text-amber-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-center text-sm text-slate-400">Sin resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SelectBuscable;
