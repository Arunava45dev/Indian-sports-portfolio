import mongomock
import pytest

import app as application


@pytest.fixture
def client(monkeypatch):
    database = mongomock.MongoClient().sports_portfolio_test
    monkeypatch.setattr(application, "athletes", database.athletes)
    monkeypatch.setattr(application, "sports", database.sports)
    monkeypatch.setattr(application, "matches", database.matches)
    monkeypatch.setattr(application, "messages", database.messages)
    monkeypatch.setattr(application, "search_indian_players", lambda _query, _sport="": [])
    monkeypatch.setattr(application, "events_for_day", lambda _day, _sport="": [])
    monkeypatch.setattr(application, "live_scores", lambda: [])
    monkeypatch.setattr(application, "official_india_cricket_fixtures", lambda _day="": [])
    monkeypatch.setattr(application, "official_india_sri_lanka_fixtures", lambda _day="": [])
    monkeypatch.setattr(application, "_index_init_started", True)
    monkeypatch.setattr(application, "ADMIN_TOKEN", "test-admin-token")
    application.invalidate_athlete_list_cache()
    with application.app.test_client() as test_client:
        yield test_client
    application.invalidate_athlete_list_cache()


@pytest.fixture
def admin_headers():
    return {"X-Admin-Token": "test-admin-token"}
