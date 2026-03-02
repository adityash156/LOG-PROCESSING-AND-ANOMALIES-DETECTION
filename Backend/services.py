from datetime import datetime, timedelta
from passlib.context import CryptContext
from database import users_col, logins_col

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# -------------------------------------------------
# REGISTER USER SERVICE
# -------------------------------------------------
def register_user(data):
    existing = users_col.find_one({"email": data.email, "role": data.role})

    if existing:
        return {
            "status": "failed",
            "message": "User already exists"
        }

    hashed_pw = pwd_context.hash(data.password)

    users_col.insert_one({
        "email": data.email,
        "password": hashed_pw,
        "role": data.role,
        "created_at": datetime.utcnow()
    })

    return {
        "status": "success",
        "message": "User registered successfully"
    }


# -------------------------------------------------
# LOGIN USER SERVICE
# -------------------------------------------------
def login_user(data, ip_address):
    user = users_col.find_one({"email": data.email, "role": data.role})

    success = False
    message = "Invalid credentials"

    if user and pwd_context.verify(data.password, user["password"]):
        success = True
        message = "Login successful"

    # Log every login attempt
    logins_col.insert_one({
        "email": data.email,
        "role": data.role,
        "success": success,
        "ip_address": ip_address,
        "time": datetime.utcnow()
    })

    if not success:
        return {
            "status": "failed",
            "message": "Wrong password or user not found"
        }

    return {
        "status": "success",
        "message": message
    }


# -------------------------------------------------
# ANOMALY DETECTION SERVICE
# -------------------------------------------------
def detect_anomalies():
    anomalies = []
    threshold_time = datetime.utcnow() - timedelta(minutes=2)

    # 1️⃣ Brute Force Detection (5+ failed attempts in 2 minutes)
    brute_force = list(logins_col.aggregate([
        {
            "$match": {
                "success": False,
                "time": {"$gte": threshold_time}
            }
        },
        {
            "$group": {
                "_id": "$email",
                "failed_count": {"$sum": 1}
            }
        },
        {
            "$match": {
                "failed_count": {"$gte": 5}
            }
        }
    ]))

    if brute_force:
        anomalies.append({
            "type": "Brute Force Attack",
            "details": brute_force
        })

    # 2️⃣ Admin Targeted Attack (3+ failed admin attempts)
    admin_attack = list(logins_col.aggregate([
        {
            "$match": {
                "success": False,
                "role": "admin",
                "time": {"$gte": threshold_time}
            }
        },
        {
            "$group": {
                "_id": "$email",
                "failed_count": {"$sum": 1}
            }
        },
        {
            "$match": {
                "failed_count": {"$gte": 3}
            }
        }
    ]))

    if admin_attack:
        anomalies.append({
            "type": "Admin Targeted Attack",
            "details": admin_attack
        })

    # 3️⃣ Suspicious IP Activity (10+ failed attempts from same IP)
    suspicious_ip = list(logins_col.aggregate([
        {
            "$match": {
                "success": False,
                "time": {"$gte": threshold_time}
            }
        },
        {
            "$group": {
                "_id": "$ip_address",
                "attempts": {"$sum": 1}
            }
        },
        {
            "$match": {
                "attempts": {"$gte": 10}
            }
        }
    ]))

    if suspicious_ip:
        anomalies.append({
            "type": "Suspicious IP Activity",
            "details": suspicious_ip
        })

    # 4️⃣ Unusual Login Time (1 AM - 4 AM successful logins)
    late_night_logins = []
    successful_logins = list(logins_col.find({"success": True}))

    for log in successful_logins:
        hour = log["time"].hour
        if 1 <= hour <= 4:
            late_night_logins.append({
                "email": log["email"],
                "login_time": log["time"]
            })

    if late_night_logins:
        anomalies.append({
            "type": "Unusual Login Time (1AM - 4AM)",
            "details": late_night_logins
        })

    return {
        "anomalies_detected": anomalies,
        "checked_at": datetime.utcnow()
    }