import Scene from "../shared/Scene.jsx";
import { FRAME_COUNT } from "../shared/constants.js";

export default function RunCard({ it, onSetRank }) {
  const active = it.results[it.activeRank];
  return (
    <div className="run-card">
      <div className="run-card-head">
        <span className="run-id">{`run ${it.id}`}</span>
        <span className="run-conf-pill">{`${Math.round(active.confidence * 100)}% confidence`}</span>
      </div>
      {it.results.length > 1 && (
        <div className="rank-chip-row">
          {it.results.map(r => (
            <button
              key={r.rank} className="rank-chip" data-active={r.rank === it.activeRank ? "true" : "false"}
              onClick={() => onSetRank(it.id, r.rank)}
            >
              {`R${r.rank + 1} · ${Math.round(r.confidence * 100)}%`}
            </button>
          ))}
        </div>
      )}
      <div className="run-thumb"><Scene frameIndex={FRAME_COUNT} objects={it.objects} showPointsFor={null} showBoxes /></div>
      <div className="run-note">
        {`${it.retries} automatic retry, recovered · ${it.objects.length} ${it.objects.length === 1 ? "identity" : "identities"}, no swaps`}
      </div>
      <details className="disclosure">
        <summary>See the exact annotation used</summary>
        <pre>{JSON.stringify(it.objects.map(o => ({
          object_id: `object_${o.id}`, frame_index: 0,
          points: o.points.map(p => [Math.round(p.x), Math.round(p.y)]),
          point_labels: o.points.map(p => p.type === "fg" ? 1 : 0),
        })), null, 2)}</pre>
      </details>
    </div>
  );
}
