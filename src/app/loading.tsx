export default function Loading() {
  const delays = ["0s", "0.2s", "0.4s", "0.2s", "0s"];
  return (
    <div className="loading-screen" role="status" aria-label="Carregando">
      <div className="eq-bars">
        {delays.map((delay, i) => (
          <span key={i} className="eq-bar" style={{ animationDelay: delay }} />
        ))}
      </div>
      <p className="hint-text">carregando...</p>
    </div>
  );
}
