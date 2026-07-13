import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/equipamiento/Card";
import { PageHeader } from "../components/SharedUi";
import Paginador from "../components/common/Paginador";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useAuth } from "../context/AuthContext";
import * as equipamientoService from "../services/equipamiento";
import { obtenerEdificios } from "../services/edificioService";
import { obtenerLaboratoriosPorEdificio } from "../services/laboratorioService";
import {
  categoriaATipoItem,
  mapearItemsBackend,
  mapearLoteBackend,
  mapearEquiposBackend,
  formatDate,
} from "../utils/inventarioMapper";
import FormularioEquipo from "../components/equipamiento/FormularioEquipo";
import FormularioMaterial from "../components/equipamiento/FormularioMaterial";
import FormularioReactivo from "../components/equipamiento/FormularioReactivo";
import FormularioSustancia from "../components/equipamiento/FormularioSustancia";
import FormularioItem from "../components/equipamiento/FormularioItem"; // Edición a nivel de ítem (nombre, código, cantidad, unidad)
import FormularioLote from "../components/equipamiento/FormularioLote"; // Edición a nivel de lote (cantidad, estado)
import FormularioAgregarLote from "../components/equipamiento/FormularioAgregarLote"; // Registrar entrada (nuevo lote sobre un ítem existente)
import FormularioDesperfecto from "../components/equipamiento/FormularioDesperfecto"; // <-- Importamos tu nuevo formulario Desoerfecto
import FormularioActualizarEstado from "../components/equipamiento/FormularioActualizarEstado"; // <-- Formulario de actualización de estado del equipo
import FormularioTransferirLote from "../components/equipamiento/FormularioTransferirLote"; // Mover lote entre depósito y laboratorios

import {
  FiEdit2, // Lapiz
  FiTrash2, // Basura
  FiUsers, // Usuarios
  FiMonitor, // Monitor para equipos
  FiAlertTriangle, // <-- Nuevo icono para reportar desperfectos
  FiRefreshCw, // <-- Icono para actualizar el estado del equipo
  FiArchive, // Archivo para Descartados
  FiArrowRight, // Flecha del acceso directo al historial
  FiChevronRight, // Chevron para el desplegable de grupos de ítems
  FiPlus, // Registrar entrada (agregar lote)
  FiMove, // Mover / transferir lote entre depósito y laboratorios
} from "react-icons/fi";
import { VscFileSubmodule } from "react-icons/vsc"; // Caja para materiales
import { GiMaterialsScience } from "react-icons/gi"; // Materiales reactivos
import { MdScience } from "react-icons/md";        // Matraz para sustancias
import { AiOutlinePlus } from "react-icons/ai"; // Icono de suma para nuevo registro
import { FiX } from "react-icons/fi";

const tabs = [
  { label: "Equipos", icon: DeviceTabIcon },
  { label: "Materiales", icon: BoxTabIcon },
  { label: "Reactivos", icon: FlaskTabIcon },
  { label: "Sustancias basicas", icon: PillTabIcon },
];

// Tamaño de página del listado principal y del panel de descartados.
const LIMIT = 20;
const DESCARTES_LIMIT = 10;
const UMBRAL_STOCK_BAJO = 5;

// Estados válidos de un lote (consumibles). El backend solo admite estos dos
// valores; no existe "reservado" ni "en uso" (ver
// docs/formulario-estado-lote-item.md).
const statusConfig = {
  Disponible: {
    statusClassName: "bg-emerald-100 text-emerald-700 border-emerald-200",
    alertClassName: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Descartado: {
    statusClassName: "bg-rose-100 text-rose-700 border-rose-200",
    alertClassName: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

// Opciones de estado ofrecidas en los formularios de lote.
const statusOptions = Object.keys(statusConfig);

/* ─── Iconos generales ─── */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20h4l10-10a2 2 0 10-4-4L4 16v4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V5h6v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Iconos para los tabs ─── */
function DeviceTabIcon() { // Ícono de dispositivo para "Equipos"
  return (
    <svg className="w-6 h-6 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 16H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1M9 12H4m8 8V9h8v11h-8Zm0 0H9m8-4a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"/>
    </svg>

  );
}

function BoxTabIcon() { // Ícono de caja para "Materiales"
  return (
    <svg className="w-6 h-6 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11H4m15.5 5a.5.5 0 0 0 .5-.5V8a1 1 0 0 0-1-1h-3.75a1 1 0 0 1-.829-.44l-1.436-2.12a1 1 0 0 0-.828-.44H8a1 1 0 0 0-1 1M4 9v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-3.75a1 1 0 0 1-.829-.44L9.985 8.44A1 1 0 0 0 9.157 8H5a1 1 0 0 0-1 1Z"/>
    </svg>

  );
}

function FlaskTabIcon() { // Ícono de matraz para "Reactivos"
  return (
    <svg className="w-6 h-6 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M8.737 8.737a21.49 21.49 0 0 1 3.308-2.724m0 0c3.063-2.026 5.99-2.641 7.331-1.3 1.827 1.828.026 6.591-4.023 10.64-4.049 4.049-8.812 5.85-10.64 4.023-1.33-1.33-.736-4.218 1.249-7.253m6.083-6.11c-3.063-2.026-5.99-2.641-7.331-1.3-1.827 1.828-.026 6.591 4.023 10.64m3.308-9.34a21.497 21.497 0 0 1 3.308 2.724m2.775 3.386c1.985 3.035 2.579 5.923 1.248 7.253-1.336 1.337-4.245.732-7.295-1.275M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
    </svg>

  );
}

function PillTabIcon() { // Ícono genérico de pastilla para "Sustancias básicas"
  return (
    <svg className="w-6 h-6 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.05 3.00002v5C7.33127 8.93351 5.05005 11.2392 5.05005 14.2c0 3.7555 3.13401 6.8 6.99995 6.8 3.866 0 7-3.0445 7-6.8 0-2.9608-2.2812-5.26649-5-6.19998v-5m-4 0h4m-4 0H8.05005m5.99995 0h2M5.09798 15H19.0021"/>
    </svg>

  );
}

/* ─── Iconos para stats ─── */
function DeviceIcon() {
  return (
    <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" strokeLinecap="round" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.18a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l6 3.09a2 2 0 0 0 2 0l6-3.09A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v2" strokeLinecap="round" />
      <path d="M16 2v2" strokeLinecap="round" />
      <path d="M12 7v9" strokeLinecap="round" />
      <path d="M5 21h14" strokeLinecap="round" />
      <path d="M8 11a4 4 0 0 0 8 0L12 3 8 11z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon({ colorClass = "text-amber-500" }) {
  return (
    <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-current ${colorClass}`}>
      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 8h.01M12 12v4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function StatusPill({ status }) {
  const statusMap = {
    Disponible: "bg-emerald-100 text-emerald-700",
    Reservado: "bg-amber-100 text-amber-700",
    "Fuera de servicio": "bg-rose-100 text-rose-700",
    Mantenimiento: "bg-yellow-100 text-yellow-700",
    Descartado: "bg-rose-100 text-rose-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMap[status] || "bg-slate-100 text-slate-700"}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function MobilityPill({ mobility }) {
  const isMovible = mobility === "Movible";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isMovible ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {mobility}
    </span>
  );
}

function BajoStockCard({ material }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-center gap-3">
        <InfoIcon colorClass="text-amber-500" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">{material.nombre}</span>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Bajo stock
            </span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            Código {material.codigo} · {material.stockDisponible} {material.unidad}
          </div>
        </div>
      </div>
    </div>
  );
}

// Actualizamos InventoryCard para recibir la acción de Desperfecto
function InventoryCard({ item, onEdit, onDelete, onReportDesperfecto, onUpdateEstado, onTransfer, puedeGestionar = false, hideIdentity = false, hideDelete = false }) {
  const puedeReportarDesperfecto = puedeGestionar && item.estado === "Disponible";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {!hideIdentity && <h3 className="truncate text-sm font-semibold text-slate-900">{item.tipo}</h3>}
            <StatusPill status={item.estado} />
          </div>
          {!hideIdentity && <p className="mt-1 text-xs text-slate-500">Código {item.codigo}</p>}
        </div>
        {item.categoria === "Equipos" && <MobilityPill mobility={item.movilidad} />}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cantidad</span>
          <span className="mt-1 block font-semibold text-slate-900">{item.cantidad}</span>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ubicación</span>
          <span className="mt-1 block font-semibold text-slate-900">{item.ubicacionLote || item.ubicacion}</span>
        </div>
        {item.fechaVencimiento && (
          <div className="col-span-2 rounded-xl bg-slate-50 p-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Vencimiento</span>
            <span className="mt-1 block font-semibold text-slate-900">{formatDate(item.fechaVencimiento)}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 flex-wrap">
        {/* Botones condicionales: Solo para la categoría Equipos */}
        {item.categoria === "Equipos" && (
          <>
            <button
              type="button"
              onClick={onUpdateEstado}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-100 cursor-pointer"
              aria-label="Actualizar estado"
            >
              <FiRefreshCw />
              <span className="hidden sm:inline">Estado</span>
            </button>
            {puedeReportarDesperfecto && (
              <button
                type="button"
                onClick={onReportDesperfecto}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-600 transition hover:bg-amber-100 cursor-pointer"
                aria-label="Registrar desperfecto"
              >
                <FiAlertTriangle />
                <span className="hidden sm:inline">Desperfecto</span>
              </button>
            )}
          </>
        )}
        {onTransfer && puedeGestionar && (
          <button
            type="button"
            onClick={onTransfer}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100"
            aria-label="Mover lote"
          >
            <FiMove />
            <span className="hidden sm:inline">Mover</span>
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-600 transition hover:bg-cyan-100"
          aria-label={`Editar ${item.tipo}`}
        >
          <PencilIcon />
          <span className="hidden sm:inline">Editar</span>
        </button>
        {!hideDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
            aria-label={`Eliminar ${item.tipo}`}
          >
            <TrashIcon />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
function Equipamiento() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Reportar desperfecto / gestionar estado del equipo: solo PERSONAL/ADMIN.
  const puedeGestionar = user?.rol === "ADMIN" || user?.rol === "PERSONAL";
  const [activeTab, setActiveTab] = useState(tabs[0].label);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);

  // Listado principal (depende del tab activo). En el tab Equipos se usa
  // `equipos`; en los tabs de consumibles se usa `items`.
  const [items, setItems] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0); // bump tras mutaciones: recarga respetando página/filtros

  // Lotes on-demand: cache por ítem. { [itemId]: { lotes, loading, error } }
  const [lotesPorItem, setLotesPorItem] = useState({});

  // Tarjetas superiores. { equipos, materiales, reactivos, sustancias, descartes }
  const [estadisticas, setEstadisticas] = useState(null);

  // Panel "Alertas de inventario" (lotes descartados, paginado aparte).
 const [materialesBajoStock, setMaterialesBajoStock] = useState([]);
 const [bajoStockLoading, setBajoStockLoading] = useState(false);
 const [bajoStockError, setBajoStockError] = useState("");
 const [bajoStockPage, setBajoStockPage] = useState(1);

  const [expandedGroups, setExpandedGroups] = useState(() => new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  // "full" = alta / edición de equipo (formularios por pestaña);
  // "item" = edición a nivel de ítem consumible (FormularioItem).
  const [formMode, setFormMode] = useState("full");

  // ─── MODAL DE EDICIÓN DE LOTE (cantidad / estado) ───
  const [isLoteEditOpen, setIsLoteEditOpen] = useState(false);
  const [loteEditItem, setLoteEditItem] = useState(null);
  const [loteEditData, setLoteEditData] = useState({ estado: "Disponible" });
  const [erroresLoteEdit, setErroresLoteEdit] = useState({});
  const [errorLoteEdit, setErrorLoteEdit] = useState("");

  // ─── MODAL DE REGISTRAR ENTRADA (nuevo lote sobre un ítem existente) ───
  const [isAddLoteOpen, setIsAddLoteOpen] = useState(false);
  const [addLoteGroup, setAddLoteGroup] = useState(null);
  const [addLoteData, setAddLoteData] = useState({ cantidad: "1", fechaVencimiento: "" });
  const [erroresAddLote, setErroresAddLote] = useState({});
  const [errorAddLote, setErrorAddLote] = useState("");
  const [formData, setFormData] = useState({ nombre: "", cantidad: "1", estado: "Disponible", unidad: "unidad", movilidad: "Fija" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── NUEVOS ESTADOS PARA EL MODAL DE DESPERFECTOS ───
  const [isDesperfectoOpen, setIsDesperfectoOpen] = useState(false);
  const [desperfectoItem, setDesperfectoItem] = useState(null);
  const [desperfectoForm, setDesperfectoForm] = useState({ descripcion: "" });
  const [desperfectoEnviando, setDesperfectoEnviando] = useState(false);
  const [erroresDesperfecto, setErroresDesperfecto] = useState({});

  // ─── ESTADOS PARA EL MODAL DE ACTUALIZACIÓN DE ESTADO ───
  const [isEstadoOpen, setIsEstadoOpen] = useState(false);
  const [estadoItem, setEstadoItem] = useState(null);
  const [estadoMsg, setEstadoMsg] = useState("");
  const [estadoEnviando, setEstadoEnviando] = useState(false);

  // ─── MODAL DE TRANSFERENCIA DE LOTE (mover entre depósito y laboratorios) ───
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferLote, setTransferLote] = useState(null);
  const [transferEnviando, setTransferEnviando] = useState(false);
  const [errorTransfer, setErrorTransfer] = useState("");

  // Mapa laboratorioId -> nombre para etiquetar la ubicación de los lotes.
  // GET /lotes no popula laboratorioId, así que resolvemos el nombre acá.
  const [labMap, setLabMap] = useState({});

  // ─── MENSAJES INLINE (reemplazan alerts) ───
  const [errorOperacion, setErrorOperacion] = useState("");   // error al eliminar
  const [errorFormEquip, setErrorFormEquip] = useState("");   // error en modal equipo/item
  const [erroresFormEquip, setErroresFormEquip] = useState({}); // validaciones inline
  const [desperfectoMsg, setDesperfectoMsg] = useState("");   // éxito/error en desperfecto

  const totalPaginas = Math.max(1, Math.ceil(total / LIMIT));
  const esEquipos = activeTab === "Equipos";

  // ─── Efecto A: listado principal según el tab activo, la búsqueda y la página.
  // Reacciona también a refreshKey para recargar tras una mutación sin perder
  // el tab/búsqueda/página actuales.
  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        if (activeTab === "Equipos") {
          const resp = await equipamientoService.getEquipos({
            q: debouncedQuery || undefined,
            page,
            limit: LIMIT,
          });
          if (cancelado) return;
          setEquipos(mapearEquiposBackend(resp.equipos || []));
          setTotal(resp.total || 0);
        } else {
          const resp = await equipamientoService.getItems({
            q: debouncedQuery || undefined,
            tipo: categoriaATipoItem[activeTab],
            page,
            limit: LIMIT,
          });
          if (cancelado) return;
          setItems(mapearItemsBackend(resp.items || []));
          setTotal(resp.total || 0);
          // Clamp: si esta página quedó vacía tras un borrado pero hay registros,
          // retroceder a la última página con datos.
          if (page > 1 && (resp.items || []).length === 0 && (resp.total || 0) > 0) {
            setPage(Math.max(1, Math.ceil(resp.total / LIMIT)));
          }
        }
      } catch (err) {
        if (cancelado) return;
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar los datos del inventario");
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [activeTab, debouncedQuery, page, refreshKey]);

  // Al cambiar de tab o de búsqueda, volver a la primera página y colapsar grupos.
  const cambiarTab = (label) => {
    if (label === activeTab) return;
    setActiveTab(label);
    setPage(1);
    setExpandedGroups(new Set());
  };
  const cambiarQuery = (value) => {
    setQuery(value);
    setPage(1);
    setExpandedGroups(new Set());
  };

  // ─── Efecto B: estadísticas de las tarjetas.
  const recargarEstadisticas = async () => {
    try {
      const data = await equipamientoService.getEstadisticasItems();
      setEstadisticas(data);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  };
  useEffect(() => {
    let cancelado = false;
    equipamientoService
      .getEstadisticasItems()
      .then((data) => {
        if (!cancelado) setEstadisticas(data);
      })
      .catch((err) => console.error("Error al cargar estadísticas:", err));
    return () => {
      cancelado = true;
    };
  }, []);

  // ─── Mapa de laboratorios (id -> nombre) para etiquetar la ubicación de lotes.
  // No hay endpoint "traer todos": se itera edificios y sus laboratorios (misma
  // cascada que PanelMovimientos / FormularioTransferirLote).
  useEffect(() => {
    let cancelado = false;
    const cargarLabs = async () => {
      try {
        const edificios = await obtenerEdificios();
        const listas = await Promise.all(
          (edificios || []).map((ed) =>
            obtenerLaboratoriosPorEdificio(ed.id || ed._id).catch(() => [])
          )
        );
        if (cancelado) return;
        const mapa = {};
        listas.flat().forEach((lab) => {
          const id = lab?.id || lab?._id;
          if (id) mapa[String(id)] = lab.nombre;
        });
        setLabMap(mapa);
      } catch (err) {
        console.error("Error al cargar laboratorios para el mapa de ubicaciones:", err);
      }
    };
    cargarLabs();
    return () => {
      cancelado = true;
    };
  }, []);

  // ─── Efecto C: panel de descartados. Se pide SIEMPRE con page/limit para
  // recibir la forma paginada { total, page, limit, lotes }.
useEffect(() => {
  let cancelado = false;
  const cargarBajoStock = async () => {
    try {
      setBajoStockLoading(true);
      setBajoStockError("");
      const materiales = await equipamientoService.getAllItems({ tipo: "material" });
      if (cancelado) return;
      const bajoStock = (materiales || [])
        .filter((m) => (m.stockDisponible ?? 0) <= UMBRAL_STOCK_BAJO)
        .sort((a, b) => (a.stockDisponible ?? 0) - (b.stockDisponible ?? 0));
      setMaterialesBajoStock(bajoStock);
      setBajoStockPage(1);
    } catch (err) {
      if (cancelado) return;
      console.error("Error al cargar materiales con bajo stock:", err);
      setMaterialesBajoStock([]);
      setBajoStockError("No se pudo cargar el stock bajo de materiales.");
    } finally {
      if (!cancelado) setBajoStockLoading(false);
    }
  };
  cargarBajoStock();
  return () => {
    cancelado = true;
  };
}, [refreshKey]);

  // Recarga tras una mutación: respeta tab/búsqueda/página y refresca tarjetas.
  const recargarTodo = () => {
    setRefreshKey((k) => k + 1);
    recargarEstadisticas();
  };

  // ─── Lotes on-demand: carga (y cachea) los lotes disponibles de un ítem.
  const ensureLotes = async (itemId, { force = false } = {}) => {
    if (!force && lotesPorItem[itemId]?.lotes) return lotesPorItem[itemId].lotes;
    setLotesPorItem((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], loading: true, error: null },
    }));
    try {
      // Sin page/limit -> array FEFO (lo que vence primero, arriba). No reordenar.
      const data = await equipamientoService.getLotes({ itemId, estado: "disponible" });
      const lotes = (data || []).map((l) => mapearLoteBackend(l, labMap));
      setLotesPorItem((prev) => ({ ...prev, [itemId]: { lotes, loading: false, error: null } }));
      return lotes;
    } catch (err) {
      console.error(`Error al cargar lotes del ítem ${itemId}:`, err);
      setLotesPorItem((prev) => ({
        ...prev,
        [itemId]: { lotes: [], loading: false, error: "No se pudieron cargar los lotes" },
      }));
      return [];
    }
  };

  // Invalida el cache de lotes de un ítem (tras editar/agregar/borrar lotes).
  // Si el grupo está expandido, en vez de sólo borrar el cache re-pedimos sus
  // lotes (force) para que el desplegable abierto se repueble solo, sin que el
  // usuario tenga que cerrarlo y reabrirlo (evita que "desaparezcan" los lotes
  // restantes tras descartar uno).
  const invalidarLotes = (itemId) => {
    if (expandedGroups.has(itemId)) {
      ensureLotes(itemId, { force: true });
      return;
    }
    setLotesPorItem((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleDeleteItem = async (item) => {
    const confirmDelete = window.confirm(`¿Seguro que quieres borrar ${item.tipo}?`);
    if (!confirmDelete) return;

    try {
      if (item.categoria === "Equipos") {
        await equipamientoService.deleteEquipo(item.id);
      } else {
        await equipamientoService.deleteLote(item.loteId);
        invalidarLotes(item.itemId);
      }
      recargarTodo();
    } catch (err) {
      console.error("Error al eliminar el registro:", err);
      const msg = "No se pudo eliminar el registro: " + (err.response?.data?.error || err.message);
      setErrorOperacion(msg);
      setTimeout(() => setErrorOperacion(""), 5000);
    }
  };

  // Elimina un lote puntual de un ítem (no el ítem entero). Refresca el grupo
  // abierto vía invalidarLotes + recargarTodo.
  const handleDeleteLote = async (lote, group) => {
    const nombre = group?.tipo || lote.tipo || "este ítem";
    const confirmDelete = window.confirm(`¿Seguro que querés eliminar este lote de ${nombre}?`);
    if (!confirmDelete) return;

    try {
      await equipamientoService.deleteLote(lote.loteId);
      invalidarLotes(lote.itemId);
      recargarTodo();
    } catch (err) {
      console.error("Error al eliminar el lote:", err);
      const msg = "No se pudo eliminar el lote: " + (err.response?.data?.error || err.message);
      setErrorOperacion(msg);
      setTimeout(() => setErrorOperacion(""), 5000);
    }
  };

  const resetForm = () => setFormData({ nombre: "", cantidad: "1", estado: "Disponible", unidad: "unidad", movilidad: "Fija" });
  
  const openForm = () => {
    setEditingItem(null);
    setFormMode("full");
    if (activeTab === "Equipos") {
      setFormData({
        nombre: "", codigo: "", tipo: "", esFijo: "", estado: "disponible",
        edificioId: "", laboratorioId: "", cantidad: "1", unidad: "unidad", movilidad: "Fija",
      });
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormMode("full");
    const visibleTabLabels = tabs.map((t) => t.label);
    if (visibleTabLabels.includes(item.categoria)) setActiveTab(item.categoria);
    if (item.categoria === "Equipos") {
      const original = item.equipoOriginal || {};
      setFormData({
        nombre: item.tipo,
        codigo: item.codigo,
        tipo: original.tipo || "",
        esFijo: item.movilidad === "Fija",
        estado: estadoToBackend(item.estado),
        edificioId: original.edificioId?._id || original.edificioId?.id || original.edificioId || "",
        laboratorioId: original.laboratorioId?._id || original.laboratorioId?.id || original.laboratorioId || "",
        cantidad: String(item.cantidad),
        unidad: item.unidad || "unidad",
        movilidad: item.movilidad || "Fija",
      });
    } else {
      setFormData({
        nombre: item.tipo,
        cantidad: String(item.cantidad),
        estado: item.estado,
        unidad: item.unidad || "unidad",
        movilidad: item.movilidad || "Fija",
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormMode("full");
    setErrorFormEquip("");
    setErroresFormEquip({});
  };

  // ─── EDICIÓN A NIVEL DE ÍTEM (grupo desplegable) ───
  // Edita los datos generales del ítem (nombre, código, cantidad, unidad). El
  // lote representante (para la cantidad) se resuelve pidiendo los lotes al
  // backend, ya que no están cargados hasta expandir el grupo.
  const openItemEdit = async (group) => {
    const lotes = await ensureLotes(group.itemId);
    const rep = lotes[0] || {};
    setEditingItem({ ...group, loteId: rep.loteId, estado: rep.estado, movilidad: rep.movilidad });
    setFormMode("item");
    setActiveTab(group.categoria);
    setFormData({
      nombre: group.tipo,
      codigo: group.codigo,
      cantidad: String(rep.cantidad ?? group.stockDisponible ?? ""),
      unidad: group.unidad || "unidad",
    });
    setIsFormOpen(true);
  };

  // Elimina el ítem completo: da de baja todos sus lotes (incluidos los
  // descartados, que no viven en el grupo) y luego el ítem.
  const handleDeleteGroup = async (group) => {
    const confirmDelete = window.confirm(
      `¿Seguro que quieres eliminar ${group.tipo} y todos sus lotes?`
    );
    if (!confirmDelete) return;

    try {
      // getLotesByItemId trae TODOS los lotes del ítem (incluidos descartados).
      const lotesDelItem = await equipamientoService.getLotesByItemId(group.itemId);
      for (const lote of lotesDelItem || []) {
        await equipamientoService.deleteLote(lote.id || lote._id);
      }
      await equipamientoService.deleteItem(group.itemId);
      invalidarLotes(group.itemId);
      recargarTodo();
    } catch (err) {
      console.error("Error al eliminar el ítem:", err);
      const msg = "No se pudo eliminar el ítem: " + (err.response?.data?.error || err.message);
      setErrorOperacion(msg);
      setTimeout(() => setErrorOperacion(""), 5000);
    }
  };

  // ─── EDICIÓN A NIVEL DE LOTE (cantidad / estado) ───
  const openLoteEdit = (lote) => {
    setLoteEditItem(lote);
    setLoteEditData({ cantidad: String(lote.cantidad ?? ""), estado: lote.estado });
    setErroresLoteEdit({});
    setErrorLoteEdit("");
    setIsLoteEditOpen(true);
  };

  const closeLoteEdit = () => {
    setIsLoteEditOpen(false);
    setLoteEditItem(null);
    setErroresLoteEdit({});
    setErrorLoteEdit("");
  };

  const handleLoteEditChange = (e) => {
    const { name, value } = e.target;
    setLoteEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoteEditSubmit = async (e) => {
    e.preventDefault();
    setErroresLoteEdit({});
    setErrorLoteEdit("");
    const cantidad = Number.parseInt(loteEditData.cantidad, 10);
    const errs = {};
    if (Number.isNaN(cantidad) || cantidad < 1) errs.cantidad = "Ingresá una cantidad válida (mínimo 1).";
    if (Object.keys(errs).length > 0) {
      setErroresLoteEdit(errs);
      return;
    }
    try {
      await equipamientoService.updateLote(loteEditItem.loteId, {
        cantidadDisponible: cantidad,
        estado: estadoToBackend(loteEditData.estado),
        movilidad: loteEditItem.movilidad,
      });
      invalidarLotes(loteEditItem.itemId);
      recargarTodo();
      closeLoteEdit();
    } catch (err) {
      console.error("Error al actualizar lote:", err);
      setErrorLoteEdit("Error al guardar el lote: " + (err.response?.data?.error || err.message));
    }
  };

  // ─── REGISTRAR ENTRADA: crea un lote nuevo sobre el ítem del grupo ───
  const openAddLote = (group) => {
    setAddLoteGroup(group);
    setAddLoteData({ cantidad: "1", fechaVencimiento: "" });
    setErroresAddLote({});
    setErrorAddLote("");
    setIsAddLoteOpen(true);
  };

  const closeAddLote = () => {
    setIsAddLoteOpen(false);
    setAddLoteGroup(null);
    setErroresAddLote({});
    setErrorAddLote("");
  };

  const handleAddLoteChange = (e) => {
    const { name, value } = e.target;
    setAddLoteData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLoteSubmit = async (e) => {
    e.preventDefault();
    setErroresAddLote({});
    setErrorAddLote("");

    const cantidad = Number.parseInt(addLoteData.cantidad, 10);
    const errs = {};
    if (Number.isNaN(cantidad) || cantidad < 1) errs.cantidad = "Ingresá una cantidad válida (mínimo 1).";
    if (Object.keys(errs).length > 0) { setErroresAddLote(errs); return; }

    try {
      await equipamientoService.createLote({
        itemId: addLoteGroup.itemId,
        cantidadDisponible: cantidad,
        estado: "disponible",
        movilidad: "Fija",
        ...(addLoteData.fechaVencimiento ? { fechaVencimiento: addLoteData.fechaVencimiento } : {}),
      });
      invalidarLotes(addLoteGroup.itemId);
      recargarTodo();
      closeAddLote();
    } catch (err) {
      console.error("Error al registrar la entrada:", err);
      setErrorAddLote("Error al registrar la entrada: " + (err.response?.data?.error || err.message));
    }
  };

  // ─── TRANSFERENCIA DE LOTE (mover entre depósito y laboratorios) ───
  const openTransferModal = (lote) => {
    setTransferLote(lote);
    setErrorTransfer("");
    setIsTransferOpen(true);
  };

  const closeTransferModal = () => {
    setIsTransferOpen(false);
    setTransferLote(null);
    setErrorTransfer("");
  };

  const handleTransferSubmit = async (payload) => {
    setErrorTransfer("");
    setTransferEnviando(true);
    try {
      await equipamientoService.transferirLote(transferLote.loteId, payload);
      // Tras un traslado (sobre todo parcial) el listado del ítem cambió: el
      // origen quedó con menos cantidad y pudo crearse un lote destino nuevo.
      invalidarLotes(transferLote.itemId);
      recargarTodo();
      closeTransferModal();
    } catch (err) {
      console.error("Error al transferir lote:", err);
      setErrorTransfer("Error al mover el lote: " + (err.response?.data?.error || err.message));
    } finally {
      setTransferEnviando(false);
    }
  };

  // ─── ACCIONES DEL FORMULARIO DE DESPERFECTOS ───
  const openDesperfectoModal = (item) => {
    setDesperfectoItem(item);
    setDesperfectoForm({ descripcion: "" });
    setErroresDesperfecto({});
    setDesperfectoMsg("");
    setIsDesperfectoOpen(true);
  };

  const closeDesperfectoModal = () => {
    setIsDesperfectoOpen(false);
    setDesperfectoItem(null);
    setDesperfectoMsg("");
    setErroresDesperfecto({});
  };

  const handleDesperfectoChange = (e) => {
    const { name, value } = e.target;
    setDesperfectoForm((prev) => ({ ...prev, [name]: value }));
    if (erroresDesperfecto[name]) {
      setErroresDesperfecto((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDesperfectoSubmit = async (e) => {
    e.preventDefault();
    if (!desperfectoItem) return;
    setDesperfectoMsg("");

    // Validación inline: descripción obligatoria, máx 500 caracteres.
    const descripcion = (desperfectoForm.descripcion || "").trim();
    if (!descripcion) {
      setErroresDesperfecto({ descripcion: "La descripción es obligatoria." });
      return;
    }
    if (descripcion.length > 500) {
      setErroresDesperfecto({ descripcion: "La descripción no puede superar los 500 caracteres." });
      return;
    }
    setErroresDesperfecto({});

    const equipoId = desperfectoItem.itemId || desperfectoItem.id;
    setDesperfectoEnviando(true);
    try {
      await equipamientoService.registrarMantenimiento(equipoId, {
        tipo: "correctivo",
        descripcion,
      });
      setDesperfectoMsg(`ok:Desperfecto registrado con éxito para el equipo: ${desperfectoItem.tipo}`);
      recargarTodo();
      setTimeout(() => { closeDesperfectoModal(); }, 2000);
    } catch (err) {
      console.error("Error al guardar desperfecto:", err);
      setDesperfectoMsg("error:" + (err.response?.data?.error || "No se pudo registrar el desperfecto."));
    } finally {
      setDesperfectoEnviando(false);
    }
  };

  // ─── ACCIONES DEL FORMULARIO DE ACTUALIZACIÓN DE ESTADO ───
  const openEstadoModal = (item) => {
    setEstadoItem(item);
    setEstadoMsg("");
    setIsEstadoOpen(true);
  };

  const closeEstadoModal = () => {
    setIsEstadoOpen(false);
    setEstadoItem(null);
    setEstadoMsg("");
  };

  const handleEstadoSubmit = async (payload) => {
    if (!estadoItem) return;
    const equipoId = estadoItem.itemId || estadoItem.id;
    setEstadoMsg("");
    setEstadoEnviando(true);
    try {
      if (payload.accion === "iniciarMantenimiento") {
        const body = { tipo: payload.tipo };
        if (payload.descripcion) body.descripcion = payload.descripcion;
        if (payload.fecha) body.fecha = payload.fecha;
        await equipamientoService.registrarMantenimiento(equipoId, body);
      } else if (payload.accion === "finalizarMantenimiento") {
        // El backend fija la fecha de fin con su propia hora: body vacío.
        await equipamientoService.finalizarMantenimiento(equipoId, {});
      } else {
        // Cambio directo de estado (PUT): fuera de servicio o volver a disponible.
        await equipamientoService.updateEquipo(equipoId, { estado: payload.estado });
      }
      setEstadoMsg("ok:Estado actualizado con éxito.");
      recargarTodo();
      setTimeout(() => { closeEstadoModal(); }, 1500);
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      setEstadoMsg("error:" + (err.response?.data?.error || "No se pudo actualizar el estado."));
    } finally {
      setEstadoEnviando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "esFijo" ? value === "true" : value,
    }));
  };

  const estadoToBackend = (estado) => {
    const estadoMap = {
      Disponible: "disponible",
      Reservado: "reservado",
      "En uso": "en_uso",
      Descartado: "descartado",
      Mantenimiento: "mantenimiento",
      "Fuera de servicio": "fuera de servicio",
    };
    return estadoMap[estado] || estado.toLowerCase();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorFormEquip("");
    setErroresFormEquip({});

    // Edición a nivel de ítem (grupo): actualiza el ítem y la cantidad del
    // lote representante. Ubicación/estado se editan por lote aparte.
    if (formMode === "item") {
      const nombre = formData.nombre.trim();
      const codigo = formData.codigo.trim();
      const cantidad = Number.parseInt(formData.cantidad, 10);

      const errs = {};
      if (!nombre) errs.nombre = "El nombre es obligatorio.";
      if (!codigo) errs.codigo = "El código es obligatorio.";
      if (Number.isNaN(cantidad) || cantidad < 1) errs.cantidad = "Ingresá una cantidad válida (mínimo 1).";
      if (Object.keys(errs).length > 0) { setErroresFormEquip(errs); return; }

      try {
        const tipoItem = categoriaATipoItem[editingItem.categoria] || "material";
        await equipamientoService.updateItem(editingItem.itemId, {
          tipo: tipoItem, nombre, codigo, unidad: formData.unidad, esConsumible: editingItem.esConsumible ?? true,
        });
        if (editingItem.loteId) {
          await equipamientoService.updateLote(editingItem.loteId, {
            cantidadDisponible: cantidad,
            estado: estadoToBackend(editingItem.estado),
            movilidad: editingItem.movilidad,
          });
        }
        invalidarLotes(editingItem.itemId);
        recargarTodo();
        closeForm();
      } catch (err) {
        console.error("Error al guardar ítem:", err);
        setErrorFormEquip("Error al guardar el ítem: " + (err.response?.data?.error || err.message));
      }
      return;
    }

    if (activeTab === "Equipos") {
      const isFijo = formData.esFijo === true || String(formData.esFijo) === "true";
      const payloadEquipo = {
        nombre: formData.nombre.trim(),
        codigo: formData.codigo.trim(),
        tipo: formData.tipo.trim(),
        esFijo: isFijo,
        estado: formData.estado,
        edificioId: isFijo && formData.edificioId ? formData.edificioId : null,
        laboratorioId: isFijo && formData.laboratorioId ? formData.laboratorioId : null,
      };

      const errs = {};
      if (!payloadEquipo.nombre) errs.nombre = "El nombre es obligatorio.";
      if (!payloadEquipo.codigo) errs.codigo = "El código es obligatorio.";
      if (!payloadEquipo.tipo) errs.tipo = "El tipo es obligatorio.";
      if (Object.keys(errs).length > 0) { setErroresFormEquip(errs); return; }

      try {
        if (editingItem) {
          const equipoId = editingItem.itemId || editingItem.id;
          await equipamientoService.updateEquipo(equipoId, payloadEquipo);
        } else {
          await equipamientoService.createEquipo(payloadEquipo);
        }
        recargarTodo();
        closeForm();
        resetForm();
      } catch (err) {
        console.error("Error al guardar equipo:", err);
        setErrorFormEquip("Error al guardar el equipo: " + (err.response?.data?.error || err.message));
      }
      return; 
    }

    const nombre = formData.nombre.trim();
    const cantidad = Number.parseInt(formData.cantidad, 10);

    const errs = {};
    if (!nombre) errs.nombre = "El nombre es obligatorio.";
    if (Number.isNaN(cantidad) || cantidad < 1) errs.cantidad = "Ingresá una cantidad válida (mínimo 1).";
    if (Object.keys(errs).length > 0) { setErroresFormEquip(errs); return; }

    try {
      if (editingItem) {
        const tipoItem = categoriaATipoItem[editingItem.categoria] || "material";
        await equipamientoService.updateItem(editingItem.itemId, {
          tipo: tipoItem, nombre, codigo: editingItem.codigo, unidad: formData.unidad, esConsumible: editingItem.esConsumible ?? true,
        });
        await equipamientoService.updateLote(editingItem.loteId, {
          cantidadDisponible: cantidad, estado: estadoToBackend(formData.estado), movilidad: formData.movilidad,
        });
        invalidarLotes(editingItem.itemId);
      } else {
        const tipoItem = categoriaATipoItem[activeTab] || "material";
        const codePrefix = activeTab === "Materiales" ? "MT" : activeTab === "Reactivos" ? "RC" : "SB";
        // El código correlativo se calcula pidiendo al backend el mayor código del
        // tipo (ya no está todo el inventario en memoria por la paginación).
        const ultimos = await equipamientoService.getItems({ tipo: tipoItem, sort: "codigo", order: "desc", limit: 1 });
        const ultimoCodigo = ultimos.items?.[0]?.codigo;
        const [, num = "0"] = (ultimoCodigo || "").split("-");
        const nextNumber = (Number.parseInt(num, 10) || 0) + 1;
        const codigo = `${codePrefix}-${String(nextNumber).padStart(3, "0")}`;

        const nuevoItem = await equipamientoService.createItem({
          tipo: tipoItem, nombre, codigo, unidad: formData.unidad, esConsumible: true,
        });
        const nuevoItemId = nuevoItem.id || nuevoItem._id;

        try {
          await equipamientoService.createLote({
            itemId: nuevoItemId, cantidadDisponible: cantidad, estado: estadoToBackend(formData.estado), movilidad: formData.movilidad,
            ...(formData.fechaVencimiento ? { fechaVencimiento: formData.fechaVencimiento } : {}),
          });
        } catch (loteError) {
          if (nuevoItemId && typeof equipamientoService.deleteItem === "function") {
            try { await equipamientoService.deleteItem(nuevoItemId); } catch (r) { console.error(r); }
          }
          throw loteError;
        }
      }
      recargarTodo();
      closeForm();
      resetForm();
    } catch (err) {
      console.error("Error al guardar item/lote:", err);
      setErrorFormEquip("Error al guardar el ítem: " + (err.response?.data?.error || err.message));
    }
  };

  // Tarjetas superiores construidas desde el endpoint de estadísticas.
  const stats = [
    { title: "Equipos registrados", value: estadisticas?.equipos ?? 0, subtitle: "Inventario general", hex: "#06b6d4" },
    { title: "Materiales", value: estadisticas?.materiales ?? 0, subtitle: "Ítems activos", hex: "#4f46e5" },
    { title: "Reactivos", value: estadisticas?.reactivos ?? 0, subtitle: "Ítems activos", hex: "#f59e0b" },
    { title: "Sustancias", value: estadisticas?.sustancias ?? 0, subtitle: "Ítems activos", hex: "#10b981" },
    { title: "Descartes", value: estadisticas?.descartes ?? 0, subtitle: "Historial consultable", hex: "#f43f5e" },
  ];

 const bajoStockPaginas = Math.max(1, Math.ceil(materialesBajoStock.length / DESCARTES_LIMIT));
 const materialesBajoStockPagina = materialesBajoStock.slice(
  (bajoStockPage - 1) * DESCARTES_LIMIT,
  bajoStockPage * DESCARTES_LIMIT
);
  // Al expandir un grupo, se piden sus lotes on-demand (una sola vez, cacheados).
  const toggleGroup = (itemId) => {
    const estaAbierto = expandedGroups.has(itemId);
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
    if (!estaAbierto) ensureLotes(itemId);
  };

  return (
    <div className="min-h-screen text-slate-800">
      <div className="px-3 py-5 sm:px-6 lg:px-8 lg:py-6">
        <PageHeader title="Equipamiento" />

        {/* Banner error de operación (ej: no se pudo eliminar) */}
        {errorOperacion && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <span><strong>Error:</strong> {errorOperacion}</span>
            <button onClick={() => setErrorOperacion("")} className="ml-4 font-bold text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Stats Card */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((s) => (
            <Card key={s.title} padding="none" className="relative overflow-hidden rounded-[24px] border border-emerald-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: s.hex }} />
              <div className="absolute right-4 top-4 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold sm:hidden" style={{ backgroundColor: `${s.hex}20`, color: s.hex }}>
                {s.value}
              </div>
              <div>
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{s.title}</div>
                <div className="hidden text-4xl font-black leading-none text-slate-900 sm:block" style={{ color: s.hex }}>{s.value}</div>
                <div className="mt-3 text-sm text-slate-500">{s.subtitle}</div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Tabla principal */}
          <Card padding="none" className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Registro activo
                  </div>
                  <h2 className="mt-3 font-['Playfair_Display',serif] text-2xl font-bold leading-tight text-emerald-950 sm:text-[2rem]">
                    Stock
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-500">Usa tus filtros para ver por categoría los registros cargados.</p>
                </div>
                <button
                  type="button"
                  onClick={openForm}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 sm:mt-0 sm:w-auto cursor-pointer"
                >
                  <span className="text-base leading-none"><AiOutlinePlus /></span>
                  Nuevo ítem
                </button>
              </div>
            </div>

            <div className="px-4 pt-4 sm:px-6">
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-[18px] border border-emerald-100 bg-emerald-50/40 p-1 sm:grid-cols-4">
                {tabs.map(({ label, icon }) => {
                  const TabIcon = icon;
                  const isActive = label === activeTab;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => cambiarTab(label)}
                      className={`flex min-w-0 items-center justify-center gap-2 rounded-[14px] px-3 py-2 text-xs font-medium transition-all duration-200 sm:shrink-0 sm:justify-start sm:px-4 sm:text-sm ${
                        isActive ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100 font-semibold" : "text-slate-500 hover:text-emerald-700 hover:bg-white/80"
                      }`}
                    >
                      <span className={isActive ? "text-emerald-600" : "text-slate-400"}><TabIcon /></span>
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Búsqueda */}
              <div className="mb-5 relative w-full max-w-full sm:max-w-sm">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => cambiarQuery(e.target.value)}
                  placeholder="Buscar por nombre o código..."
                  className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="px-3 py-4 sm:px-6 sm:py-5">
              {/* Vista móvil */}
              <div className="space-y-3 md:hidden">
                {loading ? (
                  <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8">
                    <div className="text-center">
                      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
                      <p className="text-sm text-slate-500">Cargando inventario...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-medium text-rose-700">{error}</p>
                  </div>
                ) : esEquipos ? (
                  equipos.length > 0 ? (
                    equipos.map((item) => (
                      <InventoryCard
                        key={item.id}
                        item={item}
                        onEdit={() => openEditForm(item)}
                        onDelete={() => handleDeleteItem(item)}
                        onReportDesperfecto={() => openDesperfectoModal(item)} // <-- Enlazado móvil
                        onUpdateEstado={() => openEstadoModal(item)} // <-- Actualizar estado (móvil)
                        puedeGestionar={puedeGestionar}
                      />
                    ))
                  ) : (
                    <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                      No hay resultados para el filtro seleccionado.
                    </p>
                  )
                ) : items.length > 0 ? (
                  items.map((g) => {
                    const isOpen = expandedGroups.has(g.itemId);
                    const loteState = lotesPorItem[g.itemId];
                    return (
                      <div key={g.itemId} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => toggleGroup(g.itemId)}
                            className="flex w-full items-center gap-2 text-left"
                            aria-expanded={isOpen}
                          >
                            <FiChevronRight className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                            <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900 line-clamp-2">{g.tipo}</span>
                          </button>
                          <div className="mt-1.5 flex items-center justify-between gap-2 pl-6">
                            <span className="min-w-0 truncate text-xs text-slate-500">
                              Código {g.codigo} · {g.stockDisponible} {g.unidad}
                            </span>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openAddLote(g)}
                                className="rounded-lg p-1.5 text-emerald-500 bg-emerald-50 hover:bg-emerald-100 transition"
                                aria-label={`Registrar entrada de ${g.tipo}`}
                              >
                                <FiPlus />
                              </button>
                              <button
                                type="button"
                                onClick={() => openItemEdit(g)}
                                className="rounded-lg p-1.5 text-cyan-500 bg-cyan-50 hover:bg-cyan-100 transition"
                                aria-label={`Editar ${g.tipo}`}
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteGroup(g)}
                                className="rounded-lg p-1.5 text-rose-500 bg-rose-50 hover:bg-rose-100 transition"
                                aria-label={`Eliminar ${g.tipo}`}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        </div>
                        {isOpen && (
                          <div className="space-y-3 border-t border-slate-100 p-3">
                            {loteState?.loading ? (
                              <p className="text-center text-sm text-slate-400">Cargando lotes...</p>
                            ) : loteState?.error ? (
                              <p className="text-center text-sm text-rose-500">{loteState.error}</p>
                            ) : loteState?.lotes?.length > 0 ? (
                              loteState.lotes.map((item) => (
                                <InventoryCard
                                  key={item.id}
                                  item={{ ...item, unidad: g.unidad }}
                                  hideIdentity
                                  onEdit={() => openLoteEdit(item)}
                                  onDelete={() => handleDeleteLote(item, g)}
                                  onReportDesperfecto={() => openDesperfectoModal(item)}
                                  onUpdateEstado={() => openEstadoModal(item)}
                                  onTransfer={() => openTransferModal(item)}
                                  puedeGestionar={puedeGestionar}
                                />
                              ))
                            ) : (
                              <p className="text-center text-sm text-slate-400">Sin lotes disponibles.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    No hay resultados para el filtro seleccionado.
                  </p>
                )}
              </div>

              {/* Tabla escritorio */}
              <div className="hidden overflow-hidden rounded-[22px] border border-slate-200 md:block">
                {loading && (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
                      <p className="text-sm text-slate-500">Cargando inventario...</p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="border-b border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-medium text-rose-700">{error}</p>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Cantidad</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Codigo</th>
                        {esEquipos && (
                          <>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Ubicacion</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Estado</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Movilidad</th>
                          </>
                        )}
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Equipos: una fila por equipo, sin agrupar */}
                      {!loading && esEquipos && equipos.map((item) => (
                        <tr key={item.id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-emerald-50/40 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900">{item.tipo}</td>
                          <td className="px-4 py-3 text-slate-500">{item.cantidad}</td>
                          <td className="px-4 py-3 text-slate-500">{item.codigo}</td>
                          <td className="px-4 py-3 text-slate-500">{item.ubicacion}</td>
                          <td className="px-4 py-3"><StatusPill status={item.estado} /></td>
                          <td className="px-4 py-3"><MobilityPill mobility={item.movilidad} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEstadoModal(item)}
                                className="rounded-lg p-2 text-emerald-500 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
                                title="Actualizar estado"
                              >
                                <FiRefreshCw />
                              </button>
                              {puedeGestionar && item.estado === "Disponible" && (
                                <button
                                  type="button"
                                  onClick={() => openDesperfectoModal(item)}
                                  className="rounded-lg p-2 text-amber-500 bg-amber-50 hover:bg-amber-100 transition cursor-pointer"
                                  title="Registrar Desperfecto"
                                >
                                  <FiAlertTriangle />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openEditForm(item)}
                                className="rounded-lg p-2 text-cyan-500 bg-cyan-50 hover:bg-cyan-100 transition"
                                aria-label={`Editar ${item.tipo}`}
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item)}
                                className="rounded-lg p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 transition"
                                aria-label={`Eliminar ${item.tipo}`}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Consumibles: agrupados por ítem en un desplegable */}
                      {!loading && !esEquipos && items.map((g) => {
                        const isOpen = expandedGroups.has(g.itemId);
                        const loteState = lotesPorItem[g.itemId];
                        return (
                          <Fragment key={g.itemId}>
                            <tr
                              onClick={() => toggleGroup(g.itemId)}
                              className="border-t border-slate-100 text-sm text-slate-700 bg-slate-50/60 hover:bg-emerald-50/40 transition-colors cursor-pointer"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <FiChevronRight className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                  <span className="font-semibold text-slate-900">{g.tipo}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-900">{g.stockDisponible} {g.unidad}</td>
                              <td className="px-4 py-3 text-slate-500">{g.codigo}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); openAddLote(g); }}
                                    className="rounded-lg p-2 text-emerald-500 bg-emerald-50 hover:bg-emerald-100 transition"
                                    title="Registrar entrada"
                                    aria-label={`Registrar entrada de ${g.tipo}`}
                                  >
                                    <FiPlus />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); openItemEdit(g); }}
                                    className="rounded-lg p-2 text-cyan-500 bg-cyan-50 hover:bg-cyan-100 transition"
                                    aria-label={`Editar ${g.tipo}`}
                                  >
                                    <FiEdit2 />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g); }}
                                    className="rounded-lg p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 transition"
                                    aria-label={`Eliminar ${g.tipo}`}
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {isOpen && (
                              <tr className="border-t border-slate-100 bg-slate-50/40">
                                <td colSpan={4} className="px-4 py-3">
                                  <div className="space-y-2 pl-8">
                                    {loteState?.loading ? (
                                      <p className="text-sm text-slate-400">Cargando lotes...</p>
                                    ) : loteState?.error ? (
                                      <p className="text-sm text-rose-500">{loteState.error}</p>
                                    ) : loteState?.lotes?.length > 0 ? (
                                      loteState.lotes.map((item) => (
                                        <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2">
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.laboratorioId ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                                                {item.ubicacionLote}
                                              </span>
                                            </div>
                                            {item.fechaVencimiento && (
                                              <div className="mt-0.5 text-xs text-slate-400">Vence {formatDate(item.fechaVencimiento)}</div>
                                            )}
                                          </div>
                                          <StatusPill status={item.estado} />
                                          <span className="text-sm font-semibold text-slate-900">{item.cantidad} {g.unidad}</span>
                                          {puedeGestionar && (
                                            <button
                                              type="button"
                                              onClick={() => openTransferModal(item)}
                                              className="rounded-lg p-2 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 transition"
                                              aria-label={`Mover lote de ${g.tipo}`}
                                              title="Mover lote"
                                            >
                                              <FiMove />
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => openLoteEdit(item)}
                                            className="rounded-lg p-2 text-cyan-500 bg-cyan-50 hover:bg-cyan-100 transition"
                                            aria-label={`Editar lote en ${item.ubicacionLote}`}
                                          >
                                            <FiEdit2 />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteLote(item, g)}
                                            className="rounded-lg p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 transition"
                                            aria-label={`Eliminar lote en ${item.ubicacionLote}`}
                                          >
                                            <FiTrash2 />
                                          </button>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-slate-400">Sin lotes disponibles.</p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}

                      {/* Estado vacío (aplica a ambos modos) */}
                      {!loading && (esEquipos ? equipos.length === 0 : items.length === 0) && (
                        <tr>
                          <td colSpan={esEquipos ? 7 : 4} className="px-4 py-8 text-center text-sm text-slate-500">
                            No hay resultados para el filtro seleccionado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <Paginador
                page={page}
                totalPaginas={totalPaginas}
                onPageChange={setPage}
                loading={loading}
              />
            </div>
          </Card>

          {/* Panel de alertas */}
          <div>
            <Card padding="none" className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-emerald-950">Alertas de inventario</h2>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    {materialesBajoStock.length} bajo stock
                  </span>
                </div>
                <p className="mb-0 text-sm text-slate-500">
                  Materiales con stock disponible igual o menor a {UMBRAL_STOCK_BAJO} unidades.
                </p>
              </div>
              <div className="max-h-[36rem] overflow-y-auto p-5 pr-3">
                <div className="flex flex-col gap-3 pr-2">
                  {bajoStockLoading ? (
                    <p className="text-center text-sm text-slate-400">Cargando...</p>
                  ) : bajoStockError ? (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-600">
                      {bajoStockError}
                    </p>
                  ) : materialesBajoStockPagina.length > 0 ? (
                    materialesBajoStockPagina.map((m) => (
                      <BajoStockCard key={m._id || m.id} material={m} />
                    ))
                  ) : (
                    <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm leading-6 text-slate-500">
                      No hay materiales con bajo stock.
                    </p>
                  )}
                </div>
                <Paginador
                  page={bajoStockPage}
                  totalPaginas={bajoStockPaginas}
                  onPageChange={setBajoStockPage}
                />
              </div>
            </Card>
          </div>
        </div>

        <section className="mt-6">
          <button
            type="button"
            onClick={() => navigate("/historial")}
            className="group flex w-full items-center gap-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white px-5 py-5 text-left shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition hover:border-emerald-300 hover:shadow-[0_18px_50px_rgba(16,185,129,0.14)] cursor-pointer sm:px-6"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
              <FiArchive className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-['Playfair_Display',serif] text-xl font-bold leading-tight text-emerald-950 sm:text-2xl">
                Historial
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Consulta el historial de movimientos de stock, descartes y mantenimiento de equipos.
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:translate-x-0.5 group-hover:border-emerald-300 group-hover:bg-emerald-50 group-hover:text-emerald-600">
              <FiArrowRight />
            </span>
          </button>
        </section>
      </div>

        {/* ─── MODAL 1: FORMULARIO GENERAL (EQUIPO / EQUIPAMIENTO) ─── */}
        {isFormOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4"
            onClick={closeForm}
          >
            <div
              className="flex w-full max-w-lg max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-200 bg-gradient-to-b from-emerald-50 to-white px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Registro</div>
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                      {editingItem ? `Editar ${editingItem.tipo}` : {
                        "Equipos": "Nuevo equipo",
                        "Materiales": "Nuevo material",
                        "Reactivos": "Nuevo reactivo",
                        "Sustancias basicas": "Nueva sustancia básica",
                      }[activeTab] || "Nuevo ítem"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{editingItem ? "Actualiza los campos y guarda los cambios." : "Completa el formulario para registrar el ítem."}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeForm}
                    aria-label="Cerrar formulario"
                    title="Cerrar formulario"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                  >
                    <FiX className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                {errorFormEquip && (
                  <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    <span><strong>Error:</strong> {errorFormEquip}</span>
                    <button onClick={() => setErrorFormEquip("")} className="ml-4 font-bold text-red-400 hover:text-red-600">✕</button>
                  </div>
                )}
                {formMode === "item" ? (
                  <FormularioItem formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={closeForm} errores={erroresFormEquip} />
                ) : activeTab === "Equipos" ? (
                  <FormularioEquipo formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={closeForm} errores={erroresFormEquip} />
                ) : activeTab === "Materiales" ? (
                  <FormularioMaterial formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={closeForm} statusOptions={statusOptions} errores={erroresFormEquip} />
                ) : activeTab === "Reactivos" ? (
                  <FormularioReactivo formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={closeForm} statusOptions={statusOptions} errores={erroresFormEquip} />
                ) : (
                  <FormularioSustancia formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={closeForm} statusOptions={statusOptions} errores={erroresFormEquip} />
                )}
              </div>
            </div>
          </div>
        )}

      {/* ─── MODAL 2: REGISTRAR DESPERFECTO (NUEVO) ─── */}
      {isDesperfectoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4" onClick={closeDesperfectoModal}>
          <div className="flex w-full max-w-lg max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-200 bg-gradient-to-b from-emerald-50 to-white px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Registro</div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Registrar desperfecto</h2>
                  <p className="mt-1 text-sm text-slate-500">Completa el formulario para registrar el desperfecto.</p>
                </div>
              <button
                type="button"
                onClick={closeDesperfectoModal}
                aria-label="Cerrar formulario"
                title="Cerrar formulario"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                <FiX className="h-4 w-4" aria-hidden="true" />
              </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              {desperfectoMsg && (
                <div className={`mb-4 rounded-xl border p-3 text-sm ${
                  desperfectoMsg.startsWith("ok:")
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}>
                  {desperfectoMsg.replace(/^(ok|error):/, "")}
                </div>
              )}
              <FormularioDesperfecto
                desperfectoItem={desperfectoItem}
                desperfectoForm={desperfectoForm}
                handleChange={handleDesperfectoChange}
                handleSubmit={handleDesperfectoSubmit}
                errores={erroresDesperfecto}
                enviando={desperfectoEnviando}
                cerrarModal={closeDesperfectoModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: ACTUALIZAR ESTADO DEL EQUIPO ─── */}
      {isEstadoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4" onClick={closeEstadoModal}>
          <div className="flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-200 bg-gradient-to-b from-emerald-50 to-white px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Estado</div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Actualizar estado</h2>
                  <p className="mt-1 text-sm text-slate-500">Cambia el estado del equipo seleccionado.</p>
                </div>
                <button
                  type="button"
                  onClick={closeEstadoModal}
                  aria-label="Cerrar formulario"
                  title="Cerrar formulario"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {estadoMsg && (
                <div className={`mb-4 rounded-xl border p-3 text-sm ${
                  estadoMsg.startsWith("ok:")
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}>
                  {estadoMsg.replace(/^(ok|error):/, "")}
                </div>
              )}
              <FormularioActualizarEstado
                equipo={estadoItem}
                onSubmit={handleEstadoSubmit}
                enviando={estadoEnviando}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: EDITAR LOTE (UBICACIÓN / ESTADO) ─── */}
      {isLoteEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4" onClick={closeLoteEdit}>
          <div className="flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-200 bg-gradient-to-b from-emerald-50 to-white px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Lote</div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Editar lote</h2>
                  <p className="mt-1 text-sm text-slate-500">{loteEditItem?.tipo} · Actualiza la cantidad y el estado.</p>
                </div>
                <button
                  type="button"
                  onClick={closeLoteEdit}
                  aria-label="Cerrar formulario"
                  title="Cerrar formulario"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              {errorLoteEdit && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <span><strong>Error:</strong> {errorLoteEdit}</span>
                  <button onClick={() => setErrorLoteEdit("")} className="ml-4 font-bold text-red-400 hover:text-red-600">✕</button>
                </div>
              )}
              <FormularioLote
                formData={loteEditData}
                handleChange={handleLoteEditChange}
                handleSubmit={handleLoteEditSubmit}
                statusOptions={statusOptions}
                errores={erroresLoteEdit}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 5: REGISTRAR ENTRADA (NUEVO LOTE) ─── */}
      {isAddLoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4" onClick={closeAddLote}>
          <div className="flex w-full max-w-md max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-200 bg-gradient-to-b from-emerald-50 to-white px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Entrada</div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Registrar entrada</h2>
                  <p className="mt-1 text-sm text-slate-500">{addLoteGroup?.tipo} · {addLoteGroup?.codigo} · Se agrega como un lote nuevo disponible.</p>
                </div>
                <button
                  type="button"
                  onClick={closeAddLote}
                  aria-label="Cerrar formulario"
                  title="Cerrar formulario"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              {errorAddLote && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <span><strong>Error:</strong> {errorAddLote}</span>
                  <button onClick={() => setErrorAddLote("")} className="ml-4 font-bold text-red-400 hover:text-red-600">✕</button>
                </div>
              )}
              <FormularioAgregarLote
                formData={addLoteData}
                handleChange={handleAddLoteChange}
                handleSubmit={handleAddLoteSubmit}
                errores={erroresAddLote}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 6: MOVER LOTE (TRANSFERIR / DEVOLVER) ─── */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-900/45 backdrop-blur-sm sm:items-center sm:p-4" onClick={closeTransferModal}>
          <div className="flex h-full w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-white shadow-none sm:h-auto sm:max-w-md sm:rounded-[24px] sm:border sm:border-slate-200 sm:shadow-[0_30px_80px_rgba(15,23,42,0.22)]" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-gradient-to-b from-indigo-50 to-white px-4 py-4 sm:static sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Lote</div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Mover lote</h2>
                  <p className="mt-1 text-sm text-slate-500">{transferLote?.tipo} · Trasladá el lote a un laboratorio o devolvelo al depósito.</p>
                </div>
                <button
                  type="button"
                  onClick={closeTransferModal}
                  aria-label="Cerrar formulario"
                  title="Cerrar formulario"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              {errorTransfer && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <span><strong>Error:</strong> {errorTransfer}</span>
                  <button onClick={() => setErrorTransfer("")} className="ml-4 font-bold text-red-400 hover:text-red-600">✕</button>
                </div>
              )}
              <FormularioTransferirLote
                lote={transferLote}
                onSubmit={handleTransferSubmit}
                cerrarModal={closeTransferModal}
                enviando={transferEnviando}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Equipamiento;