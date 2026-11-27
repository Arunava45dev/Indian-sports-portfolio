import { Component, Suspense, lazy } from "react";
import { Link, useParams } from "react-router-dom";
import { getAthlete } from "../api.js";
import useFetch from "../components/useFetch.js";
import ScoutChat from "../components/ScoutChat.jsx";

const Podium3D = lazy(() => import("../components/Podium3D.jsx"));

class PodiumErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <p className="muted">Medal chart is unavailable.</p> : this.props.children;
  }
}

export default function AthleteDetail() {
  const { slug } = useParams();
  const { data: a, error, loading } = useFetch(() => getAthlete(slug), [slug]);

  if (loading) return <p className="wrap state">Loading athlete…</p>;
  if (error) return (
    <div className="wrap state error">
      <p>{error}</p>
      <Link to="/athletes">Back to all athletes</Link>
    </div>
  );
  if (!a || typeof a !== "object") return (
    <div className="wrap state error">
      <p>Player profile is unavailable. Please try again.</p>
      <Link to="/athletes">Back to all athletes</Link>
    </div>
  );

  const stats = a.stats && typeof a.stats === "object" ? a.stats : {};
  const achievements = Array.isArray(a.achievements) ? a.achievements : [];

  return (
    <article className="wrap detail">
      <Link to="/athletes" className="back">All athletes</Link>
      {a.image_url && <img className="profile-image" src={a.image_url} alt={`Portrait of ${a.name}`} />}
      <h1>{a.name}</h1>
      <p className="muted">{a.sport}, {a.position}, {a.country}</p>
      <p className="lead">{a.bio}</p>
      {a.source_url && <p><a href={a.source_url} target="_blank" rel="noreferrer">View Wikipedia source article</a></p>}

      <div className="detail-grid">
        <section>
          <h2>Medal podium</h2>
          <Suspense fallback={<div className="podium" />}>
            <PodiumErrorBoundary><Podium3D medals={a.medals || {}} /></PodiumErrorBoundary>
          </Suspense>
          <p className="muted small">Drag to rotate. Medal counts are shown when available in the profile record.</p>
        </section>

        <section>
          <h2>Key stats</h2>
          <dl className="stats">
            {Object.entries(stats).map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{typeof v === "string" || typeof v === "number" ? v : "—"}</dd></div>
            ))}
          </dl>
          {Object.keys(stats).length === 0 && <p className="muted">No key stats are listed for this player yet.</p>}

          <h2>Achievements</h2>
          <ol className="timeline">
            {achievements.map((x, i) => (
              <li key={`${x?.year || "unknown"}-${x?.title || i}-${i}`}>{x?.year && <><b>{x.year}</b> </>}{x?.title || "Achievement details unavailable"}</li>
            ))}
          </ol>
          {achievements.length === 0 && <p className="muted">No achievements are listed for this player yet.</p>}

          {a.highlights?.length > 0 && (
            <>
              <h2>Highlights</h2>
              <ul>{a.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
            </>
          )}
        </section>
      </div>
      <ScoutChat profiles={[a]} />
    </article>
  );
}
