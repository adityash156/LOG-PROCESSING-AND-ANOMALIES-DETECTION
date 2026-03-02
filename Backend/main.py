from fastapi import FastAPI, Request, Header, HTTPException
from pydantic import BaseModel
import hmac
import hashlib

from services import register_user, login_user, detect_anomalies
from payment_services import (
    create_payment_order,
    detect_payment_anomalies,
    log_payment_result
)

app = FastAPI()

# =====================================================
# RAZORPAY WEBHOOK SECRET
# (Must match secret entered in Razorpay dashboard)
# =====================================================
RAZORPAY_WEBHOOK_SECRET = "rzp_test_SLj72bjD4is5HQ"


# =====================================================
# MODELS
# =====================================================

class UserRegister(BaseModel):
    email: str
    password: str
    role: str


class UserLogin(BaseModel):
    email: str
    password: str
    role: str


class PaymentRequest(BaseModel):
    email: str
    amount: int


# =====================================================
# BASIC ROUTE
# =====================================================

@app.get("/")
def home():
    return {"message": "Backend is running successfully 🚀"}


# =====================================================
# USER ROUTES
# =====================================================

@app.post("/register")
def register(data: UserRegister):
    return register_user(data)


@app.post("/login")
def login(data: UserLogin, request: Request):
    ip_address = request.client.host
    return login_user(data, ip_address)


@app.get("/login-anomalies")
def login_anomalies():
    return detect_anomalies()


# =====================================================
# PAYMENT ROUTES
# =====================================================

@app.post("/create-payment")
def create_payment(data: PaymentRequest):
    return create_payment_order(data.email, data.amount)


@app.get("/payment-anomalies")
def payment_anomalies():
    return detect_payment_anomalies()


# =====================================================
# RAZORPAY WEBHOOK ROUTE
# =====================================================

@app.post("/razorpay-webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None)
):
    body = await request.body()

    # Generate signature using HMAC SHA256
    generated_signature = hmac.new(
        bytes(RAZORPAY_WEBHOOK_SECRET, "utf-8"),
        body,
        hashlib.sha256
    ).hexdigest()

    # Verify signature
    if not hmac.compare_digest(generated_signature, x_razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = await request.json()

    # Handle successful payment
    if payload.get("event") == "payment.captured":
        payment = payload["payload"]["payment"]["entity"]

        log_payment_result(
            email="test@gmail.com",  # Replace with dynamic extraction later
            amount=payment["amount"] // 100,
            payment_id=payment["id"],
            status="success"
        )

    return {"status": "Webhook verified successfully"}