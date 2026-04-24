import { StatBadge } from "./SharedUi";

export function ModuleCard({ title, description, stats, icon, onClick, delayIndex }) {
  return (
    <div 
      className="group relative bg-white border-[1.5px] border-green-100 rounded-[24px] pt-9 px-8 pb-8 cursor-pointer overflow-hidden transition-all duration-[320ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_2px_20px_rgba(22,163,74,0.06)] hover:-translate-y-1.5 hover:scale-[1.012] hover:border-green-300 hover:shadow-[0_20px_60px_rgba(22,163,74,0.14),0_4px_20px_rgba(22,163,74,0.1)] animate-float-in"
      onClick={onClick}
      style={{ animationDelay: `${delayIndex * 0.08}s` }}
    >
      {/* Línea superior animada (reemplazo del ::before) */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-600 to-green-400 origin-left scale-x-0 transition-transform duration-[350ms] ease-out group-hover:scale-x-100" />

      {/* Icono */}
      <div className="w-[72px] h-[72px] rounded-[18px] bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-green-600 mb-6 border border-green-200 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-green-600 group-hover:to-green-700 group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_8px_25px_rgba(22,163,74,0.35)]">
        {icon}
      </div>

      {/* Textos */}
      <h2 className="font-['Playfair_Display',serif] text-[1.45rem] font-bold text-green-900 mb-2">
        {title}
      </h2>
      <p className="text-[#4b7a5a] text-sm leading-relaxed m-0 font-light">
        {description}
      </p>

      <StatBadge text={stats} />
    </div>
  );
} 