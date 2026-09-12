import { useEffect, useRef, useState } from "react";
import Scene from "../shared/Scene.jsx";
import AnnotationModal from "../shared/AnnotationModal.jsx";
import IdeasForYou from "../shared/IdeasForYou.jsx";
import { DATASETS, FRAME_COUNT, TOOLS, confidenceFor } from "../shared/constants.js";
import "./conceptC.css";

const MODES = [
  { id: "text", label: "Text", icon: "Aa", hint: "Search scenes with a description" },
  { id: "image", label: "Image", icon: "▧", hint: "Find visually similar scenes" },
  { id: "video", label: "Video", icon: "▶", hint: "Find scenes or track an object" },
];

export default function ConceptC({ registerReset }) {
  const [mode, setMode] = useState("text");
  const [intent, setIntent] = useState("find");
  const [query, setQuery] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [dataset, setDataset] = useState(DATASETS[0]);
  const [count, setCount] = useState(3);
  const [toolEnabled, setToolEnabled] = useState({ critical_view_safety: false, surgical_tool_detection: false, tissue_detection: false });
  const [runs, setRuns] = useState([]);
  const [selectedRank, setSelectedRank] = useState(0);
  const [objects, setObjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [promptedFileUrl, setPromptedFileUrl] = useState(null);
  const [points, setPoints] = useState([]);
  const [redoPoints, setRedoPoints] = useState([]);
  const [pointType, setPointType] = useState("fg");
  const fileRef = useRef(null);

  const canRun = mode === "text" ? query.trim().length > 0 : !!file;
  const activeMode = MODES.find(m => m.id === mode);
  const toPreviewFile = f => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) });
  const pickFile = e => { const f = e.target.files[0]; if (f) { setFile(toPreviewFile(f)); if (mode === "video") setIntent("track"); } e.target.value = ""; };
  const dropFile = e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (!f) return; const valid = mode === "image" ? f.type.startsWith("image/") : f.type.startsWith("video/"); if (valid) { setFile(toPreviewFile(f)); if (mode === "video") setIntent("track"); } };
  const run = () => {
    const results = Array.from({ length: count }, (_, rank) => ({ rank, confidence: confidenceFor(rank) }));
    const toolsUsed = [...(mode === "video" && intent === "track" && objects.length ? ["track_instance_video"] : []), ...Object.keys(toolEnabled).filter(k => toolEnabled[k])];
    setRuns(rs => [...rs, { id: rs.length + 1, results, objects, mode, query, fileName: file?.name, toolsUsed }]); setSelectedRank(0);
  };
  const reset = () => { setMode("text"); setIntent("find"); setQuery(""); setFile(null); setDataset(DATASETS[0]); setCount(3); setRuns([]); setObjects([]); setModalOpen(false); setPoints([]); setToolEnabled({ critical_view_safety: false, surgical_tool_detection: false, tissue_detection: false }); };
  useEffect(() => { registerReset(reset); });
  useEffect(() => { if (mode === "video" && intent === "track" && file && promptedFileUrl !== file.url && !objects.length) { setPromptedFileUrl(file.url); setPoints([]); setModalOpen(true); } }, [mode, intent, file, promptedFileUrl, objects.length]);

  const addAnnotationPoint = (x, y) => { setPoints(p => [...p, { x, y, type: pointType }]); setRedoPoints([]); };
  const undoAnnotation = () => { if (!points.length) return; setRedoPoints(r => [...r, points[points.length - 1]]); setPoints(p => p.slice(0, -1)); };
  const redoAnnotation = () => { if (!redoPoints.length) return; setPoints(p => [...p, redoPoints[redoPoints.length - 1]]); setRedoPoints(r => r.slice(0, -1)); };
  const clearAnnotation = () => { if (points.length) setRedoPoints(points); setPoints([]); };
  const doneAnnotation = () => { if (points.some(p => p.type === "fg")) setObjects([{ id: 1, points }]); setModalOpen(false); };
  const current = runs[runs.length - 1];
  const selectedDetail = current && <div className="result-detail"><div className="result-detail-thumb"><Scene frameIndex={FRAME_COUNT} objects={current.objects.length ? current.objects : [{ id: 1, points: [] }]} showBoxes /></div><div className="result-detail-copy"><div className="request-kicker">SELECTED RESULT {selectedRank + 1}</div><h3>{Math.round(current.results[selectedRank].confidence * 100)}% confidence</h3><p>{current.mode === "text" ? `Matches scenes related to “${current.query || "your request"}”.` : current.mode === "image" ? "Visually similar scenes found from the uploaded image." : "Matching scenes found in the uploaded video."}</p><span>{current.fileName || "Text request"} · {current.toolsUsed.length ? `${current.toolsUsed.length} tools used` : "No optional tools"}</span></div></div>;
  return <div className="workspace-c">
    <input ref={fileRef} type="file" accept={mode === "image" ? "image/*" : "video/*"} hidden onChange={pickFile} />
    <section className="request-panel">
      <div className="request-kicker">ANALYSIS REQUEST</div>
      <h2>What do you want to find?</h2>
      <div className="mode-tabs" role="tablist">{MODES.map(m => <button key={m.id} className="mode-tab" data-active={mode === m.id} onClick={() => { setMode(m.id); setFile(null); }}><span>{m.icon}</span>{m.label}</button>)}</div>
      <div className="mode-hint">{activeMode.hint}</div>
      {mode === "video" && <div className="intent-tabs"><button data-active={intent === "find"} onClick={() => setIntent("find")}>Find scenes</button><button data-active={intent === "track"} onClick={() => setIntent("track")}>Track an object</button></div>}
      {mode !== "text" && <div className={`file-drop ${file ? "has-file" : ""} ${dragOver ? "drag-over" : ""}`} role="button" tabIndex={0} onClick={() => fileRef.current?.click()} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={dropFile}>{file ? <><div className="file-preview">{mode === "image" ? <img src={file.url} alt="Uploaded preview" /> : <video src={file.url} controls onClick={e => e.stopPropagation()} />}</div><div className="file-caption-row"><div className="file-caption" title={file.name}>{file.name}</div><button className="file-remove" aria-label="Remove file" onClick={e => { e.stopPropagation(); setFile(null); }}>×</button></div></> : <><b>{mode === "image" ? "Upload an image" : "Upload a video"}</b><span>Choose a file or drag it here</span></>}</div>}
      {mode === "text" || (mode === "video" && intent === "find") ? <textarea value={query} onChange={e => setQuery(e.target.value)} placeholder={mode === "text" ? "e.g. find scenes with a surgical tool" : "Describe what to find in this video"} /> : null}
      {mode === "video" && intent === "track" && file && <div className={`annotation-row ${objects.length ? "marked" : ""}`}><div><b>{objects.length ? "Object marked · Ready to track" : "Mark an object to track"}</b><span>{objects.length ? "Edit the points if needed before running analysis." : "Open the editor to mark foreground and background points."}</span></div><button onClick={() => { setPoints(objects[0]?.points || []); setRedoPoints([]); setModalOpen(true); }}>{objects.length ? "Edit points" : "Mark object"}</button></div>}
      <div className="section"><div className="section-head"><span>Dataset</span></div><div className="section-body"><select className="select" value={dataset} onChange={e => setDataset(e.target.value)}>{DATASETS.map(d => <option key={d}>{d}</option>)}</select></div></div>
      <div className="section results-section"><div className="section-head"><span>Results</span><span className="stepper"><button onClick={() => setCount(v => Math.max(1, v - 1))}>−</button><span className="val">{count}</span><button onClick={() => setCount(v => Math.min(10, v + 1))}>+</button></span></div></div>
      <div className="section"><div className="section-head"><span>Tools</span></div><div className="section-body"><div className="small-note">Optional analysis tools for this run.</div><div className="tools-list">{TOOLS.filter(t => t.name !== "track_instance_video").map(t => <button key={t.name} data-active={toolEnabled[t.name]} onClick={() => setToolEnabled(s => ({ ...s, [t.name]: !s[t.name] }))}>{t.name}</button>)}</div></div></div>
      <button className="run-analysis" disabled={!canRun || (mode === "video" && intent === "track" && !objects.length)} onClick={run}>Run analysis <span>↑</span></button>
      <div className="request-status">{canRun ? `${activeMode.label} search ready · ${dataset}` : "Choose a search type and add an input to continue"}</div>
    </section>
    <section className="results-panel">{!current ? <div className="c-empty"><IdeasForYou onPick={s => { setMode("text"); setQuery(s); }} /></div> : <><div className="results-head"><div><div className="request-kicker">ANALYSIS RUN {current.id}</div><h2>Top results</h2></div><span>{current.results.length} matches</span></div><div className="result-grid">{current.results.map(r => <><button className="c-result" data-selected={r.rank === selectedRank} key={r.rank} onClick={() => setSelectedRank(r.rank)}><div className="c-result-thumb"><Scene frameIndex={FRAME_COUNT} objects={current.objects.length ? current.objects : [{ id: 1, points: [] }]} showBoxes /></div><div className="c-result-meta"><b>Result {r.rank + 1}</b><strong>{Math.round(r.confidence * 100)}%</strong></div></button>{r.rank === selectedRank && selectedDetail}</>)}</div><details className="disclosure"><summary>See request details</summary><pre>{JSON.stringify({ mode: current.mode, query: current.query, file: current.fileName, dataset, tools: current.toolsUsed }, null, 2)}</pre></details></>}</section>
    {modalOpen && <AnnotationModal objectLabel="the object to track" mediaUrl={file?.url} points={points} onAddPoint={addAnnotationPoint} onUndo={undoAnnotation} onRedo={redoAnnotation} onClear={clearAnnotation} canRedo={redoPoints.length > 0} tool={pointType} setTool={setPointType} onDone={doneAnnotation} />}
  </div>;
}
