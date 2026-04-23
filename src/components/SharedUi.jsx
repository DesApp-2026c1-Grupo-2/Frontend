export function PageHeader({ preTitle, title, description }) {
  return (
    <div className="mb-16" style={{ animation: "floatIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: "linear-gradient(135deg, #16a34a, #4ade80)",
          boxShadow: "0 0 0 3px #dcfce7",
        }} />
        <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {preTitle}
        </span>
      </div>
      
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
        fontWeight: 700,
        color: "#14532d",
        lineHeight: 1.15,
        margin: 0,
      }}>
        {title}
      </h1>
      
      <div style={{ width: 48, height: 3, background: "linear-gradient(90deg, #16a34a, #4ade80)", borderRadius: 4, marginTop: 10 }} />
      
      {description && (
        <p style={{ marginTop: 16, color: "#4b7a5a", fontSize: 16, fontWeight: 300, maxWidth: 440 }}>
          {description}
        </p>
      )}
    </div>
  );
}

export function StatBadge({ text }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "#f0fdf4", border: "1px solid #bbf7d0",
      color: "#16a34a", fontSize: 12, fontWeight: 500,
      padding: "4px 10px", borderRadius: 20, marginTop: 14
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <circle cx="5" cy="5" r="5"/>
      </svg>
      {text}
    </div>
  );
}