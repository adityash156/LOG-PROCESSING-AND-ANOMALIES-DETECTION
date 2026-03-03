# Backend (Anomalies & Payments)

Quick notes to run the backend locally.

Prerequisites:
- Python 3.10+ (recommended)
- MongoDB running at `mongodb://localhost:27017/` or set your own URI

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Environment:
- Configure Razorpay test keys in `payment_services.py` or via environment variables if you refactor.

Run server (development):

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API endpoints:
- `POST /register` — register user
- `POST /login` — login user
- `GET /login-anomalies` — detect login anomalies
- `POST /create-payment` — create razorpay order
- `GET /payment-anomalies` — detect payment anomalies
- `POST /razorpay-webhook` — webhook endpoint (verify HMAC signature)

Notes:
- Replace test Razorpay keys before production and secure webhook secret.
- Adjust MongoDB URI in `database.py` as needed.
