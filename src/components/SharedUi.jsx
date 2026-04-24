export function PageHeader({ preTitle, title, description }) {
  return (
    <div className="mb-16 animate-float-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-green-600 to-green-400 shadow-[0_0_0_3px_#dcfce7]" />
        <span className="text-green-600 font-semibold text-[13px] tracking-[0.1em] uppercase">
          {preTitle}
        </span>
      </div>
      
      <h1 className="font-['Playfair_Display',serif] text-[clamp(2.2rem,5vw,3.4rem)] font-bold text-green-900 leading-[1.15] m-0">
        {title}
      </h1>
      
      <div className="w-12 h-[3px] bg-gradient-to-r from-green-600 to-green-400 rounded mt-2.5" />
      
      {description && (
        <p className="mt-4 text-[#4b7a5a] text-base font-light max-w-[440px]">
          {description}
        </p>
      )}
    </div>
  );
}

export function StatBadge({ text }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-600 text-xs font-medium py-1 px-2.5 rounded-[20px] mt-3.5">
      <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="5"/>
      </svg>
      {text}
    </div>
  );
}