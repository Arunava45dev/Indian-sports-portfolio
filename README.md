<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7F00FF,50:E100FF,100:FF512F&height=220&section=header&text=PODIUM&fontSize=80&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=A%203D%20Sports%20Portfolio%20%E2%80%A2%20Athletes%20%E2%80%A2%20Matches%20%E2%80%A2%20Glory&descSize=18&descAlignY=60" alt="Podium banner" width="100%"/>

### 🏆 Celebrate athletes. Track matches. Experience sport in 3D.

<p>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Gunicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white" alt="Gunicorn"/>
</p>

<p>
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/PRs-Welcome-ff69b4?style=flat-square" alt="PRs welcome"/>
  <img src="https://img.shields.io/badge/Data-Wikipedia%20%2B%20TheSportsDB-orange?style=flat-square" alt="Data sources"/>
  <img src="https://img.shields.io/badge/Auto%20Refresh-90s-blueviolet?style=flat-square" alt="Auto refresh"/>
</p>

[✨ Features](#-features) •
[🏟️ Match Center](#️-match-center) •
[🔌 API](#-api-reference) •
[🛠️ Admin Guide](#️-admin-guide) •
[🚀 Deploy](#-deploy)

</div>

---

## ✨ Features

| | Feature | What it does |
|:-:|---|---|
| 🏅 | **Athlete Profiles** | Photo, article summary, infobox stats, and career/achievement sections |
| 🔎 | **Live Wikipedia Search** | Visitors search English Wikipedia; matching Indian sportspeople show up instantly |
| 🏟️ | **Match Center** | Upcoming, live and completed fixtures with lineups, scorecards and timelines |
| ⚡ | **Auto-Refresh** | Fixtures and results update every **90 seconds** from TheSportsDB |
| 🧩 | **Flexible Scoreboards** | One schema that fits cricket, football, tennis and more |
| 🔐 | **Admin Tools** | Add, update or delete athletes and matches with a secure token |
| 📬 | **Contact Form** | Visitors can send messages straight to the database |

> [!NOTE]
> The app keeps the sports list in MongoDB. Results depend on Wikipedia coverage and backend internet access. Every profile links back to its source article.

---

## 🏟️ Match Center

The **Matches** page lists upcoming, live, and completed fixtures. Each match can include:

- 👥 Team lineups
- 📍 Venue
- 🔢 Score summary
- 📊 Per-period scorecard
- ⏱️ Timeline events

Match records are stored in the `matches` collection. Use the **Schedule manager** on the page to add or update a match (requires the configured `ADMIN_TOKEN`).

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

### 📡 Data Sources

| Source | Role |
|---|---|
| **TheSportsDB** | Automatic fixtures & results, refreshed every 90 seconds. Free public key `123` has restricted daily results; lineups appear when the provider has them |
| **BCCI schedule** | The published India–Sri Lanka 2026 series is included so it stays discoverable beyond the daily result limit |
| **Operator entries** | Admin-entered records supplement the feed |

> [!TIP]
> Set `SPORTSDB_API_KEY` in `backend/.env` to use your own TheSportsDB key. Premium keys unlock broader schedules and the provider's live-score API.

---

## 🔌 API Reference

### 🏃 Athletes & Sports

| Method | Endpoint | Notes |
|:-:|---|---|
| ![GET](https://img.shields.io/badge/GET-2ea44f?style=flat-square) | `/api/athletes` | `?sport=` `?q=` `?featured=true` |
| ![GET](https://img.shields.io/badge/GET-2ea44f?style=flat-square) | `/api/athletes/<slug or id>` | Single athlete |
| ![GET](https://img.shields.io/badge/GET-2ea44f?style=flat-square) | `/api/sports` | List of sports |
| ![POST](https://img.shields.io/badge/POST%20%2F%20PUT%20%2F%20DELETE-e67e22?style=flat-square) | `/api/athletes` | 🔐 needs header `X-Admin-Token` |
| ![POST](https://img.shields.io/badge/POST-e67e22?style=flat-square) | `/api/contact` | `name`, `email`, `message` |

### 🏟️ Matches

| Method | Endpoint | Notes |
|:-:|---|---|
| ![GET](https://img.shields.io/badge/GET-2ea44f?style=flat-square) | `/api/matches` | Filters: `q`, `date`, `status`, `sport` |
| ![GET](https://img.shields.io/badge/GET-2ea44f?style=flat-square) | `/api/matches/<id>` | Single match |
| ![POST](https://img.shields.io/badge/POST-e67e22?style=flat-square) | `/api/matches` | 🔐 `X-Admin-Token` |
| ![PUT](https://img.shields.io/badge/PUT-3498db?style=flat-square) | `/api/matches/<id>` | 🔐 `X-Admin-Token` |
| ![DELETE](https://img.shields.io/badge/DELETE-e74c3c?style=flat-square) | `/api/matches/<id>` | 🔐 `X-Admin-Token` |

**Examples**

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

Intentionally replace all data and reload the sports list (with no starter athlete profiles). Run from `backend/`:

```bash
python reset_database.py
```

> [!CAUTION]
> This **drops every collection** in `MONGODB_DB` before recreating the sports, empty athlete collection, and empty contact-message collection. This cannot be undone.

---

## 🚀 Deploy

<table>
<tr>
<td width="50%" valign="top">

### 🐍 Backend (API)

Host on **Render** or **Railway**:

```bash
gunicorn app:app
```

- Set the `.env` values as environment variables
- Put your site URL in `CORS_ORIGINS`

</td>
<td width="50%" valign="top">

### ⚛️ Frontend

Host on **Netlify** or **Vercel**:

```bash
npm run build
```

- Deploy the `dist/` folder
- Set `VITE_API_URL` to your API URL

</td>
</tr>
</table>

---

<div align="center">

### 💜 If you like Podium, give it a ⭐

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF512F,50:E100FF,100:7F00FF&height=120&section=footer" alt="footer wave" width="100%"/>

</div>
