import { useEffect, useState } from "react";
import { getAthletes, getSports } from "../api.js";
import AthleteCard from "../components/AthleteCard.jsx";
import useFetch from "../components/useFetch.js";

export default function Athletes() {
  const [sport, setSport] = useState("");
  const [q, setQ] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(q), 200);
    return () => clearTimeout(timer);
  }, [q]);

  const sports = useFetch(getSports);
  const list = useFetch(() => getAthletes({ sport, q: searchTerm }), [sport, searchTerm]);
  const items = Array.isArray(list.data) ? list.data : [];

  return (
    <section className="wrap">
      <h1>Athletes</h1>
      <p className="muted">Browse Indian players across sports or search by name.</p>
      <div className="filters">
        <input
          type="search"
          placeholder="Search an Indian player"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search Indian athletes by name"
        />
        <label className="sport-select">Sport
          <select value={sport} onChange={(e) => setSport(e.target.value)} aria-label="Filter by sport">
            <option value="">All sports</option>
            {sports.data?.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      {list.loading && <p className="state">Loading Indian athletes…</p>}
      {list.error && <p className="state error">{list.error}</p>}
      {!list.loading && items.length === 0 && <p className="state">No athletes found. Clear the search or pick another sport.</p>}
      <div className="grid">
        {items.map((a) => <AthleteCard key={a.id} athlete={a} />)}
      </div>
    </section>
  );
}
