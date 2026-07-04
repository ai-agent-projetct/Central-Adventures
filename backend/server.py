from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import StreamingResponse, FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
UPLOADS_DIR = ROOT_DIR / "uploads" / "brochures"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Central Adventures API")
api_router = APIRouter(prefix="/api")


# ============== MODELS ==============
class ContactInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    destination: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactInquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=120)
    phone: str = Field(min_length=6, max_length=20)
    destination: Optional[str] = Field(default=None, max_length=100)
    message: str = Field(min_length=5, max_length=1500)


class BrochureRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    brochure_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BrochureRequestCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=120)
    phone: str = Field(min_length=6, max_length=20)
    brochure_id: str


# ============== ROUTES ==============
@api_router.get("/")
async def root():
    return {"message": "Central Adventures API - Where Education Meets Adventure"}


@api_router.post("/contact", response_model=ContactInquiry)
async def create_contact(payload: ContactInquiryCreate):
    obj = ContactInquiry(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_inquiries.insert_one(doc)
    logger.info(f"New contact inquiry: {obj.name} <{obj.email}> - {obj.destination}")
    return obj


@api_router.get("/contact", response_model=List[ContactInquiry])
async def list_contacts():
    docs = await db.contact_inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return docs


@api_router.post("/brochure-request", response_model=BrochureRequest)
async def brochure_request(payload: BrochureRequestCreate):
    obj = BrochureRequest(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.brochure_requests.insert_one(doc)
    return obj


# ============== STATIC CONTENT ==============
GLOBAL_DESTINATIONS = [
    {
        "id": "liberty",
        "name": "Statue of Liberty",
        "country": "New York, USA",
        "time_of_day": "sunrise",
        "video_start": 0,
        "video_end": 2.86,
        "sky": {"from": "#FF7A00", "to": "#F5D9AA"},
        "tagline": "A monument, a message, a memory",
        "description": "Where every immigrant's dream first touched shore. Sail past Lady Liberty at sunrise, then explore Ellis Island's living archives — stories that built modern America.",
        "image": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/486atatb_Statue-of-Liberty-Island-New-York.webp",
        "highlights": ["Liberty Island ferry", "Ellis Island Museum", "Battery Park", "One World Observatory"]
    },
    {
        "id": "washington",
        "name": "Washington D.C.",
        "country": "USA Capital",
        "time_of_day": "morning",
        "video_start": 2.86,
        "video_end": 5.71,
        "sky": {"from": "#FFB27A", "to": "#7EC8E3"},
        "tagline": "Where a nation writes its history",
        "description": "The White House, Capitol Hill, Lincoln Memorial and the Smithsonian's 19 free museums. Government meets genius on the National Mall.",
        "image": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/hkye61nj_washington-dc-1.jpg",
        "highlights": ["White House", "Capitol Hill", "Lincoln Memorial", "Smithsonian Museums"]
    },
    {
        "id": "egypt",
        "name": "Pyramids of Giza",
        "country": "Egypt",
        "time_of_day": "day",
        "video_start": 5.71,
        "video_end": 8.57,
        "sky": {"from": "#F5B461", "to": "#E29578"},
        "tagline": "Standing at the edge of 4,500 years",
        "description": "Valley of Kings, Philae Temple, snorkelling in Hurghada and dinner cruises on the eternal Nile.",
        "image": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/sr67bsij_images%20%282%29.jpeg",
        "highlights": ["Great Pyramid", "Sphinx", "Valley of Kings", "Nile Cruise"]
    },
    {
        "id": "nasa",
        "name": "NASA Kennedy Space Center",
        "country": "Florida, USA",
        "time_of_day": "day",
        "video_start": 8.57,
        "video_end": 11.43,
        "sky": {"from": "#4CA1AF", "to": "#F5D9AA"},
        "tagline": "Where dreams ignite at dawn",
        "description": "Witness Atlantis, walk the Rocket Garden, meet real astronauts. 6,000+ students have made this journey with us since 1987.",
        "image": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/55ko47zb_images%20%281%29.jpeg",
        "highlights": ["Atlantis Exhibit", "Rocket Garden", "Astronaut Encounter", "ATX Program"]
    },
    {
        "id": "singapore",
        "name": "Marina Bay · Singapore",
        "country": "Singapore",
        "time_of_day": "dusk",
        "video_start": 11.43,
        "video_end": 14.29,
        "sky": {"from": "#1B2951", "to": "#7A3B69"},
        "tagline": "A city that glows at night",
        "description": "Gardens by the Bay, Universal Studios and the Science Centre — where technology meets tropical nature.",
        "image": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/yd413cei_images%20%287%29.jpeg",
        "image_night": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/zkqto252_images%20%286%29.jpeg",
        "highlights": ["Gardens by the Bay", "Universal Studios", "Science Centre", "Sentosa"]
    },
    {
        "id": "malaysia",
        "name": "Petronas Towers · Kuala Lumpur",
        "country": "Malaysia",
        "time_of_day": "night",
        "video_start": 14.29,
        "video_end": 17.14,
        "sky": {"from": "#040914", "to": "#1B2951"},
        "tagline": "Twin lights against the tropical sky",
        "description": "Kuala Lumpur, Genting Highlands and Langkawi — Southeast Asia at its finest, from soaring towers to island paradises.",
        "image": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/el1royqi_images%20%285%29.jpeg",
        "highlights": ["Petronas Towers", "Genting Highlands", "Batu Caves", "Langkawi"]
    },
    {
        "id": "dubai",
        "name": "Burj Khalifa · Dubai",
        "country": "UAE",
        "time_of_day": "sunset",
        "video_start": 17.14,
        "video_end": 20,
        "sky": {"from": "#7A3B69", "to": "#E29578"},
        "tagline": "Golden hour above the desert",
        "description": "From the world's tallest tower to Desert Safaris and the Miracle Garden — where luxury meets learning.",
        "image": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/kvs1gjwn_images%20%283%29.jpeg",
        "image_night": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/au4b9cju_images%20%284%29.jpeg",
        "highlights": ["Burj Khalifa Deck", "Desert Safari", "Dubai Frame", "Global Village"]
    }
]

JOURNEY_VIDEO_URL = "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/3izhpors_hf_20260703_165724_86ffaa2f-cc80-4a9a-9b1d-caa765afa0d0.mp4"
JOURNEY_VIDEO_DURATION = 20.0
JOURNEY_VIDEO_LOCAL_WEBM = ROOT_DIR / "uploads" / "videos" / "journey.webm"
JOURNEY_VIDEO_LOCAL_MP4 = ROOT_DIR / "uploads" / "videos" / "journey.mp4"

DOMESTIC_DESTINATIONS = [
    {"id": "delhi-agra", "name": "Delhi – Agra", "desc": "Iconic monuments and Mughal heritage", "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80"},
    {"id": "manali", "name": "Kullu – Manali", "desc": "Himalayan adventure trails", "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80"},
    {"id": "kerala", "name": "Thiruvananthapuram", "desc": "VSSC space centre & coastal beauty", "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80"},
    {"id": "jaipur", "name": "Jaipur – Jaisalmer", "desc": "Desert kingdoms and forts", "image": "https://images.pexels.com/photos/32261804/pexels-photo-32261804.jpeg?w=1200&q=80"},
    {"id": "munnar", "name": "Munnar – Thekkady", "desc": "Tea plantations and wildlife", "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80"},
    {"id": "uttarakhand", "name": "Uttarakhand", "desc": "Himalayan foothills and spiritual sites", "image": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80"},
    {"id": "kashmir", "name": "Kashmir", "desc": "Paradise on earth — Srinagar & Dal Lake", "image": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1200&q=80"},
    {"id": "chennai", "name": "Chennai & Mahabalipuram", "desc": "Ancient temples and shore temples", "image": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80"},
]

PACKAGES = [
    {"id": "nasa-usa", "name": "NASA & USA Grand Tour", "duration": "14 Days", "type": "International", "starting_price": "₹3,25,000", "image": "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1200&q=80", "includes": ["Flights", "5-star hotels", "NASA VIP access", "Niagara Falls", "UN HQ"]},
    {"id": "egypt-classic", "name": "Egypt Classic", "duration": "9 Days", "type": "International", "starting_price": "₹1,85,000", "image": "https://images.pexels.com/photos/15127135/pexels-photo-15127135.jpeg?w=1200&q=80", "includes": ["Pyramids", "Nile Cruise", "Hurghada snorkelling", "Valley of Kings"]},
    {"id": "singapore-malaysia", "name": "Singapore + Malaysia", "duration": "8 Days", "type": "International", "starting_price": "₹1,45,000", "image": "https://images.pexels.com/photos/18787363/pexels-photo-18787363.jpeg?w=1200&q=80", "includes": ["Universal Studios", "Petronas", "Sentosa", "Genting"]},
    {"id": "dubai-desert", "name": "Dubai Desert Discovery", "duration": "6 Days", "type": "International", "starting_price": "₹1,10,000", "image": "https://images.pexels.com/photos/5577693/pexels-photo-5577693.jpeg?w=1200&q=80", "includes": ["Burj Khalifa", "Desert Safari", "Miracle Garden", "Dubai Frame"]},
    {"id": "isro-tour", "name": "ISRO & VSSC Space Trail", "duration": "7 Days", "type": "Domestic", "starting_price": "₹42,000", "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80", "includes": ["Sriharikota", "VSSC", "Vainu Bappu", "Kavalur"]},
    {"id": "kashmir-paradise", "name": "Kashmir Paradise", "duration": "6 Days", "type": "Domestic", "starting_price": "₹38,000", "image": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1200&q=80", "includes": ["Dal Lake", "Gulmarg", "Pahalgam", "Shikara"]},
]

TRAINING_PROGRAMS = [
    {"id": "aeromodelling", "icon": "Plane", "title": "Aeromodelling Workshop", "desc": "Students learn aerodynamics and build their own flying model aircraft from scratch — from balsa wood to final flight."},
    {"id": "drone", "icon": "Send", "title": "Drone Modelling", "desc": "Hands-on training in drone assembly, flight control systems, calibrations, and live quadcopter flying."},
    {"id": "rocket", "icon": "Rocket", "title": "Rocket Modelling", "desc": "Design, construct, and launch model rockets — water rockets and solid-fuel chemical rockets."},
    {"id": "astro", "icon": "Telescope", "title": "Astronomy & Stargazing", "desc": "Celestial navigation, telescope operation, and night-sky observation of eclipses and planets."},
    {"id": "planetarium", "icon": "Sparkles", "title": "Space Planetarium", "desc": "Immersive mobile dome — advanced projection brings galaxies, nebulae, and solar systems to life."},
    {"id": "telescope", "icon": "Search", "title": "Telescope Making", "desc": "Build a fully functional telescope from optical components to final assembly."},
    {"id": "comm", "icon": "Radio", "title": "Space Communications", "desc": "Discover satellite communications with ISRO scientists — includes ISRO Satellite Centre, Bangalore."},
    {"id": "satellite", "icon": "Satellite", "title": "Satellite Making", "desc": "Design satellite models and experience high altitude balloon launches to the edge of space."},
    {"id": "ham", "icon": "RadioTower", "title": "HAM Radio Workshop", "desc": "Master wireless communications and earn the government-issued Amateur Station Operator Certificate."},
]

GALLERY_IMAGES = [
    {"id": 1, "url": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/sr67bsij_images%20%282%29.jpeg", "category": "NASA Tour", "caption": "Kennedy Space Center visitor complex"},
    {"id": 2, "url": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/55ko47zb_images%20%281%29.jpeg", "category": "Egypt Tour", "caption": "The Sphinx and Pyramids of Giza"},
    {"id": 3, "url": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/kvs1gjwn_images%20%283%29.jpeg", "category": "General Tour", "caption": "Dubai skyline at sunset"},
    {"id": 4, "url": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/yd413cei_images%20%287%29.jpeg", "category": "General Tour", "caption": "Marina Bay Sands, Singapore"},
    {"id": 5, "url": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1000&q=80", "category": "General Tour", "caption": "Kashmir Dal Lake"},
    {"id": 6, "url": "https://images.pexels.com/photos/32261804/pexels-photo-32261804.jpeg?w=1000&q=80", "category": "General Tour", "caption": "Jaipur heritage"},
    {"id": 7, "url": "https://images.unsplash.com/photo-1506947411487-a56738267384?w=1000&q=80", "category": "NASA Tour", "caption": "Drone training"},
    {"id": 8, "url": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1000&q=80", "category": "DUDHWA NATIONAL PARK", "caption": "Wildlife safari"},
    {"id": 9, "url": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1000&q=80", "category": "General Tour", "caption": "Himalayan trails"},
    {"id": 10, "url": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/el1royqi_images%20%285%29.jpeg", "category": "General Tour", "caption": "Petronas Towers, Kuala Lumpur"},
    {"id": 11, "url": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/486atatb_Statue-of-Liberty-Island-New-York.webp", "category": "General Tour", "caption": "Statue of Liberty"},
    {"id": 12, "url": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/hkye61nj_washington-dc-1.jpg", "category": "General Tour", "caption": "U.S. Capitol · Washington D.C."},
    {"id": 13, "url": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/h9qqkagj_National_Mall%2C_Lincoln_Memorial_04448v.jpg", "category": "General Tour", "caption": "National Mall & Lincoln Memorial"},
    {"id": 14, "url": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/au4b9cju_images%20%284%29.jpeg", "category": "General Tour", "caption": "Dubai at night"},
    {"id": 15, "url": "https://customer-assets.emergentagent.com/job_scroll-adventure-map/artifacts/zkqto252_images%20%286%29.jpeg", "category": "General Tour", "caption": "Singapore skyline"},
]

BROCHURES = [
    {"id": "day-camp", "title": "DAY ADVENTURE CAMP", "added": "Jun 2026", "subtitle": "One-day nature and adventure experiences for students of all ages.", "contents": ["Program overview", "Daily itinerary", "Safety protocols", "Learning outcomes", "Booking info"]},
    {"id": "astronomy", "title": "Astronomy & Cosmic Science Workshop", "added": "Jun 2026", "subtitle": "Multi-day workshop covering telescope operation, stargazing and celestial navigation.", "contents": ["Curriculum outline", "Equipment used", "Instructor bios", "School packages", "Testimonials"]},
    {"id": "space-comm", "title": "Space Science & Satellite Communication Workshop", "added": "Jun 2026", "subtitle": "Practical satellite building, HAM radio and ISRO expert sessions.", "contents": ["Modules", "ISRO expert list", "Hardware kits", "Ideal audience", "Book now"]},
    {"id": "egypt", "title": "Egypt Itinerary", "added": "Jun 2026", "subtitle": "9 days across Cairo, Luxor, Aswan and Hurghada — Pyramids to Nile cruises.", "contents": ["Day-wise plan", "Inclusions", "Exclusions", "Visa & flights", "Booking terms"]},
    {"id": "nasa", "title": "NASA – TOUR", "added": "Jun 2026", "subtitle": "14-day USA and NASA Kennedy Space Center flagship educational tour.", "contents": ["Day-wise plan", "NASA VIP access", "Hotels & flights", "ATX program", "Booking info"]},
]


@api_router.get("/destinations/global")
async def get_global_destinations():
    return GLOBAL_DESTINATIONS


@api_router.get("/journey-video")
async def get_journey_video():
    """Returns the scrollable flythrough video URLs (WebM + MP4) & duration."""
    return {
        "url": JOURNEY_VIDEO_URL,  # backwards-compat
        "sources": [
            {"type": "video/webm", "src": "/api/journey-video/file.webm"},
            {"type": "video/mp4",  "src": "/api/journey-video/file.mp4"},
        ],
        "duration": JOURNEY_VIDEO_DURATION,
    }


def _range_response(request: Request, path: Path, media_type: str):
    """Serve a file with HTTP Range support (206 Partial Content) so <video>
    can seek to arbitrary timestamps without re-downloading the whole file."""
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    file_size = path.stat().st_size
    range_header = request.headers.get("range") or request.headers.get("Range")

    if not range_header:
        # No range → full file (still expose Accept-Ranges so client learns it CAN seek)
        return FileResponse(
            str(path),
            media_type=media_type,
            headers={"Accept-Ranges": "bytes", "Cache-Control": "public, max-age=86400"},
        )

    # Parse "bytes=start-end"
    try:
        units, rng = range_header.split("=", 1)
        assert units.strip().lower() == "bytes"
        start_str, end_str = rng.split("-", 1)
        start = int(start_str) if start_str else 0
        end = int(end_str) if end_str else file_size - 1
    except Exception:
        raise HTTPException(status_code=416, detail="Invalid Range header")

    if start >= file_size or end >= file_size or start > end:
        raise HTTPException(
            status_code=416,
            detail="Range Not Satisfiable",
            headers={"Content-Range": f"bytes */{file_size}"},
        )

    chunk_size = end - start + 1

    def iter_chunk():
        with open(path, "rb") as f:
            f.seek(start)
            remaining = chunk_size
            block = 1024 * 64
            while remaining > 0:
                data = f.read(min(block, remaining))
                if not data:
                    break
                remaining -= len(data)
                yield data

    return StreamingResponse(
        iter_chunk(),
        status_code=206,
        media_type=media_type,
        headers={
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(chunk_size),
            "Cache-Control": "public, max-age=86400",
        },
    )


@api_router.get("/journey-video/file.webm")
async def journey_video_webm(request: Request):
    return _range_response(request, JOURNEY_VIDEO_LOCAL_WEBM, "video/webm")


@api_router.get("/journey-video/file.mp4")
async def journey_video_mp4(request: Request):
    return _range_response(request, JOURNEY_VIDEO_LOCAL_MP4, "video/mp4")


@api_router.get("/destinations/domestic")
async def get_domestic_destinations():
    return DOMESTIC_DESTINATIONS


@api_router.get("/packages")
async def get_packages():
    return PACKAGES


@api_router.get("/training-programs")
async def get_training_programs():
    return TRAINING_PROGRAMS


@api_router.get("/gallery")
async def get_gallery():
    return GALLERY_IMAGES


@api_router.get("/brochures")
async def get_brochures():
    return BROCHURES


@api_router.get("/brochures/{brochure_id}/download")
async def download_brochure(brochure_id: str):
    """Serve uploaded PDF if present, else generate one on the fly via reportlab."""
    brochure = next((b for b in BROCHURES if b["id"] == brochure_id), None)
    if not brochure:
        raise HTTPException(status_code=404, detail="Brochure not found")

    # 1. Prefer user-uploaded PDF (if any)
    uploaded = UPLOADS_DIR / f"{brochure_id}.pdf"
    if uploaded.exists():
        return FileResponse(
            path=str(uploaded),
            media_type="application/pdf",
            filename=f"central-adventures-{brochure_id}.pdf",
        )

    # 2. Fallback: generate a branded PDF using reportlab
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    import io

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm, leftMargin=2 * cm, rightMargin=2 * cm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("Title", parent=styles["Title"], fontSize=26, textColor=HexColor("#E29578"), spaceAfter=12, alignment=0)
    subtitle_style = ParagraphStyle("Sub", parent=styles["Normal"], fontSize=12, textColor=HexColor("#0A0F16"), spaceAfter=18, leading=18)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=15, textColor=HexColor("#0A0F16"), spaceBefore=12, spaceAfter=8)
    body = ParagraphStyle("Body", parent=styles["Normal"], fontSize=11, textColor=HexColor("#333333"), leading=17)
    footer_style = ParagraphStyle("Footer", parent=styles["Normal"], fontSize=9, textColor=HexColor("#6C7A89"), alignment=1)

    story = []
    story.append(Paragraph("CENTRAL ADVENTURES &amp; HOLIDAYS", ParagraphStyle("Brand", parent=styles["Normal"], fontSize=10, textColor=HexColor("#6C7A89"), spaceAfter=6)))
    story.append(Paragraph(brochure["title"], title_style))
    story.append(Paragraph(brochure["subtitle"], subtitle_style))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("What's inside", h2))
    for item in brochure["contents"]:
        story.append(Paragraph(f"• {item}", body))
    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph("About Central Group", h2))
    story.append(Paragraph(
        "Since 1987, Central Adventures &amp; Holidays has pioneered educational travel — taking 6,000+ students to NASA Kennedy Space Center and 600+ schools across India on transformative journeys. Founded and led by Milan Kumar Ittal, we combine Travel &amp; Learn with hands-on aerospace training programs delivered directly to your school campus.",
        body
    ))
    story.append(Spacer(1, 1 * cm))
    contact_table = Table([
        ["Phone", "+91 99870 15776 · +91 99580 44660"],
        ["Email", "centraladventures@yahoo.com"],
        ["Address", "Suite 307 D Wing, Crystal Plaza, New Link Road, Andheri, Mumbai 400053"],
        ["Website", "www.centraladventures.in"],
    ], colWidths=[3 * cm, 12 * cm])
    contact_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), HexColor("#E29578")),
        ("TEXTCOLOR", (1, 0), (1, -1), HexColor("#0A0F16")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -1), 0.3, HexColor("#EEEEEE")),
    ]))
    story.append(contact_table)
    story.append(Spacer(1, 1.5 * cm))
    story.append(Paragraph(f"© {datetime.now(timezone.utc).year} Central Group of Companies · Travel. Learn. Explore.", footer_style))

    doc.build(story)
    buffer.seek(0)

    filename = f"central-adventures-{brochure_id}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


# ============== BROCHURE UPLOAD (admin) ==============
# Accept multipart PDF and save as {brochure_id}.pdf so /download endpoint
# serves it going forward. Simple key-guarded endpoint — provide `admin_key`
# via BROCHURE_UPLOAD_KEY env (defaults to "central-2026" for demo).

@api_router.post("/brochures/{brochure_id}/upload")
async def upload_brochure(
    brochure_id: str,
    file: UploadFile = File(...),
    admin_key: str = Form(...),
):
    if admin_key != os.environ.get("BROCHURE_UPLOAD_KEY", "central-2026"):
        raise HTTPException(status_code=401, detail="Invalid admin key")
    if not any(b["id"] == brochure_id for b in BROCHURES):
        raise HTTPException(status_code=404, detail="Brochure not found")
    if not (file.content_type == "application/pdf" or (file.filename or "").lower().endswith(".pdf")):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")

    target = UPLOADS_DIR / f"{brochure_id}.pdf"
    data = await file.read()
    if len(data) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 20MB)")
    target.write_bytes(data)
    return {"ok": True, "brochure_id": brochure_id, "size": len(data)}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
