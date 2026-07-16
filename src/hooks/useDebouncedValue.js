import { useEffect, useState } from "react";

// Devuelve `value` con un retardo: solo se actualiza cuando pasan `delay` ms sin
// que `value` cambie. Útil para no disparar una búsqueda al backend en cada
// tecla.
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
