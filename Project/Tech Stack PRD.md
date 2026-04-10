# **Product Requirements Document (PRD): Technical Stack & Infrastructure (100% Open Source)**

**Project:** Tripartite Food Delivery Platform (Algeria MVP)

**Focus:** Technology Stack, Infrastructure, and Development Tools

**Hosting:** Self-Hosted VPS (Octenium, Algeria)

**Architecture Type:** Lean MVP (100% FOSS \- Free and Open Source Software)

## **1\. Executive Summary**

This document defines the software and infrastructure stack required to build, deploy, and maintain the food delivery platform. Every component in this stack is 100% free and open-source (FOSS). This ensures zero recurring software licensing costs, complete data sovereignty on your Algerian VPS, and absolute freedom from vendor lock-in.

## **2\. Front-End: Mobile Applications (Client & Driver)**

* **Core Framework:** **React Native**  
  * *Why:* Open-source (MIT License). High performance, massive developer community, allows a single codebase for Android and iOS.  
* **Build Tool & Workflow:** **Expo (Local Builds)**  
  * *Why:* Expo’s core and command-line tools are open-source. Instead of using their proprietary EAS cloud build servers, developers will use npx expo run:android to compile the .apk locally for free.  
* **Language:** **TypeScript**  
  * *Why:* Open-source (Apache License 2.0). Catches errors before the app runs, ensuring financial data is handled safely.  
* **UI Component Library:** **React Native Paper**  
  * *Why:* 100% Open-source material design UI components to speed up development.  
* **Map/Navigation (Lean Approach):**  
  * *Implementation:* Use native deep-linking to pass static coordinates directly to the driver's installed navigation apps. To stick to FOSS principles, developers can add support for deep-linking into open-source maps like **OsmAnd** or **Organic Maps**, in addition to whatever default map the driver uses.

## **3\. Front-End: Web Applications (Store & Admin)**

* **Store Dashboard (Tablet/Web):** **React.js** (Vite \+ TypeScript)  
  * *Why:* Open-source and incredibly fast. Runs perfectly on cheap Android tablets in restaurant kitchens.  
  * *Key Library:* **Socket.io-client** (MIT License) for receiving instant, loud alarms when a new order arrives.  
* **Admin Dashboard:** **React-Admin** or **Refine**  
  * *Why:* Replacing proprietary low-code tools. These are 100% open-source React frameworks designed specifically for building B2B admin panels. They connect directly to your REST API and allow you to build CRUD (Create, Read, Update, Delete) interfaces for drivers and orders very quickly.

## **4\. Back-End: Server & API**

* **Runtime Environment:** **Node.js** (OpenJS Foundation)  
* **Web Framework:** **Express.js** (MIT License)  
  * *Why:* Lightweight, incredibly fast, and perfect for building REST APIs.  
* **Database ORM (Object-Relational Mapper):** **Prisma** or **Drizzle ORM**  
  * *Why:* Open-source ORMs that prevent developers from writing raw SQL. They automatically generate secure database queries and drastically reduce bugs.  
* **Real-Time Engine:** **Socket.io** (MIT License)  
  * *Use Case:* Dedicated strictly to keeping a live connection with the Store Dashboards to trigger instant order notifications.  
* **Push Notifications (Self-Hosted):** **ntfy.sh** or **Gotify**  
  * *Why:* Replacing Google's Firebase (FCM). ntfy and Gotify are 100% open-source push notification servers you can install on your VPS.  
  * *Note on Android:* Using a pure FOSS notification system requires a persistent background WebSocket connection. It uses slightly more battery than Google's proprietary FCM, but guarantees your data never touches Google's servers.

## **5\. Database Architecture**

* **Database Engine:** **PostgreSQL** (PostgreSQL License \- OSI approved FOSS)  
  * *Why:* The most robust, open-source relational database in the world. Perfect for handling complex relations and enforcing strict data integrity for financial transactions.

## **6\. Infrastructure & Deployment (Octenium VPS)**

Since you are managing a self-hosted environment, you will host your own code repository and CI/CD pipelines to avoid relying on Microsoft's GitHub.

* **Operating System:** **Ubuntu 22.04 LTS / Debian 12** (FOSS)  
* **Version Control & CI/CD:** **Gitea** \+ **Gitea Actions**  
  * *Why:* Gitea is a lightweight, 100% open-source alternative to GitHub. You install it on your VPS to host your code privately. Gitea Actions will automate your deployments (pulling code and restarting the server) completely for free.  
* **Web Server / Reverse Proxy:** **Nginx** (BSD-like License)  
  * *Why:* Routes incoming traffic securely to the Node.js API, Gitea, ntfy, and serves the React web apps.  
* **Process Manager:** **PM2** (AGPL-3.0 License)  
  * *Why:* Keeps the Node.js backend running in the background.  
* **Security (SSL/TLS):** **Let's Encrypt (Certbot)** (EFF FOSS)  
  * *Why:* Generates free SSL certificates to enable HTTPS.  
* **Containerization:** **Docker** (Apache 2.0) & **Docker Compose**  
  * *Why:* Packages PostgreSQL, Gitea, ntfy, and your Node.js API into isolated containers, keeping your VPS filesystem clean and manageable.

## **7\. Security & Compliance Tools**

* **Authentication:** **JWT (JSON Web Tokens)** (Open Standard RFC 7519\) for stateless API authentication.  
* **Password/PIN Hashing:** **Bcrypt** (OpenBSD FOSS) to securely hash driver passwords and client OTPs.  
* **Firewall:** **UFW (Uncomplicated Firewall)** configured on the Ubuntu server.