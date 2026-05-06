import { ESTADO_STYLES } from '../data/pedidos.js'; // Ajustá la ruta según tu estructura de carpetas

export default function EstadoBadge({ estado }) {
  const s = ESTADO_STYLES[estado] || ESTADO_STYLES["Pendiente"];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {estado}
    </span>
  );
}