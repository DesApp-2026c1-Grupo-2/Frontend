export function AppLayout({children}) {
  return (
    <div className="min-h-screen bg-green-50 font-['DM_Sans',sans-serif] relative overflow-hidden">

      {/* Background blobs */}
      <div className="fixed rounded-full blur-[80px] opacity-[0.18] pointer-events-none w-[600px] h-[600px] bg-green-600 -top-[200px] -right-[200px]" />
      <div className="fixed rounded-full blur-[80px] opacity-[0.18] pointer-events-none w-[400px] h-[400px] bg-green-400 -bottom-[100px] -left-[100px]" />
      <div className="fixed rounded-full blur-[80px] opacity-[0.18] pointer-events-none w-[300px] h-[300px] bg-green-300 top-1/2 left-[40%]" />

      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50 bg-[radial-gradient(circle,#bbf7d0_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* contenido principal*/}
      <div
        className={`relative z-10 ${
          fullWidth
            ? "w-full h-screen"
            : "py-[60px] px-12 max-w-[1100px] mx-auto"
        }`}
      >
        {children}
      </div>
    </div>
  );
}