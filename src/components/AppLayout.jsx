export function AppLayout({ children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        .dash-root {
          min-height: 100vh;
          background: #f0fdf4;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .bg-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          pointer-events: none;
        }
      `}</style>

      <div className="dash-root">
        {/* Background blobs */}
        <div className="bg-blob" style={{ width: 600, height: 600, background: "#16a34a", top: -200, right: -200 }} />
        <div className="bg-blob" style={{ width: 400, height: 400, background: "#4ade80", bottom: -100, left: -100 }} />
        <div className="bg-blob" style={{ width: 300, height: 300, background: "#86efac", top: "50%", left: "40%" }} />

        {/* Dot grid */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "radial-gradient(circle, #bbf7d0 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.5,
        }} />

        {/* Contenido principal */}
        <div style={{ position: "relative", zIndex: 1, padding: "60px 48px", maxWidth: 1100, margin: "0 auto" }}>
          {children}
        </div>
      </div>
    </>
  );
}