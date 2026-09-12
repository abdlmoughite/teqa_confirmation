const TeqaLoader = ({ label, size = 0.8, fullPage = false }) => {
  const inner = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <div className="teqa-loading-mark" style={{ transform: `scale(${size})` }}>
        <svg width="60" height="56" viewBox="0 0 18 22" fill="none">
          <polygon className="teqa-loading-tri"  points="9,0 18,8 0,8"              fill="var(--teqa-green)" />
          <rect    className="teqa-loading-bar1" x="2" y="10" width="14" height="4" rx="1" fill="var(--teqa-blue)"  />
          <rect    className="teqa-loading-bar2" x="0" y="16" width="18" height="4" rx="1" fill="var(--teqa-red)"   />
        </svg>
      </div>
      {label && (
        <p style={{ fontSize: 13, color: "var(--teqa-muted)", margin: 0, fontFamily: "var(--font-body)" }}>
          {label}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", background: "var(--teqa-bg)" }}>
        {inner}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 0" }}>
      {inner}
    </div>
  );
};

export default TeqaLoader;
