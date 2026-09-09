import { useEffect, useRef, useState } from "react";
import Scene from "../shared/Scene.jsx";
import AnnotationModal from "../shared/AnnotationModal.jsx";
import IdeasForYou from "../shared/IdeasForYou.jsx";
import { DATASETS, TOOLS, QUERY_SUGGESTIONS, confidenceFor } from "../shared/constants.js";
import RunCard from "./RunCard.jsx";
import "./conceptA.css";

export default function ConceptA({ registerReset }) {
  const [openPanel, setOpenPanel] = useState(null);
  const [trackWantsOn, setTrackWantsOn] = useState(false);
  const [dataset, setDataset] = useState(null);
  const [video, setVideo] = useState(null);
  const [picture, setPicture] = useState(null);
  const [objects, setObjects] = useState([]);
  const [resultCount, setResultCount] = useState(3);
  const [modalTarget, setModalTarget] = useState(null);
  const [draftPoints, setDraftPoints] = useState([]);
  const [modalTool, setModalTool] = useState("fg");
  const [iterations, setIterations] = useState([]);
  const [textQuery, setTextQuery] = useState("");
  const [toolEnabled, setToolEnabled] = useState({ critical_view_safety: false, surgical_tool_detection: false, tissue_detection: false });
  const videoFileRef = useRef(null);
  const pictureFileRef = useRef(null);
  const idRef = useRef(1);

  const pickVideoFile = e => {
    const f = e.target.files[0];
    if (f) setVideo({ name: f.name });
    e.target.value = "";
  };
  const pickPictureFile = e => {
    const f = e.target.files[0];
    if (f) setPicture({ name: f.name });
    e.target.value = "";
  };
  const detachVideo = () => { setVideo(null); setObjects([]); };
  const detachPicture = () => setPicture(null);

  const openNewAnnotation = () => { setModalTarget("new"); setDraftPoints([]); setModalTool("fg"); };
  const openEditAnnotation = o => { setModalTarget(o.id); setDraftPoints([...o.points]); setModalTool("fg"); };
  const openTrackModal = () => objects.length ? openEditAnnotation(objects[0]) : openNewAnnotation();
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

  const matchedSuggestion = QUERY_SUGGESTIONS.find(s => s.text === textQuery.trim());
  const needsVideoForQuery = !!(matchedSuggestion && matchedSuggestion.requiresVideo && !video);
  const canGenerate = (!!video || textQuery.trim().length > 0) && !needsVideoForQuery;

  const generate = () => {
    const snapshot = objects.map(o => ({ ...o, points: [...o.points] }));
    const toolsUsed = [
      ...(snapshot.length ? ["track_instance_video"] : []),
      ...Object.keys(toolEnabled).filter(k => toolEnabled[k]),
    ];
    const results = Array.from({ length: resultCount }, (_, rank) => ({ rank, confidence: confidenceFor(rank) }));
    setIterations(it => [...it, {
      id: it.length + 1,
      objects: snapshot.length ? snapshot : [{ id: 1, points: [] }],
      results, retries: 1, toolsUsed, activeRank: 0,
    }]);
  };

  const setActiveRank = (iterId, rank) => setIterations(its => its.map(it => it.id === iterId ? { ...it, activeRank: rank } : it));

  const activeToolCount = [trackWantsOn || objects.length > 0, ...Object.values(toolEnabled)].filter(Boolean).length;
  const closePopovers = () => setOpenPanel(null);

  const reset = () => {
    setVideo(null); setPicture(null); setObjects([]);
    setResultCount(3); setIterations([]); idRef.current = 1;
    setTextQuery(""); setDataset(null); setOpenPanel(null); setTrackWantsOn(false);
    setToolEnabled({ critical_view_safety: false, surgical_tool_detection: false, tissue_detection: false });
  };

  useEffect(() => { registerReset(reset); });

  return (
    <>
      {openPanel && <button className="popover-catcher" aria-hidden="true" onClick={closePopovers} />}
      <div className="workspace-a">

        <div className="panel">
          <div className="composer-card">
            <input type="file" accept="video/*" ref={videoFileRef} style={{ display: "none" }} onChange={pickVideoFile} />
            <input type="file" accept="image/*" ref={pictureFileRef} style={{ display: "none" }} onChange={pickPictureFile} />

            {(video || picture) && (
              <div className="attach-chip-row">
                {video && (
                  <div
                    className="attach-chip" data-marked={objects.length > 0 ? "true" : "false"}
                    style={{ cursor: "pointer" }} title="Click to mark points to track" onClick={openTrackModal}
                  >
                    <div className="attach-chip-thumb">
                      <Scene frameIndex={0} objects={[]} showPointsFor={null} showBoxes={false} compact />
                    </div>
                    <button className="chip-remove" title="Detach video" onClick={e => { e.stopPropagation(); detachVideo(); }}>✕</button>
                  </div>
                )}
                {picture && (
                  <div className="attach-chip">
                    <div className="attach-chip-thumb">
                      <Scene frameIndex={0} objects={[]} showPointsFor={null} showBoxes={false} compact />
                    </div>
                    <button className="chip-remove" title="Detach picture" onClick={() => detachPicture()}>✕</button>
                  </div>
                )}
              </div>
            )}
            <textarea
              className="composer-textarea" value={textQuery} onChange={e => setTextQuery(e.target.value)}
              placeholder="Ask Atlassify anything..."
            />
            <div className="composer-toolbar">
              <div className="composer-pills">
                <button
                  className="pill-btn" data-active={video ? "true" : "false"}
                  title={video ? "Add or edit tracking points" : "Attach a video"}
                  onClick={() => { setOpenPanel(null); video ? openTrackModal() : (videoFileRef.current && videoFileRef.current.click()); }}
                >
                  Video
                  {video && <span className="pill-count">1</span>}
                  {video && <span className="pill-arrow">›</span>}
                </button>
                <button
                  className="pill-btn" data-active={picture ? "true" : "false"}
                  onClick={() => { setOpenPanel(null); pictureFileRef.current && pictureFileRef.current.click(); }}
                >
                  Picture
                  {picture && <span className="pill-count">1</span>}
                </button>
                <div style={{ position: "relative" }}>
                  <button
                    className="pill-btn" title={dataset || "Choose a dataset"} data-active={openPanel === "dataset" ? "true" : "false"}
                    onClick={() => setOpenPanel(p => p === "dataset" ? null : "dataset")}
                  >
                    Dataset
                    {dataset && <span className="pill-count">✓</span>}
                    <span className="pill-arrow">›</span>
                  </button>
                  {openPanel === "dataset" && (
                    <div className="select-popover">
                      {DATASETS.map(d => (
                        <button
                          key={d} className="select-row" data-active={dataset === d ? "true" : "false"}
                          onClick={() => { setDataset(d); setOpenPanel(null); }}
                        >
                          {d}{dataset === d && " ✓"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <button
                    className="pill-btn" data-active={openPanel === "tools" ? "true" : "false"}
                    onClick={() => setOpenPanel(p => p === "tools" ? null : "tools")}
                  >
                    Tools
                    {activeToolCount > 0 && <span className="pill-count">{activeToolCount}</span>}
                    <span className="pill-arrow">›</span>
                  </button>
                  {openPanel === "tools" && (
                    <div className="tools-popover">
                      <div className="popover-head">
                        <span className="popover-title">Tool bank</span>
                        <button className="btn ghost" onClick={() => setOpenPanel(null)}>✕</button>
                      </div>
                      <div className="chip-row">
                        {TOOLS.map(t => {
                          const isTrack = t.name === "track_instance_video";
                          const on = isTrack ? (trackWantsOn || objects.length > 0) : toolEnabled[t.name];
                          return isTrack ? (
                            <button key={t.name} className="chip" data-active={on ? "true" : "false"} onClick={() => setTrackWantsOn(v => !v)}>
                              {t.name}
                            </button>
                          ) : (
                            <button
                              key={t.name} className="chip" data-active={on ? "true" : "false"}
                              onClick={() => setToolEnabled(s => ({ ...s, [t.name]: !s[t.name] }))}
                            >
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                      {trackWantsOn && (
                        <div className="small-note">
                          Since you turned on this tool, make sure to upload a video and mark tracking points before generating a response.
                        </div>
                      )}
                      <div className="tool-legend">
                        {TOOLS.map(t => <div key={t.name}><b>{t.name}</b>{` — ${t.desc}`}</div>)}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <button
                    className="pill-btn" data-active={openPanel === "results" ? "true" : "false"}
                    onClick={() => setOpenPanel(p => p === "results" ? null : "results")}
                  >
                    Results
                    <span className="pill-count">{resultCount}</span>
                    <span className="pill-arrow">›</span>
                  </button>
                  {openPanel === "results" && (
                    <div className="effort-popover">
                      <div className="effort-head">
                        <span className="effort-value">{resultCount}</span>
                        <span className="effort-max">of 10</span>
                      </div>
                      <div className="effort-label">
                        {resultCount === 1 ? "Top match only" : `Top ${resultCount} results, ranked by confidence`}
                      </div>
                      <input
                        type="range" min={1} max={10} step={1} value={resultCount} className="effort-slider"
                        onChange={e => setResultCount(Number(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              </div>
              <button
                className="send-btn"
                title={canGenerate ? "Send" : needsVideoForQuery ? "Attach a video to track" : "Ask a question or attach a video"}
                disabled={!canGenerate} onClick={generate}
              >
                ↑
              </button>
            </div>
          </div>

          {!canGenerate && (
            <div className="generate-hint">
              {needsVideoForQuery ? "This needs a video. Attach one so Atlassify has something to track." : "Ask a question or attach a video to continue."}
            </div>
          )}
        </div>

        <div className="panel">
          {iterations.length === 0 && <div className="feed-idle"><IdeasForYou onPick={setTextQuery} /></div>}
          {iterations.length > 0 && (
            <div className="feed">
              {[...iterations].reverse().map(it => <RunCard key={it.id} it={it} onSetRank={setActiveRank} />)}
            </div>
          )}
        </div>
      </div>
      {modalTarget !== null && (
        <AnnotationModal
          objectLabel="the tracked instance"
          points={draftPoints} onAddPoint={addPoint} onUndo={undoPoint} onClear={clearPoints}
          tool={modalTool} setTool={setModalTool} onDone={closeModal}
        />
      )}
    </>
  );
}
