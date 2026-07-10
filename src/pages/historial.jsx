import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/SharedUi";
import { Card } from "../components/equipamiento/Card";
import PanelDescartes from "../components/historial/PanelDescartes";
import PanelProximamente from "../components/historial/PanelProximamente";
import { FiRepeat, FiArchive, FiTool } from "react-icons/fi";

const tabs = [
  { id: "movimientos", label: "Movimientos", icon: FiRepeat },
  { id: "descartes", label: "Descartes", icon: FiArchive },
  { id: "mantenimiento", label: "Mantenimiento", icon: FiTool },
];

function Historial() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabs.some((t) => t.id === tabParam) ? tabParam : "descartes";

  const setActiveTab = (id) => {
    setSearchParams({ tab: id });
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Historial" />

      {/* Selector de pestañas */}
      <div className="mb-5 grid grid-cols-3 gap-2 rounded-[18px] border border-emerald-100 bg-emerald-50/40 p-1">
        {tabs.map(({ id, label, icon }) => {
          const isActive = id === activeTab;
          const TabIcon = icon;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex min-w-0 items-center justify-center gap-2 rounded-[14px] px-3 py-2 text-xs font-medium transition-all duration-200 sm:px-4 sm:text-sm ${
                isActive
                  ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100 font-semibold"
                  : "text-slate-500 hover:bg-white/80 hover:text-emerald-700"
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

      <Card padding="none" className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        {activeTab === "descartes" && <PanelDescartes />}
        {activeTab === "movimientos" && (
          <PanelProximamente
            titulo="Historial de movimientos de stock"
            descripcion="Registrará consumos, altas, ajustes, bajas y transferencias del inventario."
          />
        )}
        {activeTab === "mantenimiento" && (
          <PanelProximamente
            titulo="Historial de mantenimiento de equipos"
            descripcion="Registrará las intervenciones de mantenimiento sobre los equipos."
          />
        )}
      </Card>
    </div>
  );
}

export default Historial;
