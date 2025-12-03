

# **Risk Management Application (ISO 27001 – ISMS)**

AI-Powered Web Application for Information Security Risk Assessment

---

## 🚀 **Overview**

The **Risk Management Application** is a modern, AI-assisted web platform built to help organizations identify, analyze, treat, and monitor information-security risks in alignment with **ISO 27001:2022 ISMS** requirements.

The application provides an intuitive interface, automated risk suggestions using Google Gemini API, and a clean workflow for managing the complete risk lifecycle from identification to treatment and reporting.

---

## 🧠 **Key Features**

### ✔ **AI-Powered Risk Assessment**

* Integrated **Google Gemini Pro API** for generating threats, vulnerabilities, and recommended controls.
* Automatically suggests risk treatments and mitigation strategies.

### ✔ **Complete ISMS Risk Workflow**

* Asset identification
* Threat & vulnerability mapping
* Risk scoring & evaluation
* Risk treatment (avoid, reduce, transfer, accept)
* Monitoring & review

### ✔ **Interactive Dashboards**

* Risk heatmaps
* Risk-level summaries
* Task progress tracking
* Audit-ready logs


<img width="1349" height="679" alt="Screenshot 2025-12-03 at 11 43 04 PM" src="https://github.com/user-attachments/assets/7855a86b-cd29-4bfc-aea2-7f1b1bbdcf18" />





### ✔ **Modern Frontend**

* Built with **React + TypeScript**
* Responsive UI for desktop and mobile
* Smooth navigation and fast rendering using **Vite**

### ✔ **Secure Backend**

* Node.js + Express REST API
* Input validation and CORS protection
* Helmet & rate limiter (security ready)

### ✔ **Deployment Friendly**

* Ready for Dockerization
* Can run on Ubuntu servers, cloud VMs, or Kubernetes
* GitHub-friendly CI/CD structure

---

## 🏗 **Tech Stack**

| Layer               | Technologies                       |
| ------------------- | ---------------------------------- |
| **Frontend**        | React, TypeScript, Vite, HTML, CSS |
| **Backend**         | Node.js, Express.js                |
| **AI Integration**  | Google Gemini API                  |
| **Version Control** | Git & GitHub                       |
| **Deployment**      | Ubuntu Server, Docker-ready        |

---

## 📂 **Project Structure**

```
RiskManagementApp/
├── src/                # Frontend source code
├── public/             # Static assets
├── server.js           # Express backend router
├── package.json        # Dependencies & scripts
├── tsconfig.json       # TypeScript config
└── README.md           # Project documentation
```

---

## 🛠 **Installation & Setup**

### **1. Clone the Repository**

```bash
git clone https://github.com/RahulHeroor/Riskmanagementapp.git
cd Riskmanagementapp
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Create Environment File**

Create `.env`:

```
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

### **4. Run the Application**

**Development mode**

```bash
npm run dev
```

**Production build**

```bash
npm run build
npm start
```

---

## 🧪 **Screenshots **

* Dashboard
* Risk Entry Form
<img width="1350" height="684" alt="Screenshot 2025-12-03 at 11 46 43 PM" src="https://github.com/user-attachments/assets/bfe800ed-c5a3-45b2-8164-3b7a8a0e1647" />
  
<img width="1350" height="683" alt="Screenshot 2025-12-03 at 11 46 55 PM" src="https://github.com/user-attachments/assets/f12e9186-b546-4f4f-93d0-06eccabe37b8" />

* AI Suggestion UI
* Heatmap
* Treatment Plan

---

## 🛡️ **Security Features**

* Secure HTTP headers (helmet)
* Rate limiting
* CORS policy
* Sanitized inputs
* API key protection via `.env`
* Ready for SAST/DAST integration (CodeQL, OWASP ZAP)

---

## ☁️ **Deployment Guide (Ubuntu Server)**

### **1. Pull Repository**

```bash
git clone https://github.com/RahulHeroor/Riskmanagementapp.git
```

### **2. Install Node.js**

```bash
sudo apt update
sudo apt install nodejs npm
```

### **3. Start the App**

```bash
npm install
npm run build
npm start
```

### **4. (Optional) Run it in the background**

Using PM2:

```bash
npm install -g pm2
pm2 start server.js
```

---

## 🗺️ **Future Enhancements**

* User authentication (SSO / OAuth / Local login)
* Role-Based Access Control (RBAC)
* Multi-tenant support
* Database integration (MongoDB/PostgreSQL)
* Complete Docker + Kubernetes deployment
* OpenTelemetry monitoring
* Exportable PDF/Excel risk reports

---

## 🤝 **Contributing**

Pull requests are welcome. Please create issues for major changes.

---

## 📜 **License**

This project is licensed under the MIT License.

---





## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
