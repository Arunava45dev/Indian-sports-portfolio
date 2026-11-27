import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMatch, getMatches, getSports, saveMatch } from "../api.js";
import useFetch from "../components/useFetch.js";

const STATUSES = ["upcoming", "live", "completed"];
const EXAMPLE = JSON.stringify({
  sport: "Cricket", competition: "Tournament name", starts_at: new Date(Date.now() + 86400000).toISOString(),
  status: "upcoming", venue: "Venue, city",
  home: { name: "Home team", players: ["Player 1", "Player 2"] },
  away: { name: "Away team", players: ["Player 3", "Player 4"] },
  score: { summary: "", periods: [], events: [] }, result: ""
}, null, 2);

function MatchCard({ match }) {
  const live = match.status === "live";
  const score = match.score || {};
  return (
    <Link className="match-card" to={`/matches/${match.id}`}>
      <div className="match-meta"><span>{match.sport}{match.competition ? ` · ${match.competition}` : ""}</span><span className={`match-status ${live ? "is-live" : ""}`}>{live && <i />}{match.status}</span></div>
      <div className="match-teams">
        <div><b>{match.home?.name || "Home"}</b><small>{(match.home?.players || []).slice(0, 4).join(", ")}</small></div>
        <strong className="match-score">{score.home || "—"}<br /><span>{score.away || "—"}</span></strong>
        <div className="away-team"><b>{match.away?.name || "Away"}</b><small>{(match.away?.players || []).slice(0, 4).join(", ")}</small></div>
      </div>
      {live && score.innings?.length > 0 && <div className="innings-strip" aria-label="Live innings scoreboard">
        {score.innings.map((innings, index) => <div className="innings-chip" key={`${innings.team}-${innings.label}`}>
          <span>{innings.team} · {innings.label}</span>
          <strong>{innings.runs}/{innings.wickets}{innings.declared ? " dec" : ""}</strong>
          <small>{innings.overs} ov</small>
        </div>)}
      </div>}
      <div className="match-foot"><span>{new Date(match.starts_at).toLocaleString()}</span><span>{score.summary || match.result || match.venue || "Match details"}</span></div>
    </Link>
  );
}

export default function Matches() {
  const [sport, setSport] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [q, setQ] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [refresh, setRefresh] = useState(0);
  const sports = useFetch(getSports);
  const list = useFetch(() => getMatches({ sport, status, date, q: searchTerm }), [sport, status, date, searchTerm, refresh]);
  const [token, setToken] = useState(() => sessionStorage.getItem("match-admin-token") || "");
  const [payload, setPayload] = useState(EXAMPLE);
  const [matchId, setMatchId] = useState("");
  const [adminError, setAdminError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setRefresh((n) => n + 1), 90000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(q.trim()), 250);
    return () => clearTimeout(timer);
  }, [q]);

  async function submitMatch(event) {
    event.preventDefault();
    setSaving(true); setAdminError("");
    try {
      const data = JSON.parse(payload);
      const savedToken = token.trim();
      sessionStorage.setItem("match-admin-token", savedToken);
      await saveMatch(data, savedToken, matchId.trim());
      setRefresh((n) => n + 1);
      setAdminError(matchId ? "Match updated." : "Match added.");
    } catch (error) {
      setAdminError(error instanceof SyntaxError ? "Match data must be valid JSON." : error.message);
    } finally { setSaving(false); }
  }

  return (
    <section className="wrap match-center">
      <p className="eyebrow">PODIUM · MATCH CENTER</p>
      <h1>Fixtures &amp; Scores</h1>
      <p className="muted">Schedules, lineups and scoreboards across sports. Scores refresh automatically; coverage depends on the sport.</p>
      <div className="match-filters">
        <label>Search matches<input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="India vs Sri Lanka, team or competition" /></label>
        <label>Sport<select value={sport} onChange={(e) => setSport(e.target.value)}><option value="">All sports</option>{sports.data?.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label>Date (optional)<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <div className="status-tabs" aria-label="Filter matches">
          <button className={!status ? "selected" : ""} onClick={() => setStatus("")}>All matches</button>
          {STATUSES.map((value) => <button key={value} className={status === value ? "selected" : ""} onClick={() => setStatus(value)}>{value}</button>)}
        </div>
      </div>
      {list.loading && <p className="state">Loading fixtures…</p>}
      {list.error && <p className="state error">{list.error}</p>}
      {!list.loading && !list.error && list.data?.length === 0 && <div className="empty-matches"><h2>{searchTerm ? `No matches found for “${searchTerm}”` : "No matches scheduled"}</h2><p>Try another team name or date.</p></div>}
      <div className="match-list">{list.data?.map((match) => <MatchCard key={match.id} match={match} />)}</div>
      <p className="feed-credit">Automatic fixtures and results by <a href="https://www.thesportsdb.com/" target="_blank" rel="noreferrer">TheSportsDB</a>. India cricket fixtures, including international, A-team and youth matches, are listed from <a href="https://www.bcci.tv/matches" target="_blank" rel="noreferrer">BCCI</a>. Lineup availability varies by sport.</p>
      <details className="match-admin"><summary>Schedule manager</summary>
        <p className="muted small">Enter the admin token to add a fixture or update a score. Match data uses JSON so every sport can store its own scoreboard.</p>
        <form onSubmit={submitMatch}>
          <label>Admin token<input type="password" value={token} onChange={(e) => setToken(e.target.value)} required /></label>
          <label>Match ID to update (leave empty to add a match)<input value={matchId} onChange={(e) => setMatchId(e.target.value)} placeholder="Mongo match ID" /></label>
          <label>Match data (JSON)<textarea className="match-json" value={payload} onChange={(e) => setPayload(e.target.value)} required /></label>
          {adminError && <p className="state">{adminError}</p>}
          <button className="btn" disabled={saving}>{saving ? "Saving…" : matchId ? "Update match" : "Add match"}</button>
        </form>
      </details>
    </section>
  );
}

export function MatchDetail() {
  const { id } = useParams();
  const { data: match, error, loading } = useFetch(() => getMatch(id), [id]);
  if (loading) return <p className="wrap state">Loading match…</p>;
  if (error || !match) return <div className="wrap state error"><p>{error || "Match not found."}</p><Link to="/matches">Back to fixtures</Link></div>;
  const score = match.score || {};
  return (
    <article className="wrap match-detail">
      <Link className="back" to="/matches">← All matches</Link>
      <p className="eyebrow">{match.sport}{match.competition ? ` · ${match.competition}` : ""}</p>
      <h1>{match.home?.name} <span className="versus">vs</span> {match.away?.name}</h1>
      <p className={`match-status ${match.status === "live" ? "is-live" : ""}`}>{match.status === "live" && <i />}{match.status}</p>
      {match.source_url && <p className="muted small">Schedule: <a href={match.source_url} target="_blank" rel="noreferrer">{match.source || "Source"}</a></p>}
      <section className="scoreboard">
        <div className="score-teams"><div><h2>{match.home?.name}</h2><p>{(match.home?.players || []).join(" · ") || "Lineup not available"}</p></div>
          <strong>{score.home || "—"}<span> : </span>{score.away || "—"}</strong>
          <div className="away-team"><h2>{match.away?.name}</h2><p>{(match.away?.players || []).join(" · ") || "Lineup not available"}</p></div></div>
        {score.summary && <p className="score-summary">{score.summary}</p>}
        {match.result && <p className="score-summary">{match.result}</p>}
        {score.innings?.length > 0 && <section className="innings-scorecard" aria-label="Innings scorecard">
          <h3>Innings scoreboard</h3>
          <div className="innings-table-wrap"><table className="innings-table"><thead><tr><th>Team</th><th>Innings</th><th>Score</th><th>Overs</th></tr></thead>
            <tbody>{score.innings.map((innings, index) => <tr key={`${innings.team}-${innings.label}-${index}`}>
              <th>{innings.team}</th><td>{innings.label}</td><td><strong>{innings.runs}/{innings.wickets}{innings.declared ? " dec" : ""}</strong></td><td>{innings.overs}</td>
            </tr>)}</tbody></table></div>
        </section>}
      </section>
      <div className="match-detail-grid">
        <section><h2>Scorecard</h2>{Array.isArray(score.periods) && score.periods.length ? <div className="table-scroll"><table><thead><tr><th>Period</th><th>{match.home?.name}</th><th>{match.away?.name}</th></tr></thead><tbody>{score.periods.map((period, index) => <tr key={index}><th>{period.label || `Period ${index + 1}`}</th><td>{period.home ?? "—"}</td><td>{period.away ?? "—"}</td></tr>)}</tbody></table></div> : <p className="muted">Detailed scorecard is not available yet.</p>}</section>
        <section><h2>Match details</h2><dl className="match-info"><dt>Competition</dt><dd>{match.competition || "—"}</dd><dt>Date &amp; time</dt><dd>{new Date(match.starts_at).toLocaleString()}</dd><dt>Venue</dt><dd>{match.venue || "—"}</dd></dl></section>
      </div>
      {Array.isArray(score.events) && score.events.length > 0 && <section><h2>Match timeline</h2><ol className="timeline">{score.events.map((event, index) => <li key={index}><b>{event.time || ""}</b> {event.text || String(event)}</li>)}</ol></section>}
    </article>
  );
}
