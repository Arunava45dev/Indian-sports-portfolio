# Podium: 3D sports portfolio

Flask API + React (Vite, react-three-fiber) + MongoDB Atlas.

## 1. MongoDB Atlas
1. Create a free cluster, a database user, and add your IP under Network Access.
2. Copy the connection string (Drivers > Python).

## 2. Backend
```
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # paste your MONGODB_URI, set ADMIN_TOKEN
python app.py               # http://localhost:5000
```

## 3. Frontend
```
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxies /api to Flask)
```

## API
| Method | Path | Notes |
|---|---|---|
| GET | /api/athletes | ?sport= ?q= ?featured=true |
| GET | /api/athletes/<slug or id> | |
| GET | /api/sports | |
| POST/PUT/DELETE | /api/athletes | needs header `X-Admin-Token` |
| POST | /api/contact | name, email, message |

The app keeps the sports list in MongoDB and searches English Wikipedia when a
visitor searches for an athlete. Matching Indian sportspeople appear in the
results; opening a result loads its photo when available, article summary,
infobox stats, and career/achievement sections. Profiles link to their source
article. Results depend on Wikipedia coverage and backend internet access.

## Match Center
The Matches page lists upcoming, live, and completed fixtures. Each match can
include team lineups, venue, score summary, per-period scorecard, and timeline
events. Match records are stored in the `matches` collection. Use the Schedule
manager on the page to add or update a match; it requires the configured
`ADMIN_TOKEN`. The scoreboard fields are intentionally flexible for different
sports. For example:

```json
{
  "sport": "Cricket",
  "competition": "Example Cup",
  "starts_at": "2026-11-18T14:00:00+05:30",
  "status": "completed",
  "venue": "Mumbai",
  "home": { "name": "India", "players": ["Player One", "Player Two"] },
  "away": { "name": "Australia", "players": ["Player Three", "Player Four"] },
  "score": {
    "home": "182/6 (20 ov)",
    "away": "176/9 (20 ov)",
    "summary": "India won by 6 runs",
    "periods": [{ "label": "Innings 1", "home": "182/6", "away": "176/9" }],
    "events": [{ "time": "19.4 ov", "text": "Wicket" }]
  },
  "result": "India won by 6 runs"
}
```

Automatic fixtures and results come from TheSportsDB and refresh every 90 seconds
in the page. The free public feed uses key `123` and has restricted daily results;
lineups appear when the provider has them. The published India–Sri Lanka 2026
series is also included from BCCI's schedule so it remains discoverable beyond
the provider's daily result limit. Set `SPORTSDB_API_KEY` in
`backend/.env` to use your TheSportsDB key. Premium keys unlock broader schedules
and the provider's live-score API. Public endpoints:
`GET /api/matches?q=India%20vs%20Sri%20Lanka` searches teams and competitions;
`date`, `status`, and `sport` filters can also be passed. Example:
`GET /api/matches?date=YYYY-MM-DD&status=live&sport=Cricket` and
`GET /api/matches/<id>`. Admin endpoints use `X-Admin-Token`:
`POST /api/matches`, `PUT /api/matches/<id>`, and
`DELETE /api/matches/<id>`. Operator-entered records can supplement the feed.

To intentionally replace all data in the configured database and reload the
sports list (with no starter athlete profiles), run this from `backend/`:

```
python reset_database.py
```

This drops every collection in `MONGODB_DB` before recreating the sports,
empty athlete collection, and empty contact-message collection.

Add an athlete:
```
curl -X POST localhost:5000/api/athletes -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_TOKEN" \
  -d '{"name":"New Athlete","slug":"new-athlete","sport":"Tennis","medals":{"gold":1,"silver":0,"bronze":0}}'
```

## Deploy
- API: `gunicorn app:app` on Render/Railway; set the .env values as environment variables and put your site URL in `CORS_ORIGINS`.
- Frontend: `npm run build`, host `dist/` on Netlify/Vercel with `VITE_API_URL` set to the API URL.
