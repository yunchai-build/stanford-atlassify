export default function Section({ title, open, onToggle, children }) {
  return (
    <div className="section">
      <button className="section-head" data-open={open ? "true" : "false"} onClick={onToggle}>
        <span>{title}</span>
        <span className="chev">▸</span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}
