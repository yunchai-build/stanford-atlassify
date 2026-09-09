import { useRef, useState } from "react";
import ConceptA from "./concept-a/ConceptA.jsx";
import ConceptB from "./concept-b/ConceptB.jsx";

export default function Root() {
  const [concept, setConcept] = useState("B");
  const resetRef = useRef(() => {});
  const registerReset = fn => { resetRef.current = fn; };

  return (
    <div className={`shell concept-${concept.toLowerCase()}`}>
      <div className="topbar">
        <div className="title-block">
          <h1>Atlassify</h1>
          <span className="title-tag">{concept === "A" ? "concept A" : "concept B"}</span>
        </div>
        <div className="topbar-actions">
          <select className="concept-switch" value={concept} onChange={e => setConcept(e.target.value)}>
            <option value="A">Concept A</option>
            <option value="B">Concept B</option>
          </select>
          <button className="reset-btn" onClick={() => resetRef.current()}>↺ Reset</button>
        </div>
      </div>
      {concept === "A" ? <ConceptA registerReset={registerReset} /> : <ConceptB registerReset={registerReset} />}
    </div>
  );
}
