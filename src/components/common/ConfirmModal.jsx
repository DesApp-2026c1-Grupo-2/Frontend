import { FiX, FiAlertTriangle, FiTrash2, FiLogOut, FiCheckCircle, FiInfo } from "react-icons/fi";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Confirmar acción?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  tipo = "danger", // danger | warning | success | info
}) {
  if (!isOpen) return null;

  const colorMap = {
    danger: {
      bgIcon: "bg-red-50 text-red-600",
      btnConfirm: "bg-red-600 hover:bg-red-700 shadow-red-200 focus:ring-red-500",
      icon: <FiTrash2 size={24} />,
    },
    warning: {
      bgIcon: "bg-amber-50 text-amber-600",
      btnConfirm: "bg-amber-500 hover:bg-amber-600 shadow-amber-200 focus:ring-amber-500",
      icon: <FiAlertTriangle size={24} />,
    },
    success: {
      bgIcon: "bg-emerald-50 text-emerald-600",
      btnConfirm: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 focus:ring-emerald-500",
      icon: <FiCheckCircle size={24} />,
    },
    info: {
      bgIcon: "bg-blue-50 text-blue-600",
      btnConfirm: "bg-blue-600 hover:bg-blue-700 shadow-blue-200 focus:ring-blue-500",
      icon: <FiInfo size={24} />,
    },
  };

  const currentColors = colorMap[tipo] || colorMap.info;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col p-6">
        
        {/* BOTÓN CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
        >
          <FiX size={20} />
        </button>

        {/* CONTENIDO */}
        <div className="flex gap-4 items-start mt-2">
          <div className={`p-3 rounded-2xl shrink-0 ${currentColors.bgIcon}`}>
            {currentColors.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-800 leading-snug">
              {title}
            </h3>
            <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 transition-all focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2.5 rounded-xl text-sm text-white font-bold transition-all shadow-md focus:outline-none ${currentColors.btnConfirm}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
