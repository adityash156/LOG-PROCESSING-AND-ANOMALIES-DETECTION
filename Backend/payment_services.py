from datetime import datetime, timedelta
import razorpay
from database import payments_col

# ---------------------------------------------------
# RAZORPAY TEST CLIENT
# ---------------------------------------------------
# ⚠️ Replace with your actual TEST keys
RAZORPAY_KEY_ID = "rzp_test_SLj72bjD4is5HQ"
RAZORPAY_SECRET = "ljx0izInfaMTglrVJFs30kGM"

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET))


# ---------------------------------------------------
# CREATE PAYMENT ORDER (QR Compatible)
# ---------------------------------------------------
def create_payment_order(email: str, amount: int):
    """
    Creates Razorpay order in Test Mode
    """

    try:
        order = client.order.create({
            "amount": amount * 100,  # Convert to paise
            "currency": "INR",
            "payment_capture": 1
        })

        # Log order creation
        payments_col.insert_one({
            "email": email,
            "amount": amount,
            "status": "created",
            "payment_id": order["id"],
            "method": "qr",
            "timestamp": datetime.utcnow()
        })

        return {
            "status": "success",
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"]
        }

    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }


# ---------------------------------------------------
# LOG PAYMENT RESULT (SUCCESS / FAILED)
# ---------------------------------------------------
def log_payment_result(email: str, amount: int, payment_id: str, status: str):
    """
    Logs final payment result
    """

    payments_col.insert_one({
        "email": email,
        "amount": amount,
        "status": status,
        "payment_id": payment_id,
        "method": "qr",
        "timestamp": datetime.utcnow()
    })

    return {"message": "Payment result logged"}


# ---------------------------------------------------
# PAYMENT ANOMALY DETECTION
# ---------------------------------------------------
def detect_payment_anomalies():
    """
    Detects payment fraud patterns
    """

    anomalies = []
    threshold_time = datetime.utcnow() - timedelta(minutes=5)

    # 1️⃣ High Value Transactions (> ₹10,000)
    high_value = list(payments_col.find({
        "amount": {"$gt": 10000},
        "timestamp": {"$gte": threshold_time}
    }))

    if high_value:
        anomalies.append({
            "type": "High Value Transaction",
            "count": len(high_value),
            "details": high_value
        })

    # 2️⃣ Rapid Payments (5+ in 5 minutes)
    rapid_activity = list(payments_col.aggregate([
        {
            "$match": {
                "timestamp": {"$gte": threshold_time}
            }
        },
        {
            "$group": {
                "_id": "$email",
                "payment_count": {"$sum": 1}
            }
        },
        {
            "$match": {
                "payment_count": {"$gte": 5}
            }
        }
    ]))

    if rapid_activity:
        anomalies.append({
            "type": "Rapid Payment Activity",
            "details": rapid_activity
        })

    # 3️⃣ Multiple Failed Payments (3+ failed)
    failed_spike = list(payments_col.aggregate([
        {
            "$match": {
                "status": "failed",
                "timestamp": {"$gte": threshold_time}
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

    if failed_spike:
        anomalies.append({
            "type": "Multiple Failed Payments",
            "details": failed_spike
        })

    # 4️⃣ Suspicious Same Amount Repeated (Bot Behavior)
    same_amount_spike = list(payments_col.aggregate([
        {
            "$match": {
                "timestamp": {"$gte": threshold_time}
            }
        },
        {
            "$group": {
                "_id": {
                    "email": "$email",
                    "amount": "$amount"
                },
                "count": {"$sum": 1}
            }
        },
        {
            "$match": {
                "count": {"$gte": 4}
            }
        }
    ]))

    if same_amount_spike:
        anomalies.append({
            "type": "Repeated Same Amount Payments",
            "details": same_amount_spike
        })

    return {
        "payment_anomalies_detected": anomalies,
        "checked_at": datetime.utcnow()
    }