# Travel Companion Matchmaking System (ระบบเพื่อนเที่ยว) - Frontend 🌍✈️

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

This repository contains the **Frontend** source code for the **Travel Companion Matchmaking System (ระบบเพื่อนเที่ยว)** . This project was developed as part of the 2110423 Software Engineering.

## 📖 Project Overview
In a world of over 8 billion people, loneliness is surprisingly common. Many people have travel dreams but hesitate to go alone . The **Travel Companion** platform acts as a Match Maker, connecting travelers ("Customers") with local experts ("Providers") based on shared interests, budget, and lifestyle. 

This frontend application allows users to interact with the platform seamlessly, offering an intuitive UI for discovering services, booking companions, chatting, and managing payments.

## ✨ Key Features (UI/UX)
Based on the system requirements, the frontend provides interfaces for the following modules:

*   **User Management:** Registration and profile management for both Customers and Providers (including specific provider details like languages spoken and bio) .
*   **Service Discovery:** A robust search and filter interface allowing customers to find services (e.g., photo trips, food tours) based on price, category, rating, and location .
*   **Booking System:** Interfaces for customers to send booking requests and for providers to confirm or reject them .
*   **Payment & Refunds:** Checkout UI for handling 50% deposit payments, final payments, and displaying refund statuses based on cancellation policies .
*   **Communication:** A built-in chat interface for users to communicate after a successful booking .
*   **Review System:** UI for customers to leave 1-5 star ratings and written reviews after a trip .
*   **Support & Admin:** Interfaces for submitting reports/complaints and an admin dashboard for dispute resolution .

## 🛠️ Tech Stack
*   **Framework:** React
*   **Build Tool:** Vite
*   **Linter:** ESLint / Oxlint

## 🚀 Getting Started

Follow these steps to set up the frontend project on your local machine.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-frontend-repo-url>
    cd <your-frontend-repo-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Create a `.env` file in the root directory.
    *   Add your backend API URL (e.g., `VITE_API_BASE_URL=http://localhost:8080/api`).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running at `http://localhost:5173`.

## 📁 Recommended Folder Structure
```text
src/
├── assets/        # Static assets (images, icons, etc.)
├── components/    # Reusable UI components (Buttons, Cards, Navbar)
├── pages/         # Page-level components (Home, Login, Search, Profile)
├── services/      # API integration and HTTP requests
├── contexts/      # React Context for global state (Auth, Theme)
├── hooks/         # Custom React hooks
├── styles/        # Global CSS/Tailwind styles
├── App.jsx        # Root component
└── main.jsx       # Entry point
```
