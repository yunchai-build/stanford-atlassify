import { useEffect, useRef, useState } from "react";
import Scene from "../shared/Scene.jsx";
import AnnotationModal from "../shared/AnnotationModal.jsx";
import IdeasForYou from "../shared/IdeasForYou.jsx";
import { DATASETS, FRAME_COUNT, TOOLS, QUERY_SUGGESTIONS, confidenceFor } from "../shared/constants.js";
import MediaGrid from "./MediaGrid.jsx";
import Section from "./Section.jsx";
import "./conceptB.css";

export default function ConceptB({ registerReset }) {
  const [openSections, setOpenSections] = useState({ video: true, picture: true, text: true, dataset: true, results: true, tools: true });
  const [dataset, setDataset] = useState(DATASETS[0]);
  const [clipId, setClipId] = useState(null);
  const [annotationEnabled, setAnnotationEnabled] = useState(true);
  const [objects, setObjects] = useState([]);
  const [resultCount, setResultCount] = useState(3);
  const [modalTarget, setModalTarget] = useState(null);
  const [draftPoints, setDraftPoints] = useState([]);
  const [modalTool, setModalTool] = useState("fg");
  const [iterations, setIterations] = useState([]);
  const [viewingId, setViewingId] = useState(null);
  const [viewFrame, setViewFrame] = useState(FRAME_COUNT);
  const [viewingResultRank, setViewingResultRank] = useState(0);
  const [pictureId, setPictureId] = useState(null);
  const [textQuery, setTextQuery] = useState("");
  const [toolEnabled, setToolEnabled] = useState({ critical_view_safety: false, surgical_tool_detection: false, tissue_detection: false });
  const [videoItems, setVideoItems] = useState([]);
  const [pictureItems, setPictureItems] = useState([]);
  const videoFileRef = useRef(null);
  const pictureFileRef = useRef(null);
  const idRef = useRef(1);
  const uploadIdRef = useRef(1);

  const uploadVideo = file => {
    const item = { id: `video-${uploadIdRef.current++}`, name: file.name };
    setVideoItems(v => [...v, item]);
    setClipId(item.id);
  };
  const removeVideo = id => {
    setVideoItems(v => v.filter(it => it.id !== id));
    setClipId(cur => cur === id ? null : cur);
  };
  const uploadPicture = file => {
    const item = { id: `picture-${uploadIdRef.current++}`, name: file.name };
    setPictureItems(v => [...v, item]);
    setPictureId(item.id);
  };
  const removePicture = id => {
    setPictureItems(v => v.filter(it => it.id !== id));
    setPictureId(cur => cur === id ? null : cur);
  };

  const toggleSection = s => setOpenSections(o => ({ ...o, [s]: !o[s] }));

  const openNewAnnotation = () => { setModalTarget("new"); setDraftPoints([]); setModalTool("fg"); };
  const openEditAnnotation = o => { setModalTarget(o.id); setDraftPoints([...o.points]); setModalTool("fg"); };
  const addPoint = (x, y) => setDraftPoints(d => [...d, { x, y, type: modalTool }]);
  const undoPoint = () => setDraftPoints(d => d.slice(0, -1));
  const clearPoints = () => setDraftPoints([]);
  const closeModal = () => {
    const hasForeground = draftPoints.some(p => p.type === "fg");
    if (modalTarget === "new") {
      if (hasForeground) {
        idRef.current += 1;
        setObjects(os => [...os, { id: idRef.current, points: draftPoints }]);
      }
    } else if (modalTarget !== null) {
      setObjects(os => hasForeground
        ? os.map(o => o.id === modalTarget ? { ...o, points: draftPoints } : o)
        : os.filter(o => o.id !== modalTarget));
    }
    setModalTarget(null);
    setDraftPoints([]);
  };

  const removeObject = id => setObjects(os => os.filter(o => o.id !== id));

  const matchedSuggestion = QUERY_SUGGESTIONS.find(s => s.text === textQuery.trim());
  const needsVideoForQuery = !!(matchedSuggestion && matchedSuggestion.requiresVideo && !clipId);
  const canGenerate = clipId ? (!annotationEnabled || objects.length > 0) : (textQuery.trim().length > 0 && !needsVideoForQuery);

  const generate = () => {
    const snapshot = annotationEnabled ? objects.map(o => ({ ...o, points: [...o.points] })) : [];
    const toolsUsed = [
      ...(annotationEnabled && snapshot.length ? ["track_instance_video"] : []),
      ...Object.keys(toolEnabled).filter(k => toolEnabled[k]),
    ];
    const results = Array.from({ length: resultCount }, (_, rank) => ({ rank, confidence: confidenceFor(rank) }));
    const newIter = {
      id: iterations.length + 1,
      objects: snapshot.length ? snapshot : [{ id: 1, points: [] }],
      results,
      retries: 1,
      toolsUsed,
    };
    setIterations(it => [...it, newIter]);
    setViewingId(newIter.id);
    setViewFrame(FRAME_COUNT);
    setViewingResultRank(0);
  };

  useEffect(() => { setViewingResultRank(0); setViewFrame(FRAME_COUNT); }, [viewingId]);

  const reset = () => {
    setClipId(null); setAnnotationEnabled(true); setObjects([]);
    setResultCount(3); setIterations([]); setViewingId(null); idRef.current = 1;
    setPictureId(null); setTextQuery(""); setDataset(DATASETS[0]);
    setToolEnabled({ critical_view_safety: false, surgical_tool_detection: false, tissue_detection: false });
    setVideoItems([]); setPictureItems([]);
  };

  useEffect(() => { registerReset(reset); });

  const viewing = iterations.find(it => it.id === viewingId);

  return (
    <>
      <div className="workspace">
        <div className="canvas-panel">
          {!viewing && <div className="canvas-idle"><IdeasForYou onPick={setTextQuery} /></div>}
          {!viewing && clipId && (
            <div className="canvas-frame"><Scene frameIndex={0} objects={objects} showPointsFor={null} showBoxes={false} /></div>
          )}
          {viewing && (
            <>
              {viewing.results.length > 1 && (
                <div className="result-row">
                  {viewing.results.map(r => (
                    <button
                      key={r.rank} className="result-card" data-active={r.rank === viewingResultRank ? "true" : "false"}
                      onClick={() => setViewingResultRank(r.rank)}
                    >
                      <span className="result-rank">{`result ${r.rank + 1}`}</span>
                      <span className="result-conf">{`${Math.round(r.confidence * 100)}%`}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="canvas-frame"><Scene frameIndex={viewFrame} objects={viewing.objects} showPointsFor={null} showBoxes /></div>
              <div className="stat-row">
                <span>
                  <b>{`${Math.round(viewing.results[viewingResultRank].confidence * 100)}%`}</b>
                  {` confidence · result ${viewingResultRank + 1} of ${viewing.results.length}`}
                </span>
              </div>
              <details className="disclosure">
                <summary>See the exact annotation used</summary>
                <pre>{JSON.stringify(viewing.objects.map(o => ({
                  object_id: `object_${o.id}`, frame_index: 0,
                  points: o.points.map(p => [Math.round(p.x), Math.round(p.y)]),
                  point_labels: o.points.map(p => p.type === "fg" ? 1 : 0),
                })), null, 2)}</pre>
              </details>
            </>
          )}
          {iterations.length > 0 && (
            <>
              <span className="lbl" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>run history</span>
              <div className="history-rail">
                {iterations.map(it => (
                  <button
                    key={it.id} className="history-item" data-active={it.id === viewingId ? "true" : "false"}
                    onClick={() => setViewingId(it.id)}
                  >
                    <div className="thumb"><Scene frameIndex={FRAME_COUNT} objects={it.objects} showPointsFor={null} showBoxes compact /></div>
                    <div className="lbl">{`run ${it.id}`}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="sidebar">
          <Section title="Tool Bank" open={openSections.tools} onToggle={() => toggleSection("tools")}>
            <div className="small-note">Turn a tool on to let Atlassify use it on the next result. Each badge reflects the run you're currently viewing on the left, not just the toggle.</div>
            {TOOLS.map(t => {
              const isTrack = t.name === "track_instance_video";
              const on = isTrack ? annotationEnabled : toolEnabled[t.name];
              const usedInViewing = viewing ? viewing.toolsUsed.includes(t.name) : null;
              const badgeText = viewing ? (usedInViewing ? "used this round" : "inactive") : (on ? "will run next" : "off");
              return (
                <div className="tool-item" key={t.name}>
                  <div className="tool-item-top">
                    <span className="tool-name">{t.name}</span>
                    <span className={`tool-flag ${badgeText === "used this round" ? "live" : ""}`}>{badgeText}</span>
                    {!viewing && (
                      <button
                        className="toggle" data-on={on ? "true" : "false"}
                        onClick={() => isTrack ? setAnnotationEnabled(v => !v) : setToolEnabled(s => ({ ...s, [t.name]: !s[t.name] }))}
                      />
                    )}
                  </div>
                  <div className="tool-item-desc">{t.desc}</div>
                </div>
              );
            })}
          </Section>

          <Section title="Text query" open={openSections.text} onToggle={() => toggleSection("text")}>
            <textarea
              className="text-input" value={textQuery} onChange={e => setTextQuery(e.target.value)}
              placeholder="e.g. find similar dissection scenes across the dataset"
            />
            <div className="small-note">Ask in plain language, or pick a video on the left to track a specific instance.</div>
          </Section>

          <Section title="Picture" open={openSections.picture} onToggle={() => toggleSection("picture")}>
            <MediaGrid
              items={pictureItems} selectedId={pictureId}
              onSelect={id => setPictureId(cur => cur === id ? null : id)}
              onPickFile={uploadPicture} onRemove={removePicture}
              inputRef={pictureFileRef} accept="image/*"
            />
            <div className="small-note">For similarity search, not part of this tracking walkthrough.</div>
          </Section>

          <Section title="Video" open={openSections.video} onToggle={() => toggleSection("video")}>
            <MediaGrid
              items={videoItems} selectedId={clipId}
              onSelect={setClipId}
              onPickFile={uploadVideo} onRemove={removeVideo}
              inputRef={videoFileRef} accept="video/*"
            />
            <div className="toggle-row">
              <span>Track a specific instance</span>
              <button className="toggle" data-on={annotationEnabled ? "true" : "false"} onClick={() => setAnnotationEnabled(v => !v)} />
            </div>
            {annotationEnabled && !clipId && <div className="generate-hint">Pick a video above first.</div>}
            {annotationEnabled && clipId && (
              <>
                {objects.map((o, i) => (
                  <div className="obj-row" key={o.id}>
                    <div>
                      <div className="name">{`Object ${i + 1}`}</div>
                      <div className="status" data-marked="true">
                        {`${o.points.filter(p => p.type === "fg").length} fg · ${o.points.filter(p => p.type === "bg").length} bg`}
                      </div>
                    </div>
                    <button className="btn" onClick={() => openEditAnnotation(o)}>Edit</button>
                    <button className="remove-x" onClick={() => removeObject(o.id)}>✕</button>
                  </div>
                ))}
                <button className="btn primary" onClick={openNewAnnotation}>
                  {objects.length === 0 ? "Annotate an object to track" : "+ Add another object"}
                </button>
              </>
            )}
          </Section>

          <Section title="Dataset" open={openSections.dataset} onToggle={() => toggleSection("dataset")}>
            <select className="select" value={dataset} onChange={e => setDataset(e.target.value)}>
              {DATASETS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Section>

          <Section title="Results" open={openSections.results} onToggle={() => toggleSection("results")}>
            <div className="toggle-row">
              <span>How many results to return (choose 1 to 10)</span>
              <span className="stepper">
                <button onClick={() => setResultCount(v => Math.max(1, v - 1))}>−</button>
                <span className="val">{resultCount}</span>
                <button onClick={() => setResultCount(v => Math.min(10, v + 1))}>+</button>
              </span>
            </div>
            <div className="small-note">
              {resultCount === 1
                ? "Returns only the single result Atlassify is most confident in."
                : `Returns the top ${resultCount} results, ranked from highest confidence down.`}
            </div>
          </Section>

          <button className="generate-btn" disabled={!canGenerate} onClick={generate}>
            {iterations.length ? "Generate again" : "Generate result"}
          </button>
          {!canGenerate && (
            <div className="generate-hint">
              {!clipId
                ? (needsVideoForQuery ? "This needs a video. Pick one so Atlassify has something to track." : "Ask a question or pick a video to continue.")
                : "Mark at least one object to continue."}
            </div>
          )}
        </div>
      </div>
      {modalTarget !== null && (
        <AnnotationModal
          objectLabel={modalTarget === "new" ? `Object ${objects.length + 1}` : `Object ${objects.findIndex(o => o.id === modalTarget) + 1}`}
          points={draftPoints} onAddPoint={addPoint} onUndo={undoPoint} onClear={clearPoints}
          tool={modalTool} setTool={setModalTool} onDone={closeModal}
        />
      )}
    </>
  );
}
