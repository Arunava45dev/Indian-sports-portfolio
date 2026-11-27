"""Replace the configured MongoDB database with the India sports starter catalog.

Run from backend with: python reset_database.py
This intentionally drops every collection in MONGODB_DB before seeding it.
"""

import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import ASCENDING, MongoClient

from wikipedia_service import SPORT_LABELS

SPORT_NAMES = [label for label, _ in SPORT_LABELS]


load_dotenv()
client = MongoClient(os.environ["MONGODB_URI"], serverSelectionTimeoutMS=5000)
database_name = os.getenv("MONGODB_DB", "sports_portfolio")
client.admin.command("ping")

client.drop_database(database_name)
db = client[database_name]
now = datetime.now(timezone.utc)
db.sports.insert_many([{"name": name, "country": "India"} for name in SPORT_NAMES])
db.messages.insert_one({"_setup": True, "created_at": now})
db.messages.delete_one({"_setup": True})

db.sports.create_index([("name", ASCENDING)], unique=True)
db.athletes.create_index([("slug", ASCENDING)], unique=True)
db.athletes.create_index([("sport", ASCENDING)])
db.messages.create_index([("created_at", ASCENDING)])

print(f"Recreated {database_name}: {len(SPORT_NAMES)} sports, 0 starter athletes, 0 messages")
client.close()
