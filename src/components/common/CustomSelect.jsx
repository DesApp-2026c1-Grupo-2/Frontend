import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

/**
 * Dropdown custom para reemplazar el <select> nativo del navegador.
 *
 * Por qué existe: el <select> nativo delega el renderizado del popup de
 * opciones al sistema operativo / navegador. Eso hace que en algunos
 * contextos (emulación de DevTools, ciertos navegadores mobile) el popup
 * se dibuje con estilos default o incluso se salga del viewport simulado.
 * Este componente dibuja las opciones nosotros mismos con Tailwind, así el
 * comportamiento es idéntico en cualquier dispositivo/navegador.
 *
 * Mantiene la misma "forma" de evento que un <select> nativo: llama a
 * onChange con { target: { name, value } }, así es un reemplazo directo
 * para cualquier handleChange(e) existente que lea e.target.name/value.
 */
export default function CustomSelect({
  name,
  value,
  onChange,
  options, // [{ value: string, label: string }]
  disabled = false,
  placeholder = "Seleccionar...",
  error = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  // Cierra el dropdown con Escape (accesibilidad básica de teclado).
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const selected = options.find((opt) => String(opt.value) === String(value));

  const handleSelect = (optValue) => {
    onChange({ target: { name, value: optValue } });
    setOpen(false);
  };

  const triggerClass = `w-full px-3 py-2 rounded-lg border bg-white text-sm flex items-center justify-between gap-2 transition focus:outline-none focus:ring-2 ${
    disabled
      ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
      : error
      ? "border-red-400 focus:ring-red-100 focus:border-red-400"
      : "border-slate-200 text-slate-800 hover:border-emerald-300 focus:ring-emerald-200 focus:border-emerald-300"
  } ${className}`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={triggerClass}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <li key={opt.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`block w-full px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}