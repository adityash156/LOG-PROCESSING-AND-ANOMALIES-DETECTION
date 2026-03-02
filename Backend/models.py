from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# -------------------------
# User Registration Model
# -------------------------
class RegisterData(BaseModel):
    email: EmailStr
    password: str
    role: str   # user or admin


# -------------------------
# Login Model
# -------------------------
class LoginData(BaseModel):
    email: EmailStr
    password: str
    role: str


# -------------------------
# Login Log Model (Optional)
# -------------------------
class LoginLog(BaseModel):
    email: EmailStr
    role: str
    success: bool
    ip_address: Optional[str]
    time: datetime


# -------------------------
# Anomaly Response Model (Optional but Professional)
# -------------------------
class AnomalyResponse(BaseModel):
    type: str
    details: list