import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { getAthletes } from "../api.js";
import AthleteCard from "../components/AthleteCard.jsx";
import useFetch from "../components/useFetch.js";

const Hero3D = lazy(() => import("../components/Hero3D.jsx"));

export default function Home() {
  const { data, error, loading } = useFetch(() => getAthletes({ featured: "true" }));
  return (
    <>
      <section className="hero">
        <div className="hero-3d">
          <Suspense fallback={null}><Hero3D /></Suspense>
        </div>
        <div className="hero-copy wrap">
          <h1>Every season, on the record.</h1>
          <p>Explore Indian athletes and the sports they play, all in one place.</p>
          <Link to="/athletes" className="btn">Browse athletes</Link>
        </div>
      </section>

      <section className="wrap">
        <h2>Featured athletes</h2>
        {loading && <p className="state">Loading athletes…</p>}
        {error && <p className="state error">{error}</p>}
        {data && data.length === 0 && <p className="state">No featured athletes yet.</p>}
        <div className="grid">
          {data?.map((a) => <AthleteCard key={a.id} athlete={a} />)}
        </div>
      </section>
    </>
  );
}
