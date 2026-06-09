export function AppLayout({children, fullWidth = false }) {
  return (
    <div className="min-h-screen font-['DM_Sans',sans-serif] relative overflow-x-hidden ">
      {/* Background blobs: suaves, tonos mint claros */}
      <div className="fixed rounded-full blur-[120px] opacity-[0.05] pointer-events-none w-[680px] h-[680px] bg-emerald-200 -top-[200px] right-[6%]" />
      <div className="fixed rounded-full blur-[120px] opacity-[0.04] pointer-events-none w-[520px] h-[520px] bg-cyan-100 -bottom-[120px] left-[6%]" />
      <div className="fixed rounded-full blur-[140px] opacity-[0.03] pointer-events-none w-[420px] h-[420px] bg-teal-100 top-[32%] left-1/2 -translate-x-1/2" />

      {/* contenido principal*/}
      <div
        className={`relative z-10 ${
          fullWidth
            ? "w-full min-h-screen"
            : "max-w-7xl mx-auto px-6 py-8 min-h-screen"
        }`}
      >
        {children}
      </div>
    </div>
  );
}