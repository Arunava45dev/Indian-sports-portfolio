import { useState } from "react";
import { askScout } from "../api.js";

export default function ScoutChat({ profiles = [], title = "Ask the AI Sports Scout", intro }) {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("English");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ask = async (event) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || busy || profiles.length === 0) return;
    const prompt = language === "English" ? value : `Answer in ${language}. ${value}`;
    const previous = messages;
    setMessages([...previous, { role: "user", content: value }]);
    setQuestion(""); setError(""); setBusy(true);
    try {
      const result = await askScout({ profile: profiles[0], profiles, question: prompt, history: previous.slice(-8) });
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
    } catch (err) {
      setError(err.message);
      setMessages(previous);
      setQuestion(value);
    } finally { setBusy(false); }
  };
  return (
    <section className="scout-panel">
      <span className="eyebrow">Podium intelligence</span>
      <h2>{title}</h2>
      <p className="muted">{intro || "Ask about career highlights, playing style, or the statistics listed on this profile."}</p>
      <label className="scout-language">Answer language
        <select value={language} onChange={(event) => setLanguage(event.target.value)}>
          {["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Kannada", "Malayalam", "Punjabi"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      {messages.length > 0 && <div className="scout-messages" aria-live="polite">{messages.map((item, index) => <div className={`scout-message ${item.role}`} key={`${index}-${item.role}`}><b>{item.role === "user" ? "You" : "Scout"}</b><p>{item.content}</p></div>)}{busy && <p className="muted">Scout is thinking…</p>}</div>}
      <form className="scout-form" onSubmit={ask}>
        <textarea rows="3" maxLength="1200" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={profiles.length > 1 ? "Compare their strengths, playing styles, and career records…" : `Ask about ${profiles[0]?.name || "this athlete"}…`} aria-label="Ask the AI sports scout" />
        <button className="btn" disabled={busy || !question.trim()}>{busy ? "Thinking…" : "Ask scout"}</button>
      </form>
      {error && <p className="state error" role="alert">{error}</p>}
      <p className="muted small scout-note">Answers are generated from the available profile details; missing statistics may not be available.</p>
    </section>
  );
}
