# LOG-PROCESSING-AND-ANOMALIES-DETECTION

1. User Login
The workflow starts when the user logs into the food delivery website. The user enters their login details such as username and password to access the platform.

This step helps the system identify the user and allows them to use the services of the website like browsing restaurants and ordering food.

2. Browse Restaurants
After logging in, the user can explore different restaurants available on the platform. The user can view restaurant names, food items, and menu options.

This feature helps users easily find the food they want and compare different restaurants before placing an order.

3. Order Food
Once the user selects a restaurant, they can choose food items from the menu and place an order. The selected items are added to the order list.

This step allows the user to confirm their food selection and proceed to the next step, which is payment.

4. Payment Processing
After placing the order, the user completes the payment using an online payment system. In this project, the payment is processed using Razorpay.

This ensures that the payment process is secure and fast, allowing the order to be confirmed successfully.

5. Log Storage in MongoDB
All user activities on the website are recorded as logs. These activities include login attempts, browsing restaurants, placing orders, and payment actions.

The logs are stored in the MongoDB database so that the system can keep a record of all user actions.

6. Backend Processes Logs
The backend system collects and processes the stored logs from the database. This helps in analyzing how users interact with the platform.

Processing logs helps the system understand user behavior and detect any unusual activity happening on the website.

7. Anomaly Detection
The anomaly detection system checks the processed logs to find suspicious patterns. For example, too many failed login attempts or an unusually large number of orders.

If such abnormal activity is detected, the system marks it as suspicious so it can be monitored.

8. Admin Dashboard
The detected anomalies are shown on the admin dashboard. The admin can view these alerts and monitor system activity.

This helps administrators quickly identify problems or suspicious behavior and take action if necessary.
 +------------------------------------------------------+
|                TIER 1 – PRESENTATION LAYER           |
|------------------------------------------------------|
| Technologies: HTML, CSS, Vanilla JavaScript          |
|                                                      |
| Components:                                          |
| • index.html  → User/Admin entry point               |
| • api.js      → Handles API calls (login, checkout)  |
| • dashboard.js→ Admin dashboard & charts             |
| • logs.html/js→ Log viewer & anomaly display         |
+------------------------------------------------------+
                        │
                        │  HTTP REST API (JSON, CORS)
                        ▼
+------------------------------------------------------+
|                TIER 2 – APPLICATION LAYER            |
|------------------------------------------------------|
| Technologies: FastAPI, Python, Pydantic              |
|                                                      |
| Backend Files:                                       |
| • main.py      → REST API endpoints                  |
| • models.py    → Pydantic data validation models     |
| • services.py  → Business logic & anomaly detection  |
| • payment.py   → Razorpay payment processing         |
+------------------------------------------------------+
                        │
                        │  Database Queries (PyMongo)
                        ▼
+------------------------------------------------------+
|                   TIER 3 – DATA LAYER                |
|------------------------------------------------------|
| Technology: MongoDB Atlas                            |
|                                                      |
| Collections:                                         |
| • users       → email, password, role                |
| • db_logs     → login activity logs                  |
| • db_payments → payment transaction logs             |
+------------------------------------------------------+