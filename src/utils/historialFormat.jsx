const formatSimpleValue = (valor) => {
  if (valor === null || valor === undefined) return "—";
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}T/.test(valor)) {
    const d = new Date(valor);
    if (!Number.isNaN(d.getTime())) {
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  }
  if (typeof valor === "object" && !Array.isArray(valor)) {
    if (valor.nombre || valor.email || (valor._id && typeof valor._id.toString === "function")) {
      return valor.nombre || valor.email || valor._id.toString();
    }
  }
  return String(valor);
};

// 👇 Función destructora de strings: desenvuelve el JSON las veces que haga falta
const parsearProfundo = (v) => {
  if (typeof v !== 'string') return v;
  let actual = v;
  
  for (let i = 0; i < 3; i++) { // Límite de 3 pasadas por seguridad
    if (typeof actual === 'string') {
      const recortado = actual.trim();
      if (recortado.startsWith('{') || recortado.startsWith('[')) {
        try { 
          actual = JSON.parse(recortado); 
        } catch (e) { 
          break; 
        }
      } else { 
        break; 
      }
    } else { 
      break; 
    }
  }
  return actual;
};

export const ResumenValorHistorial = ({ valor }) => {
    
  if (valor === null || valor === undefined) {
    return <span className="text-slate-400">—</span>;
  }

  // 1. Limpieza inicial destructiva
  valor = parsearProfundo(valor);

  // 2. Manejo de Arrays puros
  if (Array.isArray(valor)) {
    if (valor.length === 0) {
      return <span className="text-slate-400 text-sm">vacío</span>;
    }
    return (
      <ul className="list-disc ml-4 space-y-1">
        {valor.map((item, index) => (
          <li key={index} className="text-slate-700 text-sm">
            {typeof item === "object" ? <ResumenValorHistorial valor={item} /> : formatSimpleValue(item)}
          </li>
        ))}
      </ul>
    );
  }

  // 3. Manejo de Objetos
  if (typeof valor === "object") {
    
    // A. Nodo de cambios (antes -> despues)
    if ("antes" in valor && "despues" in valor) {
      let valorAntes = parsearProfundo(valor.antes);
      let valorDespues = parsearProfundo(valor.despues);

      // Si es el reporte final enmascarado
      if (valorDespues && typeof valorDespues === "object" && ("descartes" in valorDespues || "desperfectos" in valorDespues)) {
        return <ResumenValorHistorial valor={valorDespues} />;
      }

      const esComplejo = (v) => typeof v === "object" && v !== null;
      
      if (esComplejo(valorAntes) || esComplejo(valorDespues)) {
        return (
          <div className="flex flex-col gap-1.5 text-sm mt-1 w-full max-w-md">
            <div className="bg-red-50 text-red-800 p-2 rounded-md border border-red-100 flex gap-2">
              <span className="font-bold shrink-0">-</span>
              <div className="w-full"><ResumenValorHistorial valor={valorAntes} /></div>
            </div>
            <div className="bg-emerald-50 text-emerald-800 p-2 rounded-md border border-emerald-100 flex gap-2">
              <span className="font-bold shrink-0">+</span>
              <div className="w-full"><ResumenValorHistorial valor={valorDespues} /></div>
            </div>
          </div>
        );
      }
      
      // Cambio simple
      return (
        <span className="inline-flex flex-wrap items-center gap-2 text-sm mt-0.5">
          <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded line-through decoration-slate-400">
            {formatSimpleValue(valorAntes)}
          </span>
          <span className="text-slate-400 font-bold">→</span>
          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-100">
            {formatSimpleValue(valorDespues)}
          </span>
        </span>
      );
    }

    // B. Nodo de Reporte Final
    if ("descartes" in valor || "desperfectos" in valor) {
      const descartes = Array.isArray(valor.descartes) ? valor.descartes : [];
      const desperfectos = Array.isArray(valor.desperfectos) ? valor.desperfectos : [];

      return (
        <div className="space-y-3 mt-2">
          {descartes.length > 0 && (
            <div className="border border-orange-200 bg-orange-50 p-2.5 rounded-lg">
              <p className="font-semibold text-orange-800 text-xs mb-1.5 uppercase tracking-wide">🗑️ Descartes</p>
              <ul className="list-disc ml-4 space-y-1 text-sm text-orange-700">
                {descartes.map((item, index) => (
                  <li key={`descarte-${index}`}>
                    <span className="font-medium">{item.itemId || item.tipo || "Material"}</span>
                    <span className="ml-1.5 bg-orange-200 text-orange-900 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm">×{item.cantidad || 1}</span>
                    {item.motivo && <span className="text-orange-600 italic block text-xs mt-0.5">Motivo: {item.motivo}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {desperfectos.length > 0 && (
            <div className="border border-red-200 bg-red-50 p-2.5 rounded-lg">
              <p className="font-semibold text-red-800 text-xs mb-1.5 uppercase tracking-wide">⚠️ Desperfectos</p>
              <ul className="list-disc ml-4 space-y-1 text-sm text-red-700">
                {desperfectos.map((item, index) => (
                  <li key={`desperfecto-${index}`}>
                    <span className="font-medium break-all">{item.equipoId || item.equipo || "Equipo"}</span>
                    {item.motivo && <span className="text-red-600 italic block text-xs mt-0.5">Motivo: {item.motivo}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {descartes.length === 0 && desperfectos.length === 0 && (
            <span className="text-slate-400 text-sm italic">Sin novedades reportadas.</span>
          )}
        </div>
      );
    }

    // C. Nodo de Objeto Genérico
    const entries = Object.entries(valor);
    if (entries.length === 0) {
      return <span className="text-slate-400">sin datos</span>;
    }

    return (
      <div className="space-y-2 mt-1 w-full">
        {entries.map(([clave, subValor]) => (
          <div key={clave} className="text-sm bg-slate-50/70 p-2.5 rounded-md border border-slate-100">
            <span className="font-semibold text-slate-700 capitalize block mb-1">
              {clave.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <div className="pl-3 border-l-2 border-slate-200">
              <ResumenValorHistorial valor={subValor} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 4. Fallback final
  return <span>{formatSimpleValue(valor)}</span>;
};