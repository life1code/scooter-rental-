# Rydex Scooter Rental System

A modern, full-stack scooter rental application built with Next.js, optimized for high performance and automated deployment on AWS.

## 📱 Scan to Visit
Scan the QR code below to visit our website:

![Ceylon Rider QR Code](public/images/qr-code.png)

## 🚀 Development Architecture

### 1. Modern Tech Stack
*   **Framework**: [Next.js](https://nextjs.org/) (App Router) for a seamless full-stack experience.
*   **Database**: [Prisma ORM](https://www.prisma.io/) with **PostgreSQL** (Hosted on AWS RDS) for robust data management.
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/) with Google OAuth integration for secure user access.
*   **Styling**: Vanilla CSS with modern aesthetics (Dark Mode, Glassmorphism).

### 2. Intelligent Email System
*   **Provider**: [Resend](https://resend.com/) for high-deliverability email notifications.
*   **Architecture**: Centralized email logic in `src/backend/lib/email.ts` to ensure consistency across booking and administration flows.
*   **Features**: 
    *   Automated Booking Confirmation.
    *   Admin Approval Notifications.
    *   PDF Rental Agreement generation and attachment.
    *   Verified Domain sending via `info@ceylonrider.com`.

### 3. API & Backend
*   **Admin Dashboard**: Comprehensive management of scooters, bookings, and logs.
*   **Dynamic Routing**: Efficient handling of scooter details and booking states via Next.js API routes.

---

## 🛠 DevOps & Infrastructure

### 1. Cloud & Containerization
*   **Hosting**: AWS EC2 instances optimized for performance.
*   **Orchestration**: Lightweight **K3s** (Kubernetes) for efficient container management.
*   **Containerization**: High-speed Docker builds, utilizing `ttl.sh` for ephemeral image storage during CI/CD.

### 2. CI/CD Pipeline (Jenkins)
Our automated pipeline (`Jenkinsfile`) ensures every change to the `main` branch is instantly verified and deployed:
1.  **Build**: Docker images are built with Node.js 20 environment.
2.  **Push**: Seamless image delivery to the registry.
3.  **Deploy**: Automated Helm upgrades to the Kubernetes cluster.

### 3. Security & Configuration
*   **Secret Management**: Sensitive data (`RESEND_API_KEY`, `DATABASE_URL`) is securely managed via Kubernetes Secrets (`scooter-rental-synced-secrets`).
*   **Helm Orchestration**: Deployment configuration is standardized via Helm charts in `charts/scooter-rental`.
*   **High Availability**: Configured environment variables (using `optional: true`) to ensure the application remains stable even during secret rotations or configuration updates.

### 4. Domain & SSL
*   **Domain**: Fully secured via `https://ceylonrider.com`.
*   **Email Security**: SPF, DKIM, and DMARC verified via Resend to ensure inbox delivery.

---

## 💻 Local Development

1.  **Clone & Install**:
    ```bash
    npm install
    ```

2.  **Environment Setup**: Create a `.env` file with:
    ```env
    DATABASE_URL="your_postgresql_url"
    NEXTAUTH_SECRET="your_secret"
    RESEND_API_KEY="your_resend_key"
    ```

3.  **Run**:
    ```bash
    npm run dev
    ```

---
*Developed for Rydex — Premium Scooter Rentals in Sri Lanka.*
