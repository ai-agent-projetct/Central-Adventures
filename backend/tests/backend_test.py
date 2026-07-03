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
    assert len(d) == 7
    ids = [x["id"] for x in d]
    expected_order = ["liberty", "washington", "egypt", "nasa", "singapore", "malaysia", "dubai"]
    assert ids == expected_order, f"order/ids mismatch: {ids}"
    # every entry must have numeric video_start/video_end and lie within [0,20]
    for item in d:
        assert "video_start" in item and "video_end" in item
        assert 0 <= float(item["video_start"]) < float(item["video_end"]) <= 20


# ---- Journey video endpoints ----
def test_journey_video_meta(client):
    r = client.get(f"{API}/journey-video")
    assert r.status_code == 200
    d = r.json()
    assert d["duration"] == 20.0
    assert isinstance(d.get("sources"), list) and len(d["sources"]) >= 2
    types = {s["type"] for s in d["sources"]}
    assert "video/webm" in types
    assert "video/mp4" in types


def test_journey_video_webm_full(client):
    """GET without Range → 200, full file, Accept-Ranges: bytes header must be present."""
    r = client.get(f"{API}/journey-video/file.webm", timeout=60)
    assert r.status_code == 200
    assert "video/webm" in r.headers.get("content-type", "")
    assert r.headers.get("accept-ranges", "").lower() == "bytes", \
        f"Accept-Ranges header missing/wrong: {r.headers.get('accept-ranges')}"
    size = len(r.content)
    # expect ~9.4MB
    assert 8 * 1024 * 1024 < size < 12 * 1024 * 1024, f"webm size out of range: {size}"


def test_journey_video_webm_range_start(client):
    """Range: bytes=0-1023 must return 206 with exactly 1024 bytes + Content-Range."""
    r = client.get(f"{API}/journey-video/file.webm",
                   headers={"Range": "bytes=0-1023"}, timeout=60)
    assert r.status_code == 206, f"expected 206, got {r.status_code}"
    assert r.headers.get("content-length") == "1024", \
        f"content-length: {r.headers.get('content-length')}"
    cr = r.headers.get("content-range", "")
    assert cr.startswith("bytes 0-1023/"), f"content-range: {cr}"
    total = int(cr.split("/")[-1])
    assert total > 8 * 1024 * 1024
    assert len(r.content) == 1024


def test_journey_video_webm_range_middle(client):
    """Range: bytes=5000000-5001000 must return 206 with 1001 bytes."""
    r = client.get(f"{API}/journey-video/file.webm",
                   headers={"Range": "bytes=5000000-5001000"}, timeout=60)
    assert r.status_code == 206, f"expected 206, got {r.status_code}"
    assert r.headers.get("content-length") == "1001", \
        f"content-length: {r.headers.get('content-length')}"
    cr = r.headers.get("content-range", "")
    assert cr.startswith("bytes 5000000-5001000/"), f"content-range: {cr}"
    assert len(r.content) == 1001


def test_journey_video_webm_range_out_of_bounds(client):
    """Range: bytes=99999999-99999999 must return 416."""
    r = client.get(f"{API}/journey-video/file.webm",
                   headers={"Range": "bytes=99999999-99999999"}, timeout=30)
    assert r.status_code == 416, f"expected 416, got {r.status_code}"


def test_journey_video_mp4_full(client):
    r = client.get(f"{API}/journey-video/file.mp4", timeout=60)
    assert r.status_code == 200
    assert "video/mp4" in r.headers.get("content-type", "")
    assert r.headers.get("accept-ranges", "").lower() == "bytes"
    size = len(r.content)
    assert 4 * 1024 * 1024 < size < 20 * 1024 * 1024, f"mp4 size out of range: {size}"


def test_journey_video_mp4_range(client):
    r = client.get(f"{API}/journey-video/file.mp4",
                   headers={"Range": "bytes=0-1023"}, timeout=60)
    assert r.status_code == 206
    assert r.headers.get("content-length") == "1024"
    assert len(r.content) == 1024


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
    assert len(d) == 15


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
