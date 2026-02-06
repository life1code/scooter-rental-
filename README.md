# Rydex Scooter Rental System 🛵

A premium, full-stack scooter rental application designed for the Sri Lankan market. Built with **Next.js**, **Prisma**, and **PostgreSQL**, and deployed using an automated CI/CD pipeline on **AWS EKS**.

---

## 📱 Live Link & Access
Visit the application at: **[ceylonrider.com](https://ceylonrider.com)**

---

## 🌟 Key Features

### 1. Customer Experience
*   **Intuitive Fleet Browsing**: Explore a curated list of scooters with detailed specs, pricing, and high-quality images.
*   **Seamless Booking Flow**: Quick booking with identity verification (Passport/ID upload) and digital signature.
*   **Live Tracking (GPS)**: Integrated Leaflet maps allowing customers to track their rented scooter's position in real-time.
*   **PDF Agreement Generation**: Instant generation of a professional rental agreement PDF upon booking.
*   **Self-Service Cancellation**: Customers can cancel their pending or active bookings directly from the "My Bookings" page, which automatically releases the dates.

### 2. Admin & Host Management
*   **Powerful Dashboard**: Monitor fleet performance, total revenue, and active rental requests at a glance.
*   **Live Fleet Tracking**: A comprehensive map view showing the real-time position of all active rentals.
*   **Booking Control**: Approve, complete, or cancel bookings with a single click. High visibility on pending requests.
*   **Identity Verification View**: Securely view customer-uploaded documents and signatures within the dashboard.
*   **Scooter Management**: Add new scooters to the fleet with S3-backed image uploads and dynamic pricing.
*   **Fleet Reports**: Downloadable CSV reports for fleet performance and revenue analysis.

---

## 🚀 Technology Stack

### Backend & Database
*   **Framework**: Next.js 14+ (App Router)
*   **Database**: PostgreSQL (AWS RDS) managed via Prisma ORM.
*   **Storage**: AWS S3 for secure storage of scooter images and rental agreements.
*   **Authentication**: NextAuth.js with Google OAuth for secure admin and user access.
*   **Email**: Resend API for transactional emails (Booking confirmation, Admin alerts).
*   **Reports**: PDF generation using `jspdf`.

### Infrastructure & DevOps
*   **Cloud Provider**: AWS (EC2, RDS, S3, EKS).
*   **Orchestration**: Kubernetes (EKS/K3s) managed via Helm.
*   **CI/CD**: Jenkins pipeline automating builds (Docker) and deployments (Helm).
*   **Secrets**: Securely managed via Kubernetes Secrets with manual synchronization to bypass IAM role complexities.
*   **Automated Backups**: Daily database backups to S3 via an automated Kubernetes CronJob (`postgres:17-alpine`).

---

## 🛠️ Project Structure
```bash
├── charts/scooter-rental/  # Helm deployment charts
├── prisma/                 # Database schema and migrations
├── src/
│   ├── app/                # Next.js App Router (Routes & APIs)
│   ├── backend/            # Shared backend logic (DB, S3, Email)
│   ├── frontend/           # Shared components and styles
│   ├── reportservice/      # PDF and report generation logic
│   └── lib/                # Shared utility functions
```

---

## 💻 Local Development

1.  **Environment Variables**: Create a `.env` file:
    ```env
    DATABASE_URL="postgresql://user:pass@host:5432/db"
    NEXTAUTH_SECRET="your_nextauth_secret"
    NEXTAUTH_URL="http://localhost:3000"
    GOOGLE_CLIENT_ID="..."
    GOOGLE_CLIENT_SECRET="..."
    AWS_ACCESS_KEY_ID="..."
    AWS_SECRET_ACCESS_KEY="..."
    AWS_S3_BUCKET_NAME="..."
    RESEND_API_KEY="..."
    ```

2.  **Installation & Setup**:
    ```bash
    npm install
    npx prisma generate
    npm run dev
    ```

---

## ☁️ Deployment History & Fixes
*   **PDF/Image Corruption**: Resolved an issue where files were corrupted during S3 upload by implementing robust base64 stripping.
*   **Secret Management**: Implemented manual secret synchronization to work across varied EKS/Self-managed environments.
*   **Database Reliability**: Configured automated backups with AWS S3 integration.

---
*Developed for Rydex — Premium Scooter Rentals in Sri Lanka.*

