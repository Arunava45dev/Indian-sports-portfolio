"""TheSportsDB v1 adapter for fixture, result and lineup data."""

import os
import re
import copy
import threading
import time
from datetime import date, datetime, timedelta, timezone
from html import unescape

import requests

API_KEY = os.getenv("SPORTSDB_API_KEY", "123")
BASE_URL = f"https://www.thesportsdb.com/api/v1/json/{API_KEY}"
INDIA_TIMEZONE = timezone(timedelta(hours=5, minutes=30))
SPORT_ALIASES = {"football": "Soccer"}
LIVE_CODES = {"1H", "2H", "HT", "ET", "BT", "P", "LIVE", "Q1", "Q2", "Q3", "Q4", "IN PLAY"}
FINISHED_CODES = {"FT", "AOT", "FT_PEN", "AET", "PEN", "FINAL", "ENDED"}
_cache = {}
_cache_lock = threading.Lock()


def _cached(key, ttl, loader):
    now = time.monotonic()
    with _cache_lock:
        item = _cache.get(key)
        if item and now - item[0] < ttl:
            return copy.deepcopy(item[1])
    value = loader()
    with _cache_lock:
        _cache[key] = (time.monotonic(), value)
        if len(_cache) > 1024:
            cutoff = time.monotonic() - 3600
            for old_key in [old_key for old_key, item in _cache.items() if item[0] < cutoff]:
                _cache.pop(old_key, None)
            while len(_cache) > 1024:
                _cache.pop(next(iter(_cache)))
    return copy.deepcopy(value)


def _clean_text(value):
    value = re.sub(r"<[^>]*>", " ", str(value or ""))
    return re.sub(r"\s+", " ", unescape(value)).strip()


def _period_scores(value):
    lines = [re.sub(r"\s+", " ", unescape(line)).strip() for line in re.split(r"<br\s*/?>", str(value or ""), flags=re.I)]
    periods = []
    label = ""
    for line in lines:
        match = re.search(r"(quarter\s*\d+|period\s*\d+|half\s*\d+|set\s*\d+|inning\s*\d+|overtime)", line, re.I)
        if match:
            label = match.group(1).title()
            line = line[match.end():].strip(" :")
        scores = re.fullmatch(r"([\w./+-]+)\s+([\w./+-]+)", line)
        if label and scores:
            periods.append({"label": label, "home": scores.group(1), "away": scores.group(2)})
            label = ""
    return periods


def _status(event):
    code = str(event.get("strStatus") or "").strip().upper()
    if code in FINISHED_CODES or event.get("intHomeScore") is not None and event.get("intAwayScore") is not None and code not in LIVE_CODES:
        return "completed"
    if code in LIVE_CODES:
        return "live"
    return "upcoming"


def normalize_event(event):
    """Translate a TheSportsDB event to the match shape used by the frontend."""
    event_id = str(event.get("idEvent") or "")
    home_score, away_score = event.get("intHomeScore"), event.get("intAwayScore")
    status = _status(event)
    result = _clean_text(event.get("strResult"))
    periods = _period_scores(event.get("strResult"))
    return {
        "id": f"sportsdb-{event_id}", "external_id": event_id, "source": "TheSportsDB",
        "sport": event.get("strSport") or "Sport", "competition": event.get("strLeague") or "",
        "starts_at": event.get("strTimestamp") or f"{event.get('dateEvent', '')}T{event.get('strTime') or '00:00:00'}",
        "status": status, "venue": event.get("strVenue") or "",
        "home": {"name": event.get("strHomeTeam") or "Home", "players": []},
        "away": {"name": event.get("strAwayTeam") or "Away", "players": []},
        "score": {
            "home": str(home_score) if home_score is not None else "—",
            "away": str(away_score) if away_score is not None else "—",
            "summary": result if status == "live" else "",
            "periods": periods, "events": [],
        },
        "result": result if status == "completed" else "",
    }


def official_india_sri_lanka_fixtures(day=""):
    """BCCI-published 2026 fixtures omitted by the limited public calendar feed."""
    fixtures = [
        ("bcci-ind-sl-odi-1", "2026-12-13T14:00:00+05:30", "ACA-VDCA Cricket Stadium, Visakhapatnam"),
        ("bcci-ind-sl-odi-2", "2026-12-16T14:00:00+05:30", "Bengaluru"),
        ("bcci-ind-sl-odi-3", "2026-12-19T14:00:00+05:30", "Ahmedabad"),
        ("bcci-ind-sl-t20i-1", "2026-12-22T19:00:00+05:30", "Rajkot"),
        ("bcci-ind-sl-t20i-2", "2026-12-24T19:00:00+05:30", "Cuttack"),
        ("bcci-ind-sl-t20i-3", "2026-12-27T19:00:00+05:30", "Pune"),
    ]
    today = datetime.now(INDIA_TIMEZONE).date().isoformat()
    return [
        {
            "id": event_id, "source": "BCCI", "source_url": "https://www.bcci.tv/news/article/first-odi-between-india-and-sri-lanka-shifted-from-delhi-to-visakhapatnam",
            "sport": "Cricket", "competition": f"Sri Lanka tour of India · {event_id.rsplit('-', 2)[-2].upper()}",
            "starts_at": starts_at, "status": "upcoming", "venue": venue,
            "home": {"name": "India", "players": []}, "away": {"name": "Sri Lanka", "players": []},
            "score": {"home": "—", "away": "—", "summary": "Playing XI not announced", "periods": [], "events": []},
            "result": "",
        }
        for event_id, starts_at, venue in fixtures
        if starts_at[:10] >= today and (not day or starts_at.startswith(day))
    ]


def get_official_match(match_id):
    official = [*official_india_sri_lanka_fixtures(), *official_india_cricket_fixtures()]
    return next((match for match in official if match["id"] == match_id), None)


def official_india_cricket_fixtures(day=""):
    """BCCI-published India fixtures absent from TheSportsDB's limited feed."""
    fixtures = [
        {
            "id": "bcci-ind-nz-test-1", "starts_at": "2026-11-19T03:30:00+05:30", "ends_on": "2026-11-23",
            "home": "New Zealand", "away": "India", "competition": "India in New Zealand · 1st Test",
            "venue": "Cello Basin Reserve, Wellington",
            "source_url": "https://www.bcci.tv/matches/591d95d2-032c-48d6-9377-521b0d75130e/new-zealand-vs-india/match-details",
            "status": "live", "home_score": "368 & 119/2", "away_score": "720/9 d",
            "summary": "Stumps · New Zealand trail by 233 runs (Day 4)",
            "innings": [
                {"team": "New Zealand", "label": "1st innings", "runs": 368, "wickets": 10, "overs": "121.0"},
                {"team": "India", "label": "1st innings", "runs": 720, "wickets": 9, "overs": "166.0", "declared": True},
                {"team": "New Zealand", "label": "2nd innings", "runs": 119, "wickets": 2, "overs": "45.0"},
            ],
        },
        {
            "id": "bcci-ind-a-pakistan-shaheens-2026-11-22", "starts_at": "2026-11-22T10:00:00+00:00", "ends_on": "2026-11-22",
            "home": "India A", "away": "Pakistan Shaheens", "competition": "DP World Men's Asia Cup Rising Stars · Match 8",
            "venue": "West End Park International Cricket Stadium, Doha",
            "source_url": "https://www.bcci.tv/matches/df694319-6cfe-4fbe-9528-730ae1b3fec4/india-a-vs-pakistan-shaheens",
        },
        {
            "id": "bcci-ind-a-uae-2026-11-24", "starts_at": "2026-11-24T06:00:00+00:00", "ends_on": "2026-11-24",
            "home": "India A", "away": "United Arab Emirates", "competition": "DP World Men's Asia Cup Rising Stars · Match 11",
            "venue": "University of Doha for Science and Technology, Doha",
            "source_url": "https://www.bcci.tv/matches/6812d0db-232d-4d06-97f1-f770982d1730/india-a-vs-united-arab-emirates",
        },
        {
            "id": "bcci-ind-wu19-eng-wu19-2026-11-26", "starts_at": "2026-11-26T12:30:00+05:30", "ends_on": "2026-11-26",
            "home": "India Under-19s Women", "away": "England Under-19s Women", "competition": "England Under-19s Women in India · 1st T20I",
            "venue": "Vadodara International Cricket Stadium, Vadodara", "source_url": "https://www.bcci.tv/matches",
        },
        {
            "id": "bcci-ind-nz-test-2", "starts_at": "2026-11-27T03:30:00+05:30", "ends_on": "2026-12-01",
            "home": "New Zealand", "away": "India", "competition": "India in New Zealand · 2nd Test",
            "venue": "Hagley Oval, Christchurch",
            "source_url": "https://www.bcci.tv/matches/242119/new-zealand-vs-india",
        },
        {
            "id": "bcci-ind-wu19-eng-wu19-2026-11-28", "starts_at": "2026-11-28T07:30:00+05:30", "ends_on": "2026-11-28",
            "home": "India Under-19s Women", "away": "England Under-19s Women", "competition": "England Under-19s Women in India · 2nd T20I",
            "venue": "Vadodara International Cricket Stadium, Vadodara", "source_url": "https://www.bcci.tv/matches",
        },
        {
            "id": "bcci-ind-a-w-eng-a-w-2026-11-30", "starts_at": "2026-11-30T07:30:00+05:30", "ends_on": "2026-11-30",
            "home": "India A Women", "away": "England A Women", "competition": "England A Women in India · 1st T20",
            "venue": "Maharashtra Cricket Association Stadium, Pune", "source_url": "https://www.bcci.tv/matches",
        },
        {
            "id": "bcci-ind-wu19-eng-wu19-2026-12-01", "starts_at": "2026-12-01T12:30:00+05:30", "ends_on": "2026-12-01",
            "home": "India Under-19s Women", "away": "England Under-19s Women", "competition": "England Under-19s Women in India · 3rd T20I",
            "venue": "Contractor Stadium, Surat", "source_url": "https://www.bcci.tv/matches",
        },
        {
            "id": "bcci-ind-a-w-eng-a-w-2026-12-03", "starts_at": "2026-12-03T07:30:00+05:30", "ends_on": "2026-12-03",
            "home": "India A Women", "away": "England A Women", "competition": "England A Women in India · 2nd T20",
            "venue": "Maharashtra Cricket Association Stadium, Pune", "source_url": "https://www.bcci.tv/matches",
        },
    ]
    now = datetime.now(INDIA_TIMEZONE)
    today = now.date().isoformat()
    result = []
    for fixture in fixtures:
        starts_on = fixture["starts_at"][:10]
        ends_on = fixture["ends_on"]
        if day:
            if not (starts_on <= day <= ends_on):
                continue
        elif ends_on < today:
            continue

        starts_at = datetime.fromisoformat(fixture["starts_at"]).astimezone(INDIA_TIMEZONE)
        ends_at = datetime.combine(date.fromisoformat(ends_on), datetime.max.time(), tzinfo=INDIA_TIMEZONE)
        status = "live" if starts_at <= now <= ends_at else "completed" if ends_at < now else "upcoming"
        summary = fixture.get("summary")
        if not summary:
            summary = "Live · score details pending" if status == "live" else "Playing XI not announced"
        result.append({
            "id": fixture["id"], "source": "BCCI", "source_url": fixture["source_url"],
            "sport": "Cricket", "competition": fixture["competition"], "starts_at": fixture["starts_at"],
            "status": status, "venue": fixture["venue"],
            "home": {"name": fixture["home"], "players": []}, "away": {"name": fixture["away"], "players": []},
            "score": {
                "home": fixture.get("home_score", "—"), "away": fixture.get("away_score", "—"),
                "summary": summary, "periods": [], "events": [], "innings": fixture.get("innings", []),
            },
            "result": "",
        })
    return result


def events_for_day(day, sport=""):
    """Fetch daily fixtures. Cache limits upstream traffic and smooths page loads."""
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", day):
        raise ValueError("date must use YYYY-MM-DD format")
    date.fromisoformat(day)
    provider_sport = SPORT_ALIASES.get(sport.casefold(), sport) if sport else ""
    def load():
        response = requests.get(
            f"{BASE_URL}/eventsday.php", params={"d": day, **({"s": provider_sport} if provider_sport else {})},
            headers={"User-Agent": "PodiumMatchCenter/1.0"}, timeout=8,
        )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            raise ValueError("Invalid response from TheSportsDB")
        events = [normalize_event(event) for event in (payload.get("events") or []) if event.get("idEvent")]
        if not sport or sport.casefold() == "cricket":
            events.extend(official_india_sri_lanka_fixtures(day))
            events.extend(official_india_cricket_fixtures(day))
        return events
    return _cached(("day", day, provider_sport), 90, load)


def search_events(term):
    """Find events by matchup text; the free provider limits this endpoint to one result."""
    search_term = re.sub(r"\b(odi|t20i|test|match|vs|versus)\b", " ", term, flags=re.I)
    search_term = re.sub(r"\s+", "_", search_term.strip())
    search_term = search_term.strip("_")
    if not search_term:
        return []

    def load():
        response = requests.get(
            f"{BASE_URL}/searchevents.php", params={"e": search_term},
            headers={"User-Agent": "PodiumMatchCenter/1.0"}, timeout=8,
        )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            raise ValueError("Invalid event search response from TheSportsDB")
        events = payload.get("event") or payload.get("events") or []
        return [normalize_event(event) for event in events if event.get("idEvent")]
    return _cached(("search", search_term.casefold()), 90, load)


def event_lineups(event_id):
    def load():
        response = requests.get(
            f"{BASE_URL}/lookuplineup.php", params={"id": event_id},
            headers={"User-Agent": "PodiumMatchCenter/1.0"}, timeout=8,
        )
        response.raise_for_status()
        payload = response.json()
        home, away = [], []
        for player in payload.get("lineup") or []:
            name = player.get("strPlayer")
            if name:
                (home if str(player.get("strHome", "")).lower() in {"yes", "true", "1"} else away).append(name)
        return home, away
    return _cached(("lineup", event_id), 3600, load)


def get_event(event_id):
    def load():
        response = requests.get(
            f"{BASE_URL}/lookupevent.php", params={"id": event_id},
            headers={"User-Agent": "PodiumMatchCenter/1.0"}, timeout=8,
        )
        response.raise_for_status()
        payload = response.json()
        events = payload.get("events") or []
        if not events:
            return None
        match = normalize_event(events[0])
        home, away = event_lineups(event_id)
        match["home"]["players"], match["away"]["players"] = home, away
        return match
    return _cached(("event", event_id), 90, load)


def live_scores():
    """Fetch all-sport livescores for a configured premium TheSportsDB key."""
    if API_KEY == "123":
        return []

    def load():
        response = requests.get(
            "https://www.thesportsdb.com/api/v2/json/livescore/all",
            headers={"X-API-KEY": API_KEY, "User-Agent": "PodiumMatchCenter/1.0"}, timeout=8,
        )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            raise ValueError("Invalid livescore response from TheSportsDB")
        events = payload.get("livescore") or payload.get("events") or []
        return [normalize_event(event) for event in events if event.get("idEvent")]

    return _cached(("livescores",), 30, load)
