import { QUERY_SUGGESTIONS } from "./constants.js";

export default function IdeasForYou({ onPick }) {
  return (
    <div className="ideas">
      <div className="ideas-title">Ideas for you</div>
      <div className="ideas-desc">Try a prompt below, or type your own question in the text query box. The response will appear in this box.</div>
      {QUERY_SUGGESTIONS.map(s => (
        <button key={s.text} className="idea-row" onClick={() => onPick(s.text)}>{s.text}</button>
      ))}
    </div>
  );
}
