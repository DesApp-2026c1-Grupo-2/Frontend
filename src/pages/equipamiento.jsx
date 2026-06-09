import { useMemo, useState, useEffect } from "react";
import { Card } from "../components/equipamiento/Card";
import { PageHeader } from "../components/SharedUi";
import * as equipamientoService from "../services/equipamiento";
import FormularioEquipamiento from "../components/equipamiento/FormularioEquipamiento";
import FormularioEquipo from "../components/equipamiento/FormularioEquipo";

import {
  FiEdit2,//Lapiz
  FiTrash2, //Basura
  FiUsers,//Usuarios
  FiMonitor,//Monitor para equipos
} from "react-icons/fi";
import { VscFileSubmodule } from "react-icons/vsc"; // Caja para materiales
import { GiMaterialsScience } from "react-icons/gi"; // Materiales reactivos
import { MdScience } from "react-icons/md";        // Matraz para sustancias
import { AiOutlinePlus } from "react-icons/ai"; // Icono de suma para nuevo registro
import { MdOutlineManageSearch } from "react-icons/md"; // Icono para estadísticas de busqueda

const tabs = [
  { label: "Equipos",           icon: FiMonitor       },
  { label: "Materiales",        icon: VscFileSubmodule },
  { label: "Reactivos",         icon: GiMaterialsScience },
  { label: "Sustancias basicas",icon: MdScience        },
];

// Mapeo de tipos del backend a categorías del frontend
const tipoToCategoria = {
  'material': 'Materiales',
  'reactivo': 'Reactivos',
  'sustancia': 'Sustancias basicas',
  'equipo': 'Equipos'
};

// Función para mapear datos del backend a la estructura del frontend
const mapearDatosBackend = (items, lotes) => {
  const inventario = [];
  const lotesPorItemId = new Map();

  lotes.forEach(lote => {
    const itemId = typeof lote.itemId === 'object' ? lote.itemId._id : lote.itemId;
    const lotesDelItem = lotesPorItemId.get(itemId);

    if (lotesDelItem) {
      lotesDelItem.push(lote);
    } else {
      lotesPorItemId.set(itemId, [lote]);
    }
  });
  
  items.forEach(item => {
    const lotesDelItem = lotesPorItemId.get(item._id) || [];
    
    lotesDelItem.forEach(lote => {
      inventario.push({
        id: lote._id,
        loteId: lote._id,
        itemId: item._id,
        categoria: tipoToCategoria[item.tipo] || 'Equipos',
        tipo: item.nombre,
        codigo: item.codigo,
        ubicacion: lote.ubicacion,
        estado: mapearEstado(lote.estado),
        cantidad: lote.cantidadDisponible,
        movilidad: lote.movilidad || "Fija",
        unidad: item.unidad,
        esConsumible: item.esConsumible,
      });
    });
  });
  
  return inventario;
};

// Función para mapear los equipos desde el backend a la estructura del frontend
const mapearEquiposBackend = (equipos) => {
  return equipos.map(equipo => {
    let ubicacion = "Sin asignar";
    if (equipo.laboratorioId) {
      ubicacion = typeof equipo.laboratorioId === 'object' ? equipo.laboratorioId.nombre : "Laboratorio asignado";
    } else if (equipo.edificioId) {
      ubicacion = typeof equipo.edificioId === 'object' ? equipo.edificioId.nombre : "Edificio asignado";
    }

    return {
      id: equipo.id || equipo._id,
      itemId: equipo.id || equipo._id,
      categoria: 'Equipos',
      tipo: equipo.nombre, // Usamos el nombre del equipo como "tipo" en la UI compartida
      codigo: equipo.codigo,
      ubicacion: ubicacion,
      estado: mapearEstado(equipo.estado),
      cantidad: 1, // Cada equipo es una unidad física única
      movilidad: equipo.esFijo ? "Fija" : "Movible",
      esConsumible: false,
      equipoOriginal: equipo // Guardamos el objeto original en memoria para la edición
    };
  });
};

// Mapear estados del backend al frontend
const mapearEstado = (estadoBackend) => {
  const estadoMap = {
    'disponible': 'Disponible',
    'reservado': 'Reservado',
    'en_uso': 'En uso',
    'descartado': 'Descartado',
    'mantenimiento': 'Mantenimiento',
    'fuera_de_servicio': 'Fuera de servicio',
    'fuera de servicio': 'Fuera de servicio',
  };
  return estadoMap[estadoBackend] || 'Disponible';
};

// Fuente única de verdad para estados y estilos asociados
const statusConfig = {
  Disponible: {
    statusClassName: "bg-emerald-100 text-emerald-700 border-emerald-200",
    alertClassName: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Reservado: {
    statusClassName: "bg-amber-100 text-amber-700 border-amber-200",
    alertClassName: "bg-amber-50 text-amber-700 border-amber-200",
  },
  "En uso": {
    statusClassName: "bg-blue-100 text-blue-700 border-blue-200",
    alertClassName: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Descartado: {
    statusClassName: "bg-rose-100 text-rose-700 border-rose-200",
    alertClassName: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const statusOptions = Object.keys(statusConfig);

const DEFAULT_FORM_DATA = {
  nombre: "",
  cantidad: "1",
  estado: "Disponible",
  ubicacion: "",
  unidad: "unidad",
  movilidad: "Fija",
};

const DEFAULT_EQUIPOS_FORM_DATA = {
  nombre: "",
  codigo: "",
  tipo: "",
  esFijo: "",
  estado: "disponible",
  edificioId: "",
  laboratorioId: "",
  cantidad: "1",
  ubicacion: "",
  unidad: "unidad",
  movilidad: "Fija",
};

/* ─── Iconos generales ─── */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
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

/* ─── Ícono "i" para alertas ─── */
function InfoIcon({ colorClass = "text-amber-500" }) {
  return (
    <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-current ${colorClass}`}>
      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 8h.01M12 12v4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ─── Pills de estado ─── */
function StatusPill({ status }) {
  const statusMap = {
    Disponible: "bg-emerald-100 text-emerald-700",
    Reservado: "bg-amber-100 text-amber-700",
    "Fuera de servicio": "bg-rose-100 text-rose-700",
    Mantenimiento: "bg-yellow-100 text-yellow-700",
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

/* ─── Alerta individual con colores por estado ─── */
function AlertCard({ item }) {
  const styleMap = {
    Reservado: {
      bg: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-500",
    },
    "Fuera de servicio": {
      bg: "bg-rose-50 border-rose-200",
      iconColor: "text-rose-500",
    },
    Mantenimiento: {
      bg: "bg-yellow-50 border-yellow-200",
      iconColor: "text-yellow-500",
    },
  };

  const style = styleMap[item.estado] || { bg: "bg-slate-50 border-slate-200", iconColor: "text-slate-400" };

  return (
    <div className={`rounded-xl border p-3 ${style.bg}`}>
      <div className="flex items-center gap-3">
        <InfoIcon colorClass={style.iconColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">{item.tipo}</span>
            <StatusPill status={item.estado} />
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            Código {item.codigo} · {item.ubicacion} · {item.cantidad} {item.cantidad === 1 ? "unidad" : "unidades"}
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryCard({ item, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900">{item.tipo}</h3>
            <StatusPill status={item.estado} />
          </div>
          <p className="mt-1 text-xs text-slate-500">Código {item.codigo}</p>
        </div>
        <MobilityPill mobility={item.movilidad} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cantidad</span>
          <span className="mt-1 block font-semibold text-slate-900">{item.cantidad}</span>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ubicación</span>
          <span className="mt-1 block font-semibold text-slate-900">{item.ubicacion}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-600 transition hover:bg-cyan-100"
          aria-label={`Editar ${item.tipo}`}
        >
          <FiEdit2 />
          Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
          aria-label={`Eliminar ${item.tipo}`}
        >
          <FiTrash2 />
          Eliminar
        </button>
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
function Equipamiento() {
  //const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tabs[0].label);
  const [query, setQuery] = useState("");
  const [inventory, setInventory] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", cantidad: "1", estado: "Disponible", ubicacion: "", unidad: "unidad", movilidad: "Fija" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del backend al montar el componente
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const [items, lotes, equipos] = await Promise.all([
          equipamientoService.getItems(),
          equipamientoService.getLotes(),
          equipamientoService.getEquipos()
        ]);
        const inventarioMapeado = mapearDatosBackend(items, lotes);
        const equiposMapeados = mapearEquiposBackend(equipos);
        setInventory([...inventarioMapeado, ...equiposMapeados]);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar los datos del inventario");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // Funcion helper para recargar datos
  const recargarInventario = async () => {
    try {
      const [items, lotes, equipos] = await Promise.all([
        equipamientoService.getItems(),
        equipamientoService.getLotes(),
        equipamientoService.getEquipos()
      ]);
      const inventarioMapeado = mapearDatosBackend(items, lotes);
      const equiposMapeados = mapearEquiposBackend(equipos);
      setInventory([...inventarioMapeado, ...equiposMapeados]);
    } catch (err) {
      console.error("Error al recargar datos:", err);
      setError("No se pudieron recargar los datos");
    }
  };

  const handleDeleteItem = async (item) => {
    const confirmDelete = window.confirm(`¿Seguro que quieres borrar ${item.tipo}?`);
    if (!confirmDelete) return;

    try {
      if (item.categoria === "Equipos") {
        await equipamientoService.deleteEquipo(item.id);
      } else {
        await equipamientoService.deleteLote(item.loteId);
      }
      await recargarInventario();
    } catch (err) {
      console.error("Error al eliminar el registro:", err);
      alert("No se pudo eliminar el registro: " + (err.response?.data?.error || err.message));
    }
  };

  const resetForm = () => setFormData({ nombre: "", cantidad: "1", estado: "Disponible", ubicacion: "", unidad: "unidad", movilidad: "Fija" });
  const openForm = () => {
  setEditingItem(null);

  if (activeTab === "Equipos") {
    setFormData({
      nombre: "",
      codigo: "",
      tipo: "",
      esFijo: "",
      estado: "disponible",
      edificioId: "",
      laboratorioId: "",
      cantidad: "1",
      ubicacion: "",
      unidad: "unidad",
      movilidad: "Fija",
    });
  } else {
    resetForm();
  }

  setIsFormOpen(true);
};

  const openEditForm = (item) => {
    setEditingItem(item);
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
    ubicacion: item.ubicacion,
    unidad: item.unidad || "unidad",
    movilidad: item.movilidad || "Fija",
  });
} else {
  setFormData({
    nombre: item.tipo,
    cantidad: String(item.cantidad),
    estado: item.estado,
    ubicacion: item.ubicacion,
    unidad: item.unidad || "unidad",
    movilidad: item.movilidad || "Fija",
  });
}
  setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
    ...prev,
    [name]:
      name === "esFijo"
        ? value === "true"
        : value,
    }));
  };

  const estadoToBackend = (estado) => {
    const estadoMap = {
      Disponible: "disponible",
      Reservado: "reservado",
      "En uso": "en_uso",
      Descartado: "descartado",
    };

    return estadoMap[estado] || estado.toLowerCase().replace(/\s+/g, "_");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // --- 1. MANEJO ESPECÍFICO PARA EQUIPOS ---
    if (activeTab === "Equipos") {
      const isFijo = formData.esFijo === true || String(formData.esFijo) === "true";
      
      // Interceptamos los IDs: si es móvil, forzamos null en edificioId y laboratorioId
      const payloadEquipo = {
        nombre: formData.nombre.trim(),
        codigo: formData.codigo.trim(),
        tipo: formData.tipo.trim(),
        esFijo: isFijo,
        estado: formData.estado,
        edificioId: isFijo && formData.edificioId ? formData.edificioId : null,
        laboratorioId: isFijo && formData.laboratorioId ? formData.laboratorioId : null,
      };

      if (!payloadEquipo.nombre || !payloadEquipo.codigo || !payloadEquipo.tipo) {
        alert("Por favor completa Nombre, Código y Tipo para el equipo.");
        return;
      }

      try {
        if (editingItem) {
          // Extraemos el ID del registro seleccionado para editar
          const equipoId = editingItem.itemId || editingItem.id;
          await equipamientoService.updateEquipo(equipoId, payloadEquipo);
        } else {
          await equipamientoService.createEquipo(payloadEquipo);
        }
        
        await recargarInventario();
        closeForm();
        resetForm();
      } catch (err) {
        console.error("Error al guardar equipo:", err);
        alert("Error al guardar el equipo: " + (err.response?.data?.error || err.message));
      }
      return; // Fin de la ejecución para Equipos (Evita que pase a la lógica de Lotes/Items)
    }

    // --- 2. MANEJO PARA ITEMS Y LOTES (Materiales, Reactivos, Sustancias) ---
    const nombre = formData.nombre.trim();
    const cantidad = Number.parseInt(formData.cantidad, 10);
    const ubicacion = formData.ubicacion.trim();
    
    if (!nombre || Number.isNaN(cantidad) || cantidad < 1 || !ubicacion) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      if (editingItem) {
        const tipoItem = Object.keys(tipoToCategoria).find(
          (key) => tipoToCategoria[key] === editingItem.categoria
        ) || "material";

        await equipamientoService.updateItem(editingItem.itemId, {
          tipo: tipoItem,
          nombre,
          codigo: editingItem.codigo,
          unidad: formData.unidad,
          esConsumible: tipoItem !== "equipo",
          requiereReceta: tipoItem === "reactivo" ? false : undefined,
        });

        await equipamientoService.updateLote(editingItem.loteId, {
          cantidadDisponible: cantidad,
          ubicacion,
          estado: estadoToBackend(formData.estado),
          movilidad: formData.movilidad,
        });
      } else {
        // Determinar tipo basado en la categoría activa
        const tipoItem = Object.keys(tipoToCategoria).find(
          (key) => tipoToCategoria[key] === activeTab
        ) || "material";

        // Generar código
        const codePrefix = activeTab === "Materiales" ? "MT" : activeTab === "Reactivos" ? "RC" : activeTab === "Sustancias basicas" ? "SB" : "EQ";
        const nextNumber = inventory
          .filter((item) => item.categoria === activeTab)
          .reduce((max, item) => {
            const [, num = "0"] = item.codigo.split("-");
            const n = Number.parseInt(num, 10);
            return Number.isNaN(n) ? max : Math.max(max, n);
          }, 0) + 1;
        const codigo = `${codePrefix}-${String(nextNumber).padStart(3, "0")}`;

        // Crear el Item
        const nuevoItem = await equipamientoService.createItem({
          tipo: tipoItem,
          nombre,
          codigo,
          unidad: formData.unidad,
          esConsumible: tipoItem !== "equipo",
          requiereReceta: tipoItem === "reactivo" ? false : undefined,
        });

        try {
          // Crear el Lote asociado
          await equipamientoService.createLote({
            itemId: nuevoItem._id,
            cantidadDisponible: cantidad,
            ubicacion,
            estado: estadoToBackend(formData.estado),
            movilidad: formData.movilidad,
          });
        } catch (loteError) {
          if (nuevoItem?._id && typeof equipamientoService.deleteItem === "function") {
            try {
              await equipamientoService.deleteItem(nuevoItem._id);
            } catch (rollbackError) {
              console.error("No se pudo revertir el item creado tras fallar el lote:", rollbackError);
            }
          }

          throw loteError;
        }
      }

      // Recargar datos
      await recargarInventario();
      closeForm();
      resetForm();
    } catch (err) {
      console.error("Error al guardar item/lote:", err);
      alert("Error al guardar el ítem: " + (err.response?.data?.error || err.message));
    }
  };

  const alertItems = inventory.filter((i) => i.estado !== "Disponible");

  const stats = [
    { title: "Equipos registrados", value: inventory.filter(i => i.categoria === "Equipos").length, subtitle: "Inventario general", hex: "#06b6d4" },
    { title: "Materiales", value: inventory.filter(i => i.categoria === "Materiales").length, subtitle: "Categoría activa", hex: "#4f46e5" },
    { title: "Reactivos", value: inventory.filter(i => i.categoria === "Reactivos").length, subtitle: "Categoría activa", hex: "#f59e0b" },
    { title: "Alertas activas", value: alertItems.length, subtitle: "Estados por revisar", hex: "#f43f5e" },
  ];

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return inventory.filter((item) => {
      const matchesCategory = item.categoria === activeTab;
      const matchesQuery =
        !normalizedQuery ||
        item.tipo.toLowerCase().includes(normalizedQuery) ||
        item.codigo.toLowerCase().includes(normalizedQuery) ||
        item.ubicacion.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeTab, inventory, query]);

  return (
    <div className="min-h-screen  text-slate-800">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <PageHeader
          title="Equipamiento"
        />

        {/* Stats Card */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
            <Card key={s.title} padding="none" className="relative overflow-hidden rounded-[24px] border border-emerald-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              {/* Badge estilo imagen: visible en pantallas pequeñas, el número grande queda en escritorio */}
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
                  Últimos movimientos de stock
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">Usa tus filtros para ver por categoría los registros cargados.</p>
              </div>
              <button
                type="button"
                onClick={openForm}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 sm:mt-0 sm:w-auto cursor-pointer"
              >
                <span className="text-base leading-none"><AiOutlinePlus /></span>
                Nuevo equipo
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
                    onClick={() => setActiveTab(label)}
                    className={`flex min-w-0 items-center justify-center gap-2 rounded-[14px] px-3 py-2 text-xs font-medium transition-all duration-200 sm:shrink-0 sm:justify-start sm:px-4 sm:text-sm ${
                      isActive
                        ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100 font-semibold"
                        : "text-slate-500 hover:text-emerald-700 hover:bg-white/80"
                    }`}
                  >
                    <span className={isActive ? "text-emerald-600" : "text-slate-400"}>
                      <TabIcon />
                    </span>
                    {label}
                  </button>
                );
              })}
              </div>

              {/* Búsqueda */}
              <div className="mb-5 relative w-full max-w-full sm:max-w-sm">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <MdOutlineManageSearch />
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar equipo..."
                  className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="px-4 py-5 sm:px-6">
              {/* Vista móvil */}
              <div className="space-y-3 md:hidden">
                {loading ? (
                  <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8">
                    <div className="text-center ">
                      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
                      <p className="text-sm text-slate-500">Cargando inventario...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-medium text-rose-700">{error}</p>
                  </div>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      onEdit={() => openEditForm(item)}
                      onDelete={() => handleDeleteItem(item)}
                    />
                  ))
                ) : (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    No hay resultados para el filtro seleccionado.
                  </p>
                )}
              </div>

              {/* Tabla escritorio */}
              <div className="hidden overflow-hidden rounded-[22px] border border-slate-200 md:block">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
                      <p className="text-sm text-slate-500">Cargando inventario...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="border-b border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-medium text-rose-700">{error}</p>
                  </div>
                ) : null}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Cantidad</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Codigo</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Ubicacion</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Estado</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Movilidad</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loading && filteredItems.map((item) => (
                        <tr key={item.id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-emerald-50/40 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900">{item.tipo}</td>
                          <td className="px-4 py-3 text-slate-500">{item.cantidad}</td>
                          <td className="px-4 py-3 text-slate-500">{item.codigo}</td>
                          <td className="px-4 py-3 text-slate-500">{item.ubicacion}</td>
                          <td className="px-4 py-3">
                            <StatusPill status={item.estado} />
                          </td>
                          <td className="px-4 py-3">
                            <MobilityPill mobility={item.movilidad} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(item)}
                                className="rounded-lg p-2 text-cyan-500 bg-cyan-50 hover:bg-cyan-100 transition"
                                aria-label={`Editar ${item.tipo}`}
                              >
                                <FiEdit2  />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item)}
                                className="rounded-lg p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 transition"
                                aria-label={`Eliminar ${item.tipo}`}
                              >
                                <FiTrash2  />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </Card>

          {/* Panel de alertas */}
          <div>
            <Card padding="none" className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-emerald-950">Alertas de inventario</h2>
                  <span className="shrink-0 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-600">
                    {alertItems.length} activas
                  </span>
                </div>
                <p className="mb-0 text-sm text-slate-500">Estados que requieren revisión o mantenimiento.</p>
              </div>

              <div className="flex flex-col gap-3 p-5">
                {alertItems.map((item) => (
                  <AlertCard key={item.id} item={item} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal formulario */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-900/45 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={closeForm}
        >
          <div
            className="flex h-full w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-white shadow-none sm:h-auto sm:max-w-lg sm:rounded-[28px] sm:border sm:border-slate-200 sm:shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-gradient-to-b from-emerald-50 to-white px-4 py-4 sm:static sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                    Registro
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    {editingItem ? `Editar ${editingItem.tipo}` : `Nuevo ${activeTab.slice(0, -1).toLowerCase()}`}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {editingItem ? "Actualiza los campos y guarda los cambios." : "Completa el formulario para registrar el ítem."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              {activeTab === "Equipos" ? (
              <FormularioEquipo
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                cerrarModal={closeForm}
              />
            ) : (
              <FormularioEquipamiento
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                cerrarModal={closeForm}
                statusOptions={statusOptions}
              />
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Equipamiento;