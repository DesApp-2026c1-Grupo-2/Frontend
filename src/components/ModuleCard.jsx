import { StatBadge } from "./SharedUI";

export function ModuleCard({ title, description, stats, icon, onClick, delayIndex }) {
  return (
    <>
      <style>{`
        .module-card {
          background: white; border: 1.5px solid #dcfce7; border-radius: 24px;
          padding: 36px 32px 32px; cursor: pointer; position: relative;
          overflow: hidden; transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 2px 20px rgba(22, 163, 74, 0.06);
          animation: floatIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .module-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #16a34a, #4ade80);
          transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease;
        }
        .module-card:hover {
          transform: translateY(-6px) scale(1.012); border-color: #86efac;
          box-shadow: 0 20px 60px rgba(22, 163, 74, 0.14), 0 4px 20px rgba(22, 163, 74, 0.1);
        }
        .module-card:hover::before { transform: scaleX(1); }
        
        .icon-wrap {
          width: 72px; height: 72px; border-radius: 18px;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          display: flex; align-items: center; justify-content: center;
          color: #16a34a; margin-bottom: 24px; border: 1px solid #bbf7d0;
          transition: all 0.3s ease;
        }
        .module-card:hover .icon-wrap {
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white; border-color: transparent;
          box-shadow: 0 8px 25px rgba(22, 163, 74, 0.35);
        }
        
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div 
        className="module-card" 
        onClick={onClick}
        style={{ animationDelay: `${delayIndex * 0.08}s` }}
      >
        <div className="icon-wrap">{icon}</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.45rem", fontWeight: 700, color: "#14532d", margin: "0 0 8px" }}>
          {title}
        </h2>
        <p style={{ color: "#4b7a5a", fontSize: 14, lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
          {description}
        </p>
        <StatBadge text={stats} />
      </div>
    </>
  );
}