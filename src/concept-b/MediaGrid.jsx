import Scene from "../shared/Scene.jsx";

export default function MediaGrid({ items, selectedId, onSelect, onPickFile, onRemove, inputRef, accept }) {
  return (
    <div className="clip-grid">
      {items.map(it => (
        <div key={it.id} className="clip-card custom" data-selected={selectedId === it.id ? "true" : "false"}>
          <button
            style={{ position: "absolute", inset: 0, width: "100%", padding: 0, border: "none", background: "none", textAlign: "left" }}
            onClick={() => onSelect(it.id)}
          >
            <div className="thumb"><Scene frameIndex={0} objects={[]} showPointsFor={null} showBoxes={false} compact /></div>
            <div className="name">{it.name}</div>
          </button>
          <button className="remove-x" onClick={e => { e.stopPropagation(); onRemove(it.id); }}>✕</button>
        </div>
      ))}
      <button className="clip-card add-card" onClick={() => inputRef.current && inputRef.current.click()}>
        <div className="add-thumb">+</div>
        <div className="name">Upload your own</div>
      </button>
      <input
        type="file" accept={accept} ref={inputRef} style={{ display: "none" }}
        onChange={e => { const f = e.target.files[0]; if (f) onPickFile(f); e.target.value = ""; }}
      />
    </div>
  );
}
