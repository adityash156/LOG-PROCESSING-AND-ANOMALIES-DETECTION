from pymongo import MongoClient
# ------------- MONGO CONNECTION -------------
client = MongoClient("mongodb://localhost:27017/")
db = client["foodiepro_db"]
users_col = db["users"]            # Registered users
logins_col = db["login_attempts"]  # Login attempts
payments_col = db["payments"]