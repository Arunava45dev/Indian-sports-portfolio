import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Athletes from "./pages/Athletes.jsx";
import AthleteDetail from "./pages/AthleteDetail.jsx";
import Contact from "./pages/Contact.jsx";
import Matches, { MatchDetail } from "./pages/Matches.jsx";
import Scout from "./pages/Scout.jsx";

export default function App() {
  const { pathname } = useLocation();
  return (
    <>
      <header className="nav">
        <NavLink to="/" className="brand">Podium</NavLink>
        <nav>
          {pathname !== "/" && <Link className="back-home" to="/" aria-label="Back to home"><span>← Home</span><span className="back-home-short">←</span></Link>}
          <NavLink to="/athletes">Athletes</NavLink>
          <NavLink to="/matches">Matches</NavLink>
          <NavLink to="/scout">AI Scout</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/athletes" element={<Athletes />} />
          <Route path="/athletes/:slug" element={<AthleteDetail />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/scout" element={<Scout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<p className="wrap state">Page not found.</p>} />
        </Routes>
      </main>
      <footer className="foot">Podium. Athlete portfolios built to be seen.</footer>
    </>
  );
}
