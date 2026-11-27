import { useState } from "react";
import { getAthlete, getAthletes } from "../api.js";
import ScoutChat from "../components/ScoutChat.jsx";
import useFetch from "../components/useFetch.js";

export default function Scout() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [mode, setMode] = useState("compare");
  const [loadingPlayer, setLoadingPlayer] = useState("");
  const list = useFetch(() => getAthletes({ q: search }), [search]);
  const players = Array.isArray(list.data) ? list.data : [];
  const chosen = selected;
  const toggle = async (player) => {
    if (selected.some((item) => item.id === player.id)) {
      setSelected((current) => current.filter((item) => item.id !== player.id));
      return;
    }
    if (loadingPlayer) return;
    setLoadingPlayer(player.id);
    let fullProfile = player;
    try {
      fullProfile = await getAthlete(player.slug || player.id);
    } catch {
      // Keep the searchable listing profile usable if detail lookup is offline.
    } finally {
      setLoadingPlayer("");
    }
    setSelected((current) => mode === "compare" ? [...current.filter((item) => item.id !== player.id).slice(-1), fullProfile] : [fullProfile]);
  };
  return <section className="wrap scout-page">
    <span className="eyebrow">Podium intelligence</span>
    <h1>AI Sports Scout</h1>
    <p className="lead">Explore athlete careers, compare players, and get concise summaries in the language you speak.</p>
    <div className="scout-modes" role="group" aria-label="Scout task">
      <button className={mode === "compare" ? "selected" : ""} onClick={() => { setMode("compare"); setSelected((items) => items.slice(0, 2)); }}>Compare athletes</button>
      <button className={mode === "summary" ? "selected" : ""} onClick={() => { setMode("summary"); setSelected((items) => items.slice(0, 1)); }}>Career summary</button>
    </div>
    <label className="scout-search">Find Indian athletes<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by athlete name" /></label>
    <p className="muted small">{mode === "compare" ? "Choose up to two athletes." : "Choose an athlete to summarize."}</p>
    {list.loading && <p className="state">Searching athletes…</p>}{list.error && <p className="state error">{list.error}</p>}
    <div className="scout-picker">{players.slice(0, 12).map((player) => <button key={player.id} className={selected.some((item) => item.id === player.id) ? "scout-player selected" : "scout-player"} onClick={() => toggle(player)} disabled={Boolean(loadingPlayer) && loadingPlayer !== player.id} aria-pressed={selected.some((item) => item.id === player.id)}><span>{player.name}{loadingPlayer === player.id ? " (loading profile…)" : ""}</span><small>{player.sport || "Indian athlete"}</small></button>)}</div>
    {chosen.length > 0 ? <ScoutChat key={chosen.map((player) => player.id).join(":")} profiles={chosen} title={mode === "compare" ? "Compare these careers" : `Explore ${chosen[0]?.name}`} intro={mode === "compare" && chosen.length < 2 ? "Choose a second athlete, or ask about this one while you decide." : mode === "summary" ? "Ask for a career summary or notable highlights in your preferred language." : undefined} /> : <p className="state">Choose an athlete to get started.</p>}
  </section>;
}
