import Scene from "./Scene.jsx";

export default function AnnotationModal({ objectLabel, points, onAddPoint, onUndo, onClear, tool, setTool, onDone }) {
  const mark = "var(--accent)";
  const markInk = "var(--accent-ink)";
  const fg = points.filter(p => p.type === "fg").length;
  const bg = points.filter(p => p.type === "bg").length;

  const handleClick = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 320;
    const y = ((e.clientY - rect.top) / rect.height) * 190;
    onAddPoint(x, y);
  };

  return (
    <div className="modal-overlay" onClick={onDone}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Mark {objectLabel}</h3>
          <button className="btn ghost" onClick={onDone}>✕</button>
        </div>
        <div className="modal-sub">Frame 0. Foreground points on the object, background points around it.</div>
        <div className="tool-toggle">
          <button data-active={tool === "fg" ? "true" : "false"} onClick={() => setTool("fg")}>+ Foreground</button>
          <button data-active={tool === "bg" ? "true" : "false"} onClick={() => setTool("bg")}>− Background</button>
        </div>
        <div className="modal-canvas" onClick={handleClick}>
          <Scene frameIndex={0} objects={[{ id: "preview", points }]} showPointsFor="preview" showBoxes={false} />
        </div>
        <div className="count-row">
          <span>Foreground: <b>{fg}</b></span>
          <span>Background: <b>{bg}</b></span>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onUndo} disabled={points.length === 0}>Undo</button>
          <button className="btn" onClick={onClear} disabled={points.length === 0}>Clear</button>
          <button
            className="btn" style={{ background: mark, color: markInk, borderColor: mark }}
            disabled={fg === 0} onClick={onDone}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
