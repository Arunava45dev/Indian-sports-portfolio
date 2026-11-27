import { useState } from "react";
import { sendMessage } from "../api.js";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ type: "idle", text: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    setStatus({ type: "busy", text: "Sending…" });
    try {
      await sendMessage(form);
      setForm({ name: "", email: "", message: "" });
      setStatus({ type: "ok", text: "Message sent. We will reply by email." });
    } catch (e) {
      setStatus({ type: "error", text: e.message });
    }
  }

  return (
    <section className="wrap narrow">
      <h1>Contact</h1>
      <p className="muted">Tell us which athlete you are asking about and what you need.</p>
      <div className="form">
        <label>Name<input value={form.name} onChange={set("name")} autoComplete="name" /></label>
        <label>Email<input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></label>
        <label>Message<textarea rows="5" value={form.message} onChange={set("message")} /></label>
        <button className="btn" onClick={submit} disabled={status.type === "busy"}>Send message</button>
        {status.text && <p className={`state ${status.type === "error" ? "error" : ""}`} role="status">{status.text}</p>}
      </div>
    </section>
  );
}
