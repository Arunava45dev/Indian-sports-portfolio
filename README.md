<div align="center">

<img src="assets/banner.svg" alt="Podium - 3D sports portfolio" width="100%"/>

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=21&duration=3000&pause=900&color=F472B6&center=true&vCenter=true&width=720&lines=Discover+athletes+straight+from+Wikipedia;Follow+live+matches+and+scorecards;Results+auto-refresh+every+90+seconds;Flask+%2B+React+%2B+MongoDB%2C+built+to+shine" alt="Typing animation"/>
</a>

<br/><br/>

<img src="https://skillicons.dev/icons?i=python,flask,react,vite,mongodb,threejs,js,git,github&theme=dark" alt="Tech stack"/>

<br/><br/>

<a href="#-quick-start"><img src="https://img.shields.io/badge/%F0%9F%9A%80_Quick_Start-7C3AED?style=for-the-badge&labelColor=0B0617" alt="Quick Start"/></a>
<a href="#-features"><img src="https://img.shields.io/badge/%E2%9C%A8_Features-EC4899?style=for-the-badge&labelColor=0B0617" alt="Features"/></a>
<a href="#-api-reference"><img src="https://img.shields.io/badge/%F0%9F%94%8C_API-F97316?style=for-the-badge&labelColor=0B0617" alt="API"/></a>
<a href="#-deploy"><img src="https://img.shields.io/badge/%F0%9F%8C%8D_Deploy-06B6D4?style=for-the-badge&labelColor=0B0617" alt="Deploy"/></a>

<br/>

<img src="https://img.shields.io/badge/status-active-00E676?style=flat-square&labelColor=0B0617" alt="Status"/>
<img src="https://img.shields.io/badge/API-REST-A78BFA?style=flat-square&labelColor=0B0617" alt="REST"/>
<img src="https://img.shields.io/badge/data-Wikipedia_%2B_TheSportsDB-F472B6?style=flat-square&labelColor=0B0617" alt="Data"/>
<img src="https://img.shields.io/badge/refresh-90s-FB923C?style=flat-square&labelColor=0B0617" alt="Refresh"/>
<img src="https://img.shields.io/badge/PRs-welcome-22D3EE?style=flat-square&labelColor=0B0617" alt="PRs welcome"/>

</div>

<img src="assets/divider.svg" width="100%" alt=""/>

## 🎯 About

**Podium** is a 3D sports portfolio where visitors explore athlete profiles, search Wikipedia for Indian sportspeople, and follow fixtures, live scores and results, all in one colourful place.

> [!NOTE]
> The sports list lives in MongoDB. Athlete search uses English Wikipedia, so results depend on Wikipedia coverage and backend internet access. Opening a result loads its photo (when available), article summary, infobox stats and career/achievement sections, and every profile links back to its source article.

<img src="assets/divider.svg" width="100%" alt=""/>

## ✨ Features

<img src="assets/features.svg" width="100%" alt="Podium features"/>

<img src="assets/divider.svg" width="100%" alt=""/>

## 🧱 Architecture

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#1B0B35','primaryTextColor':'#F5F3FF','primaryBorderColor':'#A78BFA','lineColor':'#F472B6','secondaryColor':'#2A0F2E','tertiaryColor':'#0B0617'}}}%%
flowchart LR
    U([👤 Visitor]) --> F[⚛️ React + Vite<br/>Frontend]
    F -->|REST /api| B[🐍 Flask API<br/>Gunicorn]
    B --> D[(🍃 MongoDB<br/>athletes, sports, matches, contacts)]
    B --> W[📖 Wikipedia<br/>athlete search]
    B --> S[🏟️ TheSportsDB<br/>fixtures and results]
    A([🛡️ Admin]) -->|X-Admin-Token| B
```

<img src="assets/divider.svg" width="100%" alt=""/>

## 🚀 Quick Start

<table>
<tr>
<td width="50%" valign="top">

### 🐍 Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
# Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

API runs on `http://localhost:5000`

</td>
<td width="50%" valign="top">

### ⚛️ Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL Vite prints in your terminal

</td>
</tr>
</table>

> [!TIP]
> Folder names (`backend/`, `frontend/`) and `.env.example` should match your repo. Edit the commands if yours differ.

## 🔧 Environment Variables

| Variable | Where | Purpose |
|---|:-:|---|
| `MONGODB_URI` | 🐍 backend | MongoDB connection string |
| `MONGODB_DB` | 🐍 backend | Database name |
| `ADMIN_TOKEN` | 🐍 backend | Secret for admin endpoints and the Schedule manager |
| `SPORTSDB_API_KEY` | 🐍 backend | Your TheSportsDB key (optional, defaults to free key `123`) |
| `CORS_ORIGINS` | 🐍 backend | Your frontend site URL |
| `VITE_API_URL` | ⚛️ frontend | URL of the deployed API |

<img src="assets/divider.svg" width="100%" alt=""/>

## ⚽ Match Center

The **Matches** page lists upcoming, live and completed fixtures. Each match can show:

| 👥 Lineups | 📍 Venue | 🔢 Score summary | 📊 Scorecard | ⏱️ Timeline |
|:-:|:-:|:-:|:-:|:-:|
| Team players | Where it's played | Quick result | Per-period breakdown | Key events |

Match records live in the `matches` collection. Use the **Schedule manager** on the page to add or update a match (needs the configured `ADMIN_TOKEN`). Scoreboard fields are intentionally flexible so they fit different sports.

<details>
<summary><b>📦 Example match record (click to expand)</b></summary>

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

</details>

### 📡 Data sources

| Source | What it gives |
|---|---|
| 🌐 **TheSportsDB** | Automatic fixtures and results, refreshed every 90 seconds. The free key `123` has restricted daily results, and lineups appear when the provider has them |
| 🏏 **BCCI schedule** | The published India–Sri Lanka 2026 series, included so it stays discoverable beyond the daily result limit |
| ✍️ **Operator entries** | Admin-entered records that supplement the feed |

> [!TIP]
> Set `SPORTSDB_API_KEY` in `backend/.env` to use your own key. Premium keys unlock broader schedules and the provider's live-score API.

<img src="assets/divider.svg" width="100%" alt=""/>

## 🔌 API Reference

### 🏃 Athletes, Sports and Contact

| Method | Endpoint | Notes |
|:-:|---|---|
| ![GET](https://img.shields.io/badge/GET-00C853?style=flat-square) | `/api/athletes` | `?sport=` `?q=` `?featured=true` |
| ![GET](https://img.shields.io/badge/GET-00C853?style=flat-square) | `/api/athletes/<slug or id>` | Single athlete |
| ![GET](https://img.shields.io/badge/GET-00C853?style=flat-square) | `/api/sports` | All sports |
| ![POST](https://img.shields.io/badge/POST-FF9100?style=flat-square) ![PUT](https://img.shields.io/badge/PUT-2979FF?style=flat-square) ![DELETE](https://img.shields.io/badge/DELETE-FF1744?style=flat-square) | `/api/athletes` | 🔐 needs header `X-Admin-Token` |
| ![POST](https://img.shields.io/badge/POST-FF9100?style=flat-square) | `/api/contact` | `name`, `email`, `message` |

### ⚽ Matches

| Method | Endpoint | Notes |
|:-:|---|---|
| ![GET](https://img.shields.io/badge/GET-00C853?style=flat-square) | `/api/matches` | Filters: `q`, `date`, `status`, `sport` |
| ![GET](https://img.shields.io/badge/GET-00C853?style=flat-square) | `/api/matches/<id>` | Single match |
| ![POST](https://img.shields.io/badge/POST-FF9100?style=flat-square) | `/api/matches` | 🔐 `X-Admin-Token` |
| ![PUT](https://img.shields.io/badge/PUT-2979FF?style=flat-square) | `/api/matches/<id>` | 🔐 `X-Admin-Token` |
| ![DELETE](https://img.shields.io/badge/DELETE-FF1744?style=flat-square) | `/api/matches/<id>` | 🔐 `X-Admin-Token` |

```http
GET /api/matches?q=India%20vs%20Sri%20Lanka
GET /api/matches?date=YYYY-MM-DD&status=live&sport=Cricket
```

<img src="assets/divider.svg" width="100%" alt=""/>

## 🔐 Admin Guide

### ➕ Add an athlete

```bash
curl -X POST localhost:5000/api/athletes \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_TOKEN" \
  -d '{"name":"New Athlete","slug":"new-athlete","sport":"Tennis","medals":{"gold":1,"silver":0,"bronze":0}}'
```

### 🧹 Reset the database

To intentionally replace all data and reload the sports list (with no starter athlete profiles), run from `backend/`:

```bash
python reset_database.py
```

> [!CAUTION]
> This **drops every collection** in `MONGODB_DB` before recreating the sports, an empty athlete collection and an empty contact-message collection. It cannot be undone.

<img src="assets/divider.svg" width="100%" alt=""/>

## 🌍 Deploy

<table>
<tr>
<td width="50%" valign="top">

### 🐍 API
**Render / Railway**

```bash
gunicorn app:app
```

- Set the `.env` values as environment variables
- Put your site URL in `CORS_ORIGINS`

</td>
<td width="50%" valign="top">

### ⚛️ Frontend
**Netlify / Vercel**

```bash
npm run build
```

- Host the `dist/` folder
- Set `VITE_API_URL` to your API URL

</td>
</tr>
</table>

<img src="assets/footer.svg" width="100%" alt="Built with passion for sport"/>
