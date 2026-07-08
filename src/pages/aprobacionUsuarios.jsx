import { useState, useEffect } from "react";
import {
  obtenerUsuarios,
  obtenerUsuariosPendientes,
  aprobarUsuario,
  rechazarUsuario,
} from "../services/usuarioService";
import { PageHeader } from "../components/SharedUi";

import {
  FiMail,
  FiHash,
  FiShield,
  FiCalendar,
  FiCheck,
  FiX,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const LIMIT = 12; // usuarios por página (3 columnas x 4 filas)

const formatFecha = (fechaStr) => {
  if (!fechaStr) return "—";
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return fechaStr;
  return fecha.toLocaleDateString();
};

const idDe = (u) => u._id || u.id;

const esPendiente = (u) => u.estado === "PENDIENTE";

export default function AprobacionUsuarios() {
  const [usuarios, setUsuarios] = useState([]); // página actual
  const [total, setTotal] = useState(0); // total de la fuente actual (para el paginador)
  const [page, setPage] = useState(1);
  const [kpis, setKpis] = useState({ total: 0, pendientes: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [cargandoPagina, setCargandoPagina] = useState(false);
  const [tab, setTab] = useState("pendientes");
  const [busqueda, setBusqueda] = useState("");
  const [errorOperacion, setErrorOperacion] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMIT));

  // KPIs correctos: se toman de la metadata `total` de cada endpoint, no del
  // largo de la página. Activos = total de usuarios − pendientes (los
  // suspendidos son un estado sin uso práctico según la doc del backend).
  const cargarKpis = async () => {
    try {
      const [resTodos, resPend] = await Promise.all([
        obtenerUsuarios({ limit: 1 }),
        obtenerUsuariosPendientes({ limit: 1 }),
      ]);
      setKpis({ total: resTodos.total, pendientes: resPend.total });
    } catch (error) {
      console.error("Error al cargar métricas de usuarios:", error.message);
    }
  };

  // Carga una página concreta de la fuente indicada (tab/page explícitos para
  // no depender del closure al cambiar de pestaña).
  const cargarPagina = async (paginaObjetivo, tabActual) => {
    setCargandoPagina(true);
    try {
      const fetchFn =
        tabActual === "pendientes" ? obtenerUsuariosPendientes : obtenerUsuarios;
      const data = await fetchFn({ page: paginaObjetivo, limit: LIMIT });
      setUsuarios(data.usuarios);
      setTotal(data.total);
      setPage(data.page);
    } catch (error) {
      console.error("Error al cargar usuarios:", error.message);
    } finally {
      setCargandoPagina(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [resTodos, resPend] = await Promise.all([
          obtenerUsuarios({ limit: 1 }),
          obtenerUsuariosPendientes({ limit: 1 }),
        ]);
        setKpis({ total: resTodos.total, pendientes: resPend.total });

        const data = await obtenerUsuariosPendientes({ page: 1, limit: LIMIT });
        setUsuarios(data.usuarios);
        setTotal(data.total);
        setPage(data.page);
      } catch (error) {
        console.error("Error al cargar usuarios:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const cambiarTab = (t) => {
    if (t === tab) return;
    setTab(t);
    setBusqueda("");
    cargarPagina(1, t);
  };

  const irAPagina = (p) => {
    if (p < 1 || p > totalPaginas || p === page || cargandoPagina) return;
    cargarPagina(p, tab);
  };

  const mostrarError = (msg) => {
    setErrorOperacion(msg);
    setTimeout(() => setErrorOperacion(""), 4000);
  };

  // Tras aprobar/rechazar recarga la página actual y los KPIs. Si la página
  // quedó vacía (era el último registro), retrocede una.
  const recargarTrasAccion = async () => {
    await cargarKpis();
    try {
      const fetchFn =
        tab === "pendientes" ? obtenerUsuariosPendientes : obtenerUsuarios;
      const data = await fetchFn({ page, limit: LIMIT });
      if (data.usuarios.length === 0 && page > 1) {
        await cargarPagina(page - 1, tab);
      } else {
        setUsuarios(data.usuarios);
        setTotal(data.total);
        setPage(data.page);
      }
    } catch (error) {
      console.error("Error al recargar usuarios:", error.message);
    }
  };

  // ─── Lógica aislada para swapear window.confirm por un modal en el futuro ───
  const handleAprobar = async (usuario) => {
    const id = idDe(usuario);
    const confirmar = window.confirm(
      `¿Aprobar a ${usuario.nombre} ${usuario.apellido}? Se activará su cuenta y se le enviará un correo.`
    );
    if (!confirmar) return;

    setProcesandoId(id);
    try {
      await aprobarUsuario(id);
      await recargarTrasAccion();
    } catch (error) {
      console.error("Error al aprobar usuario:", error.response?.data || error);
      const msg =
        error.response?.status === 403
          ? "No tenés permisos para aprobar usuarios."
          : error.response?.status === 409
          ? "El usuario ya no está pendiente de aprobación."
          : error.response?.data?.error || "No se pudo aprobar el usuario.";
      mostrarError(msg);
    } finally {
      setProcesandoId(null);
    }
  };

  const handleRechazar = async (usuario) => {
    const id = idDe(usuario);
    const confirmar = window.confirm(
      `¿Rechazar la solicitud de ${usuario.nombre} ${usuario.apellido}? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    setProcesandoId(id);
    try {
      await rechazarUsuario(id);
      await recargarTrasAccion();
    } catch (error) {
      console.error("Error al rechazar usuario:", error.response?.data || error);
      const msg =
        error.response?.status === 403
          ? "No tenés permisos para rechazar usuarios."
          : error.response?.data?.error || "No se pudo rechazar el usuario.";
      mostrarError(msg);
    } finally {
      setProcesandoId(null);
    }
  };

  // La búsqueda filtra en cliente sobre la página actual (el backend no
  // ofrece búsqueda por texto todavía).
  const termino = busqueda.trim().toLowerCase();
  const lista = termino
    ? usuarios.filter((u) => {
        const nombreCompleto = `${u.nombre || ""} ${u.apellido || ""}`.toLowerCase();
        return (
          nombreCompleto.includes(termino) ||
          (u.email || "").toLowerCase().includes(termino)
        );
      })
    : usuarios;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Cargando usuarios...
      </div>
    );
  }

  const activos = Math.max(kpis.total - kpis.pendientes, 0);

  return (
    <div className="min-h-screen text-slate-800 px-4 sm:px-6 lg:px-8 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Aprobación de usuarios"
        />
      </div>

      {/* ERROR DE OPERACIÓN */}
      {errorOperacion && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex justify-between items-center">
          <span><strong>Error:</strong> {errorOperacion}</span>
          <button onClick={() => setErrorOperacion("")} className="ml-4 text-red-400 hover:text-red-600 font-bold">✕</button>
        </div>
      )}

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">Total</p>
          <p className="text-2xl font-bold">{kpis.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">Pendientes</p>
          <p className="text-2xl font-bold">{kpis.pendientes}</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">Activos</p>
          <p className="text-2xl font-bold">{activos}</p>
        </div>
      </div>

      {/* TABS + BUSCADOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-10">
        <div className="flex gap-2">
          {["pendientes", "todos"].map((t) => (
            <button
              key={t}
              onClick={() => cambiarTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "text-slate-500 bg-white border border-slate-200 hover:text-emerald-600 hover:border-emerald-200"
              }`}
            >
              {t === "pendientes" ? `Pendientes (${kpis.pendientes})` : "Todos"}
            </button>
          ))}
        </div>

        <div className="relative md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar en esta página..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* CONTENEDOR */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 w-full h-40 bg-emerald-100 opacity-30 rounded-[2rem]" />
        <div className="relative z-10 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-lg p-8 md:p-10">
          <div className="absolute -top-5 left-10 right-10 h-6 rounded-t-[2rem] bg-stone-700 rounded-sm" />

          {/* Overlay al cambiar de página */}
          {cargandoPagina && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-[2.5rem]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          )}

          {lista.length === 0 ? (
            <p className="text-center text-slate-500 py-10">
              {termino
                ? "No se encontraron usuarios en esta página."
                : tab === "pendientes"
                ? "No hay usuarios pendientes de aprobación."
                : "No se encontraron usuarios."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {lista.map((u) => {
                const id = idDe(u);
                const pendiente = esPendiente(u);
                const procesando = procesandoId === id;

                return (
                  <div
                    key={id}
                    className="relative bg-white border border-slate-200 rounded-3xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-bold text-slate-800">
                        {u.nombre} {u.apellido}
                      </h2>

                      {pendiente && (
                        <div className="flex gap-2">
                          <button
                            title="Aprobar usuario"
                            onClick={() => handleAprobar(u)}
                            disabled={procesando}
                            className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            title="Rechazar usuario"
                            onClick={() => handleRechazar(u)}
                            disabled={procesando}
                            className="p-1 rounded-lg hover:bg-red-50 text-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-emerald-700 mt-1 font-medium flex items-center gap-2">
                      <FiMail className="text-slate-500" />
                      {u.email}
                    </p>

                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <FiShield className="text-slate-500" />
                        Rol: <span className="font-medium text-slate-700">{u.rol}</span>
                      </p>
                      {u.legajo && (
                        <p className="flex items-center gap-2">
                          <FiHash className="text-slate-500" />
                          Legajo: {u.legajo}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <FiCalendar className="text-slate-500" />
                        Registrado: {formatFecha(u.createdAt)}
                      </p>
                    </div>

                    <div className="flex justify-end items-center mt-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          u.estado === "ACTIVO"
                            ? "bg-emerald-100 text-emerald-700"
                            : u.estado === "SUSPENDIDO"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {u.estado?.toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PAGINADOR */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => irAPagina(page - 1)}
            disabled={page <= 1 || cargandoPagina}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-600 disabled:hover:border-slate-200"
          >
            <FiChevronLeft /> Anterior
          </button>

          <span className="text-sm text-slate-500">
            Página {page} de {totalPaginas}
          </span>

          <button
            onClick={() => irAPagina(page + 1)}
            disabled={page >= totalPaginas || cargandoPagina}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-600 disabled:hover:border-slate-200"
          >
            Siguiente <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
