import { Link } from "react-router-dom";

const initials = (name) => name.split(" ").map((p) => p[0]).slice(0, 2).join("");

export default function AthleteCard({ athlete }) {
  const { slug, name, sport, position, tagline, image_url, medals = {} } = athlete;
  return (
    <Link to={`/athletes/${slug}`} className="card">
      <div className="card-media">
        {image_url ? <img src={image_url} alt="" loading="lazy" /> : <span>{initials(name)}</span>}
      </div>
      <div className="card-body">
        <h3>{name}</h3>
        <p className="muted">{sport}, {position}</p>
        <p>{tagline}</p>
        <p className="medals">
          <span className="dot gold" />{medals.gold ?? 0}
          <span className="dot silver" />{medals.silver ?? 0}
          <span className="dot bronze" />{medals.bronze ?? 0}
        </p>
      </div>
    </Link>
  );
}
