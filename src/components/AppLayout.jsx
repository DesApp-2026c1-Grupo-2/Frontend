export function AppLayout({children, fullWidth = false }) {
  return (
    <div className="min-h-screen  font-['DM_Sans',sans-serif] relative overflow-hidden bg-gradient-to-br from-[#f6fff9] to-[#e7fff0]">

      {/* Background blobs: suaves, tonos mint claros */}
      <div className="fixed rounded-full blur-[120px] opacity-[0.08] pointer-events-none w-[680px] h-[680px] bg-emerald-200 -top-[200px] right-[6%]" />
      <div className="fixed rounded-full blur-[120px] opacity-[0.06] pointer-events-none w-[520px] h-[520px] bg-cyan-100 -bottom-[120px] left-[6%]" />
      <div className="fixed rounded-full blur-[140px] opacity-[0.04] pointer-events-none w-[420px] h-[420px] bg-teal-100 top-[32%] left-1/2 -translate-x-1/2" />

      {/* Grid overlay claro (cuadrícula) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />

      {/* contenido principal*/}
      <div
        className={`relative z-10 ${
          fullWidth
            ? "w-full h-screen"
            : "py-8 px-4 sm:px-6 lg:px-10 max-w-[1320px] mx-auto"
        }`}
      >
        {children}
      </div>
    </div>
  );
}