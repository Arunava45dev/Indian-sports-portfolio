"""Read Indian sports biographies from Wikipedia's public MediaWiki API."""

import re
from functools import lru_cache
from html.parser import HTMLParser

import requests


API_URL = "https://en.wikipedia.org/w/api.php"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "PodiumIndianSportsDirectory/1.0 (Wikipedia-backed athlete search)"})
SPORT_TERMS = re.compile(
    r"athlet|sportsperson|sportspeople|player|cricketer|footballer|hockey|badminton|"
    r"wrestl|boxer|shooter|archer|swimmer|weightlift|gymnast|tennis|chess|kabaddi|"
    r"kho.?kho|cyclist|golfer|judoka|volleyball|basketball|table tennis|fencer|runner|sprinter",
    re.I,
)
PERSON_TERMS = re.compile(
    r"athlet|sportsperson|sportspeople|sportsman|sportswoman|player|cricketer|footballer|"
    r"wrestler|boxer|shooter|archer|swimmer|weightlifter|gymnast|tennis player|chess player|"
    r"kabaddi player|kho.?kho player|cyclist|golfer|judoka|volleyball player|basketball player|fencer",
    re.I,
)
SPORT_LABELS = [
    ("Cricket", r"cricket|cricketer"), ("Football", r"football|soccer"),
    ("Hockey", r"field hockey|hockey player"), ("Badminton", r"badminton"),
    ("Athletics", r"athlet|sprinter|runner|javelin"), ("Wrestling", r"wrestl"),
    ("Boxing", r"boxer|boxing"), ("Shooting", r"shoot(?:er|ing)"),
    ("Archery", r"archer|archery"), ("Chess", r"chess|grandmaster"),
    ("Kabaddi", r"kabaddi"), ("Kho-Kho", r"kho.?kho"),
    ("Tennis", r"tennis"), ("Table Tennis", r"table tennis"),
    ("Weightlifting", r"weightlift"), ("Gymnastics", r"gymnast"),
    ("Swimming", r"swim(?:mer|ming)"), ("Cycling", r"cycl(?:ist|ing)"),
    ("Golf", r"golf(?:er)?"), ("Judo", r"judoka|judo"),
    ("Volleyball", r"volleyball"), ("Basketball", r"basketball"),
]
INDIAN_TERMS = re.compile(r"\bindian\b|\brepresent(?:ed|ing) india\b|\bindia international\b", re.I)
ACHIEVEMENT_SECTION = re.compile(r"career|achievement|honou?r|record|medal|result", re.I)
REFERENCE_ITEM = re.compile(
    r"^\s*[\^↑]|mw-parser-output|cite error:|citation_needed|mw-cite-backlink|"
    r"\.mw-parser-output|background\s*:\s*url\(",
    re.I,
)
ACHIEVEMENT_CUE = re.compile(
    r"\b(?:won|wins|winner|medal(?:list)?|champion|championship|title|record|award|"
    r"ranked|world no\.?\s*1|first indian|first woman|gold|silver|bronze|finalist|"
    r"olympic|olympics|grand slam|world cup)\b",
    re.I,
)


def _clean_achievement(value):
    """Drop reference-list entries and parser/CSS artifacts from achievement bullets."""
    value = re.sub(r"\s+", " ", str(value or "")).strip()
    if not value or REFERENCE_ITEM.search(value):
        return ""
    return value


def _achievement_summaries(extract):
    """Use clean, achievement-bearing lead sentences when the article has no usable list."""
    sentences = re.split(r"(?<=[.!?])\s+", extract or "")
    result = []
    for sentence in sentences:
        value = _clean_achievement(sentence)
        if value and 35 <= len(value) <= 350 and ACHIEVEMENT_CUE.search(value):
            if value not in result:
                result.append(value)
        if len(result) == 6:
            break
    return [{"title": value} for value in result]


class InfoboxParser(HTMLParser):
    """Extract simple key/value rows and bullet entries."""

    def __init__(self):
        super().__init__()
        self.in_infobox = False
        self.table_depth = 0
        self.in_row = False
        self.in_cell = False
        self.cell_text = ""
        self.cells = []
        self.in_list_item = False
        self.list_text = ""
        self.rows = {}
        self.items = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "table":
            if "infobox" in attrs.get("class", ""):
                self.in_infobox = True
            if self.in_infobox:
                self.table_depth += 1
        elif tag == "tr" and self.in_infobox:
            self.in_row, self.cells = True, []
        elif tag in ("th", "td") and self.in_row:
            self.in_cell, self.cell_text = True, ""
        elif tag == "li" and not self.in_infobox:
            self.in_list_item, self.list_text = True, ""
        elif tag == "br" and self.in_cell:
            self.cell_text += " "

    def handle_data(self, data):
        if self.in_cell:
            self.cell_text += data
        if self.in_list_item:
            self.list_text += data

    def handle_endtag(self, tag):
        if tag in ("th", "td") and self.in_cell:
            value = re.sub(r"\s+", " ", self.cell_text).strip()
            self.cells.append(value)
            self.in_cell = False
        elif tag == "tr" and self.in_row:
            if len(self.cells) >= 2 and self.cells[0] and self.cells[1]:
                self.rows[self.cells[0].rstrip(":")] = self.cells[1]
            self.in_row = False
        elif tag == "table" and self.in_infobox:
            self.table_depth -= 1
            if self.table_depth <= 0:
                self.in_infobox = False
        elif tag == "li" and self.in_list_item:
            value = _clean_achievement(self.list_text)
            if value and len(value) > 12:
                self.items.append(value)
            self.in_list_item = False


class MedalRecordParser(HTMLParser):
    """Count entries in Wikipedia's athlete infobox medal-record table."""

    MEDAL_COLORS = {
        "#ffd700": "gold", "#ffdf00": "gold", "#c0c0c0": "silver",
        "#d3d3d3": "silver", "#e5e5e5": "silver", "#cc9966": "bronze",
        "#cd7f32": "bronze", "#feec80": "gold", "#ffcc99": "bronze",
    }

    def __init__(self):
        super().__init__()
        self.infobox_depth = 0
        self.in_infobox = False
        self.in_header = False
        self.header_th_depth = 0
        self.header_text = ""
        self.medal_record = False
        self.in_cell = False
        self.cell_color = ""
        self.cell_text = ""
        self.row_text = ""
        self.in_row = False
        self.in_row_heading = False
        self.medals = {"gold": 0, "silver": 0, "bronze": 0}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        if tag == "table" and "infobox" in classes:
            self.in_infobox = True
            self.infobox_depth = 1
        elif tag == "table" and self.in_infobox:
            self.infobox_depth += 1
        if self.in_infobox and tag == "th" and "infobox-header" in classes:
            self.in_header = True
            self.header_th_depth = 1
            self.header_text = ""
        elif self.in_header and tag == "th":
            self.header_th_depth += 1
        if self.in_infobox and tag == "tr":
            self.in_row = True
            self.row_text = ""
        if self.in_infobox and self.medal_record and tag == "th" and self.in_row:
            self.in_row_heading = True
        if self.in_infobox and self.medal_record and tag == "td":
            match = re.search(r"background-color\s*:\s*(#[0-9a-f]{3,6})", attrs.get("style", ""), re.I)
            self.cell_color = match.group(1).lower() if match else ""
            self.cell_text = ""
            self.in_cell = True

    def handle_data(self, data):
        if self.in_header:
            self.header_text += data
            if re.search(r"\bmedal\s+record\b", self.header_text, re.I):
                self.medal_record = True
        if self.in_row_heading:
            self.row_text += data
        if self.in_cell:
            self.cell_text += data

    def handle_endtag(self, tag):
        if tag == "th" and self.in_header:
            self.header_th_depth -= 1
            if self.header_th_depth == 0:
                if re.sub(r"\s+", " ", self.header_text).strip().lower().startswith("medal record"):
                    self.medal_record = True
                self.in_header = False
        if tag == "th" and self.in_row_heading:
            self.in_row_heading = False
        elif tag == "td" and self.in_cell:
            medal = self.MEDAL_COLORS.get(self.cell_color)
            count = re.match(r"\s*(\d+)", self.cell_text)
            if medal and count and self.row_text.strip().lower() != "total":
                self.medals[medal] += int(count.group(1))
            self.in_cell = False
        elif tag == "tr" and self.in_row:
            self.in_row = False
        elif tag == "table" and self.in_infobox:
            self.infobox_depth -= 1
            if self.infobox_depth <= 0:
                self.in_infobox = False


def _medal_counts(html):
    parser = MedalRecordParser()
    parser.feed(html or "")
    return parser.medals


@lru_cache(maxsize=256)
def get_medal_counts(page_title):
    """Fetch medal-table counts for a previously stored Wikipedia profile."""
    parsed = _api({"action": "parse", "page": page_title, "prop": "text"})["parse"]
    return _medal_counts(parsed.get("text", ""))

def _api(params, timeout=12):
    response = SESSION.get(API_URL, params={**params, "format": "json", "formatversion": 2}, timeout=timeout)
    response.raise_for_status()
    return response.json()


def _is_indian_sports_person(page):
    cats = " ".join(category.get("title", "") for category in page.get("categories", []))
    lead = page.get("extract", "")[:1400]
    text = cats + " " + lead
    return bool(INDIAN_TERMS.search(text) and SPORT_TERMS.search(text) and PERSON_TERMS.search(text))


def _profile(page, include_details=False):
    title = page.get("title", "")
    extract = re.sub(r"\s+", " ", page.get("extract", "")).strip()
    pageid = page.get("pageid")
    source_url = page.get("fullurl") or f"https://en.wikipedia.org/?curid={pageid}"
    thumb = page.get("thumbnail", {}).get("source", "")
    category_text = " ".join(category.get("title", "") for category in page.get("categories", []))
    sport = next((label for label, pattern in SPORT_LABELS
                  if re.search(pattern, category_text + " " + extract, re.I)), "Indian sportsperson")
    profile = {
        "id": f"wikipedia-{pageid}", "slug": f"wikipedia-{pageid}", "name": title,
        "sport": sport, "position": "Player", "country": "India",
        "tagline": extract[:220] or "Indian sportsperson",
        "bio": extract, "image_url": thumb, "source_url": source_url,
        "medals": {"gold": 0, "silver": 0, "bronze": 0},
        "stats": {}, "achievements": [], "highlights": [], "featured": False,
    }
    if not include_details:
        return profile

    try:
        parsed = _api({"action": "parse", "pageid": pageid, "prop": "text|sections"})["parse"]
    except (requests.RequestException, ValueError, KeyError, TypeError):
        # The article lead is enough to show a usable profile. Infobox and
        # achievement data are optional and should not turn the whole page blank.
        profile["stats"] = {"Sport": profile["sport"], "Position": profile["position"], "Country": "India"}
        profile["achievements"] = _achievement_summaries(extract)
        return profile
    html = parsed.get("text", "")
    profile["medals"] = _medal_counts(html)
    infobox = InfoboxParser()
    infobox.feed(html)
    profile["stats"] = {
        key: value for key, value in infobox.rows.items()
        if key.lower() in {
            "sport", "event", "position", "club", "team", "nationality", "born",
            "birth place", "height", "weight", "plays", "coach", "world ranking",
            "personal best", "career record", "turns pro", "years active",
            "highest ranking", "playing style", "discipline", "role", "current ranking",
            "highest world ranking", "medal record", "olympic games", "education",
        }
    }
    profile["stats"].setdefault("Sport", profile["sport"])
    profile["stats"].setdefault("Position", profile["position"])
    profile["stats"].setdefault("Country", "India")

    achievements = []
    sections = parsed.get("sections", [])
    achievement_sections = [
        section for section in sections
        if ACHIEVEMENT_SECTION.search(section.get("line", ""))
    ][:3]
    for section in achievement_sections:
        try:
            section_data = _api({
                "action": "parse", "pageid": pageid, "section": section["index"], "prop": "text",
            })
        except (requests.RequestException, ValueError, KeyError, TypeError):
            continue
        section_parser = InfoboxParser()
        section_parser.feed(section_data.get("parse", {}).get("text", ""))
        achievements.extend(section_parser.items)
        if len(achievements) >= 12:
            break
    cleaned_achievements = []
    for item in achievements:
        value = _clean_achievement(item)
        if value and len(value) > 12 and value not in cleaned_achievements:
            cleaned_achievements.append(value[:350])
    profile["achievements"] = [{"title": item} for item in cleaned_achievements[:12]]
    if not profile["achievements"]:
        profile["achievements"] = _achievement_summaries(extract)
    profile["sport"] = next((value for key, value in profile["stats"].items()
                              if key.lower() in {"sport", "event", "discipline"}), "Indian sportsperson")
    profile["position"] = next((value for key, value in profile["stats"].items()
                                 if key.lower() == "position"), "Player")
    return profile


@lru_cache(maxsize=128)
def search_indian_players(term, sport=""):
    """Find Indian athlete pages matching a name through Wikipedia search."""
    result = _api({
        "action": "query", "generator": "search", "gsrsearch": term,
        "gsrnamespace": 0, "gsrlimit": 30,
        "prop": "extracts|pageimages|info|categories",
        "exintro": 1, "explaintext": 1, "piprop": "thumbnail", "pithumbsize": 500,
        "inprop": "url", "cllimit": 50,
    })
    pages = result.get("query", {}).get("pages", [])
    if isinstance(pages, dict):
        pages = list(pages.values())
    # Generator results include the original search rank; keep the most relevant
    # matches first even when the API returns pages in a different order.
    pages.sort(key=lambda page: page.get("index", 0))
    profiles = []
    for page in pages:
        if not _is_indian_sports_person(page):
            continue
        profile = _profile(page)
        if sport and sport.lower() not in (profile["sport"] + " " + page.get("extract", "")).lower():
            continue
        profiles.append(profile)
    return profiles


@lru_cache(maxsize=256)
def get_indian_player(pageid):
    """Fetch a complete profile and confirm the page describes an Indian athlete."""
    if not str(pageid).isdigit():
        return None
    data = _api({
        "action": "query", "pageids": str(pageid),
        "prop": "extracts|pageimages|info|categories",
        "exintro": 1, "explaintext": 1, "piprop": "thumbnail", "pithumbsize": 700,
        "inprop": "url", "cllimit": 50,
    })
    pages = data.get("query", {}).get("pages", [])
    if not pages or not _is_indian_sports_person(pages[0]):
        return None
    return _profile(pages[0], include_details=True)
