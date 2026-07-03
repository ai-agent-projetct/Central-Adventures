from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
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
        "id": "nasa",
        "name": "NASA Kennedy Space Center",
        "country": "USA",
        "time_of_day": "sunrise",
        "sky": {"from": "#FF7A00", "to": "#F5D9AA"},
        "tagline": "Where dreams ignite at dawn",
        "description": "Witness Atlantis, walk the Rocket Garden, meet real astronauts. 6,000+ students have made this journey with us.",
        "image": "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1600&q=80",
        "highlights": ["Atlantis Exhibit", "Rocket Garden", "Astronaut Encounter", "ATX Program"]
    },
    {
        "id": "liberty",
        "name": "Statue of Liberty",
        "country": "New York, USA",
        "time_of_day": "morning",
        "sky": {"from": "#FFB27A", "to": "#7EC8E3"},
        "tagline": "A monument, a message, a memory",
        "description": "New York to Washington DC — UN HQ, Smithsonian, White House, and Lady Liberty herself.",
        "image": "https://images.pexels.com/photos/64271/queen-of-liberty-statue-of-liberty-new-york-liberty-statue-64271.jpeg?w=1600&q=80",
        "highlights": ["UN Headquarters", "Smithsonian", "White House Tour", "Times Square"]
    },
    {
        "id": "egypt",
        "name": "Pyramids of Giza",
        "country": "Egypt",
        "time_of_day": "day",
        "sky": {"from": "#F5B461", "to": "#E29578"},
        "tagline": "Standing at the edge of 4,500 years",
        "description": "Valley of Kings, Philae Temple, Snorkelling in Hurghada, and dinner cruises on the Nile.",
        "image": "https://images.pexels.com/photos/15127135/pexels-photo-15127135.jpeg?w=1600&q=80",
        "highlights": ["Great Pyramid", "Valley of Kings", "Philae Temple", "Nile Cruise"]
    },
    {
        "id": "dubai",
        "name": "Burj Khalifa",
        "country": "Dubai, UAE",
        "time_of_day": "sunset",
        "sky": {"from": "#7A3B69", "to": "#E29578"},
        "tagline": "Golden hour above the desert",
        "description": "From the world's tallest tower to Desert Safaris — luxury meets learning.",
        "image": "https://images.pexels.com/photos/5577693/pexels-photo-5577693.jpeg?w=1600&q=80",
        "highlights": ["Burj Khalifa Deck", "Desert Safari", "Dubai Frame", "Global Village"]
    },
    {
        "id": "singapore",
        "name": "Marina Bay",
        "country": "Singapore",
        "time_of_day": "dusk",
        "sky": {"from": "#1B2951", "to": "#7A3B69"},
        "tagline": "A city that glows at night",
        "description": "Gardens by the Bay, Universal Studios, Science Centre — technology meets nature.",
        "image": "https://images.pexels.com/photos/18787363/pexels-photo-18787363.jpeg?w=1600&q=80",
        "highlights": ["Gardens by the Bay", "Universal Studios", "Science Centre", "Sentosa"]
    },
    {
        "id": "malaysia",
        "name": "Petronas Towers",
        "country": "Malaysia",
        "time_of_day": "night",
        "sky": {"from": "#040914", "to": "#1B2951"},
        "tagline": "Twin lights against the tropical sky",
        "description": "Kuala Lumpur, Genting Highlands, and Langkawi — Southeast Asia at its finest.",
        "image": "https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?w=1600&q=80",
        "highlights": ["Petronas Towers", "Genting Highlands", "Batu Caves", "Langkawi"]
    }
]

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
    {"id": "aeromodelling", "icon": "Plane", "title": "Aeromodelling Workshop", "desc": "Students learn aerodynamics and build their own flying model aircraft."},
    {"id": "drone", "icon": "Send", "title": "Drone Modelling", "desc": "Hands-on training in drone assembly, flight control and live quadcopter flying."},
    {"id": "rocket", "icon": "Rocket", "title": "Rocket Modelling", "desc": "Design, construct and launch model rockets — water and solid-fuel."},
    {"id": "astro", "icon": "Telescope", "title": "Astronomy & Stargazing", "desc": "Celestial navigation, telescope operation and night-sky observation."},
    {"id": "planetarium", "icon": "Sparkles", "title": "Space Planetarium", "desc": "Immersive mobile dome bringing galaxies and nebulae to life."},
    {"id": "telescope", "icon": "Search", "title": "Telescope Making", "desc": "Build a fully functional telescope from optical components."},
    {"id": "comm", "icon": "Radio", "title": "Space Communications", "desc": "Satellite communications with ISRO scientists in Bangalore."},
    {"id": "satellite", "icon": "Satellite", "title": "Satellite Making", "desc": "Design satellite models with high altitude balloon launches."},
    {"id": "ham", "icon": "RadioTower", "title": "HAM Radio Workshop", "desc": "Master wireless communications and earn Amateur Station Operator Certificate."},
]

GALLERY_IMAGES = [
    {"id": 1, "url": "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1000&q=80", "category": "NASA Tour", "caption": "Kennedy Space Center visit"},
    {"id": 2, "url": "https://images.pexels.com/photos/15127135/pexels-photo-15127135.jpeg?w=1000&q=80", "category": "Egypt Tour", "caption": "Pyramids of Giza"},
    {"id": 3, "url": "https://images.pexels.com/photos/5577693/pexels-photo-5577693.jpeg?w=1000&q=80", "category": "General Tour", "caption": "Dubai skyline"},
    {"id": 4, "url": "https://images.pexels.com/photos/18787363/pexels-photo-18787363.jpeg?w=1000&q=80", "category": "General Tour", "caption": "Singapore Marina Bay"},
    {"id": 5, "url": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1000&q=80", "category": "General Tour", "caption": "Kashmir Dal Lake"},
    {"id": 6, "url": "https://images.pexels.com/photos/32261804/pexels-photo-32261804.jpeg?w=1000&q=80", "category": "General Tour", "caption": "Jaipur heritage"},
    {"id": 7, "url": "https://images.unsplash.com/photo-1506947411487-a56738267384?w=1000&q=80", "category": "NASA Tour", "caption": "Drone training"},
    {"id": 8, "url": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1000&q=80", "category": "DUDHWA NATIONAL PARK", "caption": "Wildlife safari"},
    {"id": 9, "url": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1000&q=80", "category": "General Tour", "caption": "Himalayan trails"},
    {"id": 10, "url": "https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?w=1000&q=80", "category": "General Tour", "caption": "Kuala Lumpur nights"},
    {"id": 11, "url": "https://images.pexels.com/photos/64271/queen-of-liberty-statue-of-liberty-new-york-liberty-statue-64271.jpeg?w=1000&q=80", "category": "General Tour", "caption": "Statue of Liberty"},
    {"id": 12, "url": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1000&q=80", "category": "General Tour", "caption": "Delhi Agra heritage"},
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
    """Generate a PDF brochure on the fly using reportlab."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    import io

    brochure = next((b for b in BROCHURES if b["id"] == brochure_id), None)
    if not brochure:
        raise HTTPException(status_code=404, detail="Brochure not found")

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
