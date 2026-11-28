"""MongoDB connection and collection setup."""

from pymongo import MongoClient


def connect(uri, database_name):
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    return client, client[database_name]
