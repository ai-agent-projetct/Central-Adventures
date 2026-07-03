"""Backend API tests for Central Adventures API.

Focus for this iteration:
- Brochures endpoints (list + PDF download + 404)
- Verify all previously-passing endpoints still return 200 with expected counts.
- POST /api/contact still works.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://scroll-adventure-map.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Health ----
def test_root(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data


# ---- Brochures list ----
def test_brochures_list(client):
    r = client.get(f"{API}/brochures")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 5
    ids = {b["id"] for b in data}
    expected = {"day-camp", "astronomy", "space-comm", "egypt", "nasa"}
    assert expected.issubset(ids)
    for b in data:
        for k in ("id", "title", "added", "subtitle", "contents"):
            assert k in b, f"missing field {k} in brochure {b}"
        assert isinstance(b["contents"], list)
        assert len(b["contents"]) >= 1


# ---- PDF downloads ----
@pytest.mark.parametrize("bid", ["nasa", "egypt", "day-camp"])
def test_brochure_pdf_download(client, bid):
    r = client.get(f"{API}/brochures/{bid}/download", timeout=30)
    assert r.status_code == 200
    ct = r.headers.get("content-type", "")
    assert "application/pdf" in ct, f"expected application/pdf, got {ct}"
    body = r.content
    assert body[:4] == b"%PDF", f"content doesn't start with %PDF: {body[:8]}"
    assert len(body) > 1024, f"pdf too small: {len(body)} bytes"
    # Content-Disposition should be attachment
    cd = r.headers.get("content-disposition", "")
    assert "attachment" in cd.lower()
    assert bid in cd


def test_brochure_download_404(client):
    r = client.get(f"{API}/brochures/nonexistent-id/download")
    assert r.status_code == 404


# ---- Previously passing endpoints ----
def test_global_destinations(client):
    r = client.get(f"{API}/destinations/global")
    assert r.status_code == 200
    d = r.json()
    assert len(d) == 6


def test_domestic_destinations(client):
    r = client.get(f"{API}/destinations/domestic")
    assert r.status_code == 200
    d = r.json()
    assert len(d) == 8


def test_packages(client):
    r = client.get(f"{API}/packages")
    assert r.status_code == 200
    d = r.json()
    assert len(d) == 6


def test_training_programs(client):
    r = client.get(f"{API}/training-programs")
    assert r.status_code == 200
    d = r.json()
    assert len(d) == 9


def test_gallery(client):
    r = client.get(f"{API}/gallery")
    assert r.status_code == 200
    d = r.json()
    assert len(d) == 12


# ---- POST /api/contact ----
def test_create_contact(client):
    payload = {
        "name": "TEST_User",
        "email": "test_user@example.com",
        "phone": "+911234567890",
        "destination": "NASA",
        "message": "Testing contact creation from backend tests.",
    }
    r = client.post(f"{API}/contact", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["name"] == payload["name"]
    assert d["email"] == payload["email"]
    assert "id" in d
