# TaskSoko

> Nairobi's #1 Local Services Marketplace — Connecting customers with verified plumbers, electricians, tutors & more. Book instantly, pay with M-Pesa.

---

## 🏗 Project Structure

```
tasksoko/
├── backend/          # Django REST API (Python)
├── frontend/         # Next.js Web App (PWA — installable on Android & iOS)
├── mobile/           # React Native Expo App (native Android & iOS)
└── docker-compose.yml  # PostgreSQL + Redis
```

---

## 🚀 Running the Project

### 1. Start Infrastructure (Docker)
```bash
docker compose up -d
```
Starts PostgreSQL (port 5432) and Redis (port 6379).

### 2. Start Backend (Django)
```bash
cd backend
venv\Scripts\python.exe manage.py runserver
```
API live at: http://localhost:8000

Create superuser for admin access:
```bash
venv\Scripts\python.exe manage.py createsuperuser
```
Admin panel: http://localhost:8000/admin (use this to approve provider KYC)

### 3. Start Web Frontend (Next.js)
```bash
cd frontend
npm run dev
```
App live at: http://localhost:3000

### 4. Start Mobile App (Expo)
```bash
cd mobile
npx expo start
```
- Scan the QR code with **Expo Go** on your Android or iOS device.
- Press `a` to open in Android emulator, `i` for iOS simulator.

> ⚠️ For physical device testing, update `mobile/lib/api.ts` and `mobile/app/chat/[bookingId].tsx` with your machine's local IP instead of `10.0.2.2`.

---

## 📱 Mobile (PWA)

The Next.js web app is a **Progressive Web App**. To install on your phone:
- **Android (Chrome)**: Open the site → "Add to Home Screen"
- **iOS (Safari)**: Open the site → Share → "Add to Home Screen"

---

## 🔑 API Credentials

| Service | Detail |
|---------|--------|
| M-Pesa (Daraja) | Sandbox — STK Push configured |
| Google Maps | Configured in `.env.local` |

---

## 🔄 Core Flows

1. **Customer** registers → searches → books a service → pays via M-Pesa → chats → reviews
2. **Provider** registers → submits KYC → gets approved by admin → lists services → accepts bookings → gets paid
