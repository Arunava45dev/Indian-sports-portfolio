<div align="center">

<img src="https://capsule-render.vercel.app/api?type=venom&color=0:0F0C29,50:302B63,100:FF512F&height=260&section=header&text=PODIUM&fontSize=90&fontColor=ffffff&animation=twinkling&fontAlignY=40&desc=Where%20Champions%20Come%20Alive%20in%203D&descSize=22&descAlignY=62" alt="Podium banner" width="100%"/>

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=900&color=FF512F&center=true&vCenter=true&width=700&lines=%F0%9F%8F%86+Discover+athletes+from+Wikipedia;%F0%9F%8F%9F%EF%B8%8F+Follow+live+matches+and+scorecards;%E2%9A%A1+Auto-refreshing+results+every+90+seconds;%F0%9F%8E%A8+A+3D+sports+portfolio+built+with+Flask+%2B+React" alt="Typing animation"/>
</a>

<br/>

<p>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="3D"/>
</p>

<p>
  <img src="https://img.shields.io/badge/status-active-00e676?style=flat-square&logo=statuspage&logoColor=white" alt="Status"/>
  <img src="https://img.shields.io/badge/API-REST-ff6b6b?style=flat-square" alt="REST API"/>
  <img src="https://img.shields.io/badge/data-Wikipedia%20%2B%20TheSportsDB-f9a825?style=flat-square" alt="Data"/>
  <img src="https://img.shields.io/badge/PRs-welcome-e91e63?style=flat-square" alt="PRs welcome"/>
  <img src="https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F%20in%20India-ff9933?style=flat-square" alt="Made in India"/>
</p>

<h3>
  <a href="#-quick-start">🚀 Quick Start</a>
  <span> • </span>
  <a href="#-features">✨ Features</a>
  <span> • </span>
  <a href="#-api-reference">🔌 API</a>
  <span> • </span>
  <a href="#-deploy">☁️ Deploy</a>
</h3>

</div>

---

## 📑 Table of Contents

- [🎯 About](#-about)
- [✨ Features](#-features)
- [🧱 Architecture](#-architecture)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Variables](#️-environment-variables)
- [🏟️ Match Center](#️-match-center)
- [🔌 API Reference](#-api-reference)
- [🛠️ Admin Guide](#️-admin-guide)
- [☁️ Deploy](#-deploy)

---

## 🎯 About

**Podium** is a 3D sports portfolio where visitors can explore athlete profiles, search Wikipedia for Indian sportspeople, and follow fixtures, live scores and results, all in one colourful place.

> [!NOTE]
> The sports list lives in MongoDB. Athlete search uses English Wikipedia, so results depend on Wikipedia coverage and backend internet access. Every profile links back to its source article.

---

## ✨ Features

<table>
<tr>
<td width="33%" align="center">

### 🏅
**Athlete Profiles**

Photo, article summary, infobox stats, career and achievement sections

</td>
<td width="33%" align="center">

### 🔎
**Wikipedia Search**

Search any athlete; matching Indian sportspeople appear instantly

</td>
<td width="33%" align="center">

### 🏟️
**Match Center**

Upcoming, live and completed fixtures with lineups and timelines

</td>
</tr>
<tr>
<td width="33%" align="center">

### ⚡
**Live Refresh**

Fixtures and results update every 90 seconds

</td>
<td width="33%" align="center">

### 🧩
**Flexible Scoreboards**

One schema for cricket, football, tennis and more

</td>
<td width="33%" align="center">

### 🔐
**Admin Tools**

Add, edit or delete athletes and matches with a secure token

</td>
</tr>
</table>

---

## 🧱 Architecture

```mermaid
flowchart LR
    U([👤 Visitor]) --> F[⚛️ React + Vite<br/>Frontend]
    F -->|REST /api| B[🐍 Flask API<br/>Gunicorn]
    B --> D[(🍃 MongoDB<br/>athletes, sports, matches, contacts)]
    B --> W[📖 Wikipedia<br/>athlete search]
    B --> S[🏟️ TheSportsDB<br/>fixtures and results]
    A([🛡️ Admin]) -->|X-Admin-Token| B

    style F fill:#20232a,stroke:#61dafb,color:#fff
    style B fill:#1e1e1e,stroke:#ffd43b,color:#fff
    style D fill:#13aa52,stroke:#0b6e35,color:#fff
    style W fill:#fff,stroke:#999,color:#000
    style S fill:#ff512f,stroke:#b53015,color:#fff
```

---

## 🚀 Quick Start

### 1️⃣ Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in your values
python app.py
```

The API runs on **http://localhost:5000** 🎉

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

> [!TIP]
> Folder names above (`backend/`, `frontend/`) and the `.env.example` file should match your repo. Edit the commands if yours differ.

---

## ⚙️ Environment Variables

| Variable | Where | Purpose |
|---|:-:|---|
| `MONGODB_URI` | 🐍 backend | MongoDB connection string |
| `MONGODB_DB` | 🐍 backend | Database name |
| `ADMIN_TOKEN` | 🐍 backend | Secret for admin endpoints and the Schedule manager |
| `SPORTSDB_API_KEY` | 🐍 backend | Your TheSportsDB key (optional, defaults to free key `123`) |
| `CORS_ORIGINS` | 🐍 backend | Your frontend site URL |
| `VITE_API_URL` | ⚛️ frontend | URL of the deployed API |

---

## 🏟️ Match Center

The **Matches** page lists upcoming, live, and completed fixtures. Each match can show:

| 👥 Lineups | 📍 Venue | 🔢 Score summary | 📊 Scorecard | ⏱️ Timeline |
|:-:|:-:|:-:|:-:|:-:|
| Team players | Where it's played | Quick result | Per-period breakdown | Key events |

Match records live in the `matches` collection. Use the **Schedule manager** on the page to add or update a match (needs the configured `ADMIN_TOKEN`). Scoreboard fields are intentionally flexible so they work across sports.

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

### 📡 Where the data comes from

| Source | What it gives |
|---|---|
| 🌐 **TheSportsDB** | Automatic fixtures and results, refreshed every 90 seconds. The free key `123` has restricted daily results, and lineups appear when the provider has them |
| 🏏 **BCCI schedule** | The published India–Sri Lanka 2026 series, included so it stays discoverable beyond the daily result limit |
| ✍️ **Operator entries** | Admin-entered records that supplement the feed |

> [!TIP]
> Set `SPORTSDB_API_KEY` in `backend/.env` to use your own key. Premium keys unlock broader schedules and the provider's live-score API.

---

## 🔌 API Reference

### 🏃 Athletes, Sports and Contact

| Method | Endpoint | Notes |
|:-:|---|---|
| ![GET](https://img.shields.io/badge/GET-00c853?style=flat-square) | `/api/athletes` | `?sport=` `?q=` `?featured=true` |
| ![GET](https://img.shields.io/badge/GET-00c853?style=flat-square) | `/api/athletes/<slug or id>` | Single athlete |
| ![GET](https://img.shields.io/badge/GET-00c853?style=flat-square) | `/api/sports` | All sports |
| ![POST](https://img.shields.io/badge/POST-ff9100?style=flat-square) ![PUT](https://img.shields.io/badge/PUT-2979ff?style=flat-square) ![DELETE](https://img.shields.io/badge/DELETE-ff1744?style=flat-square) | `/api/athletes` | 🔐 needs header `X-Admin-Token` |
| ![POST](https://img.shields.io/badge/POST-ff9100?style=flat-square) | `/api/contact` | `name`, `email`, `message` |

### 🏟️ Matches

| Method | Endpoint | Notes |
|:-:|---|---|
| ![GET](https://img.shields.io/badge/GET-00c853?style=flat-square) | `/api/matches` | Filters: `q`, `date`, `status`, `sport` |
| ![GET](https://img.shields.io/badge/GET-00c853?style=flat-square) | `/api/matches/<id>` | Single match |
| ![POST](https://img.shields.io/badge/POST-ff9100?style=flat-square) | `/api/matches` | 🔐 `X-Admin-Token` |
| ![PUT](https://img.shields.io/badge/PUT-2979ff?style=flat-square) | `/api/matches/<id>` | 🔐 `X-Admin-Token` |
| ![DELETE](https://img.shields.io/badge/DELETE-ff1744?style=flat-square) | `/api/matches/<id>` | 🔐 `X-Admin-Token` |

```http
GET /api/matches?q=India%20vs%20Sri%20Lanka
GET /api/matches?date=YYYY-MM-DD&status=live&sport=Cricket
```

---

## 🛠️ Admin Guide

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

---

## ☁️ Deploy

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

---

<div align="center">

### 🌟 Enjoying Podium? Drop a star and share it!

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&duration=4000&pause=1000&color=E100FF&center=true&vCenter=true&width=500&lines=Built+with+passion+for+sport+%F0%9F%8F%85;Thanks+for+visiting!+%F0%9F%92%9C" alt="Footer typing"/>

<img src="https://capsule-render.vercel.app/api?type=venom&color=0:FF512F,50:302B63,100:0F0C29&height=140&section=footer" alt="footer" width="100%"/>

</div>
