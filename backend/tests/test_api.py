def test_athlete_list_search_and_detail(client):
    import app as application

    application.sports.insert_one({"name": "Tennis"})
    response = client.post(
        "/api/athletes",
        headers={"X-Admin-Token": "test-admin-token"},
        json={"name": "Test Player", "slug": "test-player", "sport": "Tennis"},
    )
    assert response.status_code == 201
    listing = client.get("/api/athletes?q=Test")
    assert [item["name"] for item in listing.json] == ["Test Player"]
    detail = client.get("/api/athletes/test-player")
    assert detail.status_code == 200
    assert detail.json["country"] == "India"


def test_athlete_admin_requires_token_and_validates_sport(client):
    assert client.post("/api/athletes", json={}).status_code == 401
    response = client.post(
        "/api/athletes",
        headers={"X-Admin-Token": "test-admin-token"},
        json={"name": "Test Player", "slug": "test-player", "sport": "Unknown"},
    )
    assert response.status_code == 400


def test_match_crud_and_validation(client, admin_headers):
    invalid = client.post("/api/matches", headers=admin_headers, json={"sport": "Cricket"})
    assert invalid.status_code == 400
    created = client.post(
        "/api/matches",
        headers=admin_headers,
        json={"sport": "Cricket", "starts_at": "2026-11-28T10:00:00Z", "status": "upcoming",
              "home": {"name": "India"}, "away": {"name": "Australia"}},
    )
    assert created.status_code == 201
    match_id = created.json["id"]
    assert client.get(f"/api/matches/{match_id}").status_code == 200
    listed = client.get("/api/matches?date=2026-11-28")
    assert any(item["id"] == match_id for item in listed.json)
    assert client.put(f"/api/matches/{match_id}", headers=admin_headers,
                      json={"status": "completed"}).status_code == 200
    assert client.delete(f"/api/matches/{match_id}", headers=admin_headers).status_code == 200
    assert client.get(f"/api/matches/{match_id}").status_code == 404


def test_contact_validation_and_storage(client):
    assert client.post("/api/contact", json={}).status_code == 400
    response = client.post("/api/contact", json={"name": "A User", "email": "a@example.org",
                                                "message": "Please contact me soon."})
    assert response.status_code == 201


def test_health_endpoint(client, monkeypatch):
    # Health checks the live Mongo connection, so replace its ping for this isolated test.
    import app as application

    class Admin:
        @staticmethod
        def command(_command):
            return {"ok": 1}

    class Client:
        admin = Admin()

    monkeypatch.setattr(application, "client", Client())
    assert client.get("/api/health").json == {"status": "ok"}
