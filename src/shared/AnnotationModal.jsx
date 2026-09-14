import Scene from "./Scene.jsx";

export default function AnnotationModal({ objectLabel, points, onAddPoint, onUndo, onRedo, onClear, canRedo, tool, setTool, onDone, mediaUrl }) {
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
          <button className="modal-close" aria-label="Close editor" onClick={onDone}>×</button>
        </div>
        <div className="modal-sub">Click the object to include it, then mark nearby areas to exclude.</div>
        <div className="annotation-toolbar"><div className="tool-toggle"><button data-active={tool === "fg" ? "true" : "false"} onClick={() => setTool("fg")}>Include object</button><button data-active={tool === "bg" ? "true" : "false"} onClick={() => setTool("bg")}>Exclude area</button></div><div className="annotation-edit-actions"><button className="icon-action" aria-label="Undo" title="Undo" onClick={onUndo} disabled={points.length === 0}>&lt;</button><button className="icon-action" aria-label="Redo" title="Redo" onClick={onRedo} disabled={!canRedo}>&gt;</button><button className="icon-action clear-action" aria-label="Clear all points" title="Clear all points" onClick={onClear} disabled={points.length === 0}>↻</button></div></div>
        <div className={`modal-canvas ${mediaUrl ? "media-canvas" : ""}`} onClick={handleClick}>
          {mediaUrl ? <><video src={mediaUrl} muted playsInline controls={false} /><svg viewBox="0 0 320 190" preserveAspectRatio="xMidYMid slice">{points.map((pt, i) => <circle key={i} cx={pt.x} cy={pt.y} r={5} fill={pt.type === "fg" ? mark : "none"} stroke={pt.type === "fg" ? mark : "var(--ink-faint)"} strokeWidth={1.5} />)}</svg></> : <Scene frameIndex={0} objects={[{ id: "preview", points }]} showPointsFor="preview" showBoxes={false} />}
        </div>
        <div className="count-row">
          <span>Included: <b>{fg}</b></span>
          <span>Excluded: <b>{bg}</b></span>
        </div>
        <div className="modal-actions">
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
