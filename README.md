<div align="center">

# 🚀 CareerPilot AI

### Your AI-Powered Career and Job Application Assistant

**Track applications. Analyze resumes. Prepare for your next opportunity.**

<p>
  <a href="https://careerpilot-ai-frontend-fsg0.onrender.com">
    <img src="https://img.shields.io/badge/Live%20Demo-Visit%20CareerPilot%20AI-7257E8?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo">
  </a>
  <a href="https://github.com/pawanpushkar/CareerPilot-AI">
    <img src="https://img.shields.io/badge/GitHub-Source%20Code-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
</p>

</div>

---

## 📌 Overview

**CareerPilot AI** is a full-stack web application designed to help job seekers organize their job search and improve their resumes using AI-powered analysis.

It combines a job application tracker, career dashboard, analytics, and an AI Resume Analyzer in one centralized workspace.

The project demonstrates full-stack development, REST API integration, PostgreSQL database management, AI integration, and cloud deployment.

## ✨ Features

### 📊 Career Dashboard
- View job application statistics.
- Monitor interviews, offers, and rejections.
- Access recent application activity from one dashboard.

### 💼 Job Application Tracker
- Add and manage job applications.
- Track application statuses, including Applied, Assessment, Interview, Offer, and Rejected.
- Store company names, job roles, locations, application dates, and notes.
- Update and delete applications.
- Persist application records in PostgreSQL.

### 🤖 AI Resume Analyzer
- Upload a resume in PDF format.
- Extract resume text for analysis.
- Compare resume content with a target job description.
- Generate a resume match score.
- Identify matching skills and skills to improve.
- Recommend relevant ATS keywords.
- Receive suggestions for improving resume alignment with a job description.

### 📈 Analytics
- Visualize job application statistics.
- Review application status distributions.
- Track progress throughout the job search.

### ☁️ Cloud Deployment
- React frontend deployed on Render Static Sites.
- Node.js backend deployed on Render Web Services.
- PostgreSQL database hosted on Render.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| UI & Icons | CSS, Lucide React |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| AI Integration | Google Gemini API |
| Resume Processing | PDF parsing |
| API Communication | REST APIs, Fetch API |
| Version Control | Git, GitHub |
| Deployment | Render |

---

## 🏗️ Architecture

```text
                  ┌───────────────────────────┐
                  │       Job Seeker           │
                  └─────────────┬─────────────┘
                                │
                                ▼
                  ┌───────────────────────────┐
                  │     React + Vite UI        │
                  │       Frontend             │
                  └─────────────┬─────────────┘
                                │
                          REST API Requests
                                │
                                ▼
                  ┌───────────────────────────┐
                  │    Node.js + Express       │
                  │       Backend API          │
                  └────────┬──────────┬───────┘
                           │          │
                ┌──────────▼───┐  ┌───▼────────────────┐
                │  PostgreSQL  │  │ Google Gemini API  │
                │   Database   │  │ Resume Analysis    │
                └──────────────┘  └────────────────────┘
```

---

## 🌐 Live Demo

**Frontend:**  
https://careerpilot-ai-frontend-fsg0.onrender.com

**Backend:**  
https://careerpilot-ai-z5uo.onrender.com

**Backend Health Check:**  
https://careerpilot-ai-z5uo.onrender.com/api/health

The backend health endpoint can be used to check whether the API service is running.

> Note: Render free-tier services may take time to respond after periods of inactivity. Some features depend on the availability and configuration of the backend, database, and Gemini API.

---

## 📂 Project Structure

```text
CareerPilot-AI/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── ResumeAnalyzer.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

Follow these steps to run CareerPilot AI locally.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)
- A Google Gemini API key for AI-powered resume analysis.

### 1. Clone the Repository

```bash
git clone https://github.com/pawanpushkar/CareerPilot-AI.git
cd CareerPilot-AI
```

### 2. Configure the Database

Create a PostgreSQL database named:

```sql
CREATE DATABASE careerpilot;
```

Ensure your PostgreSQL server is running and that you have valid database credentials.

### 3. Configure the Backend

Open the server directory:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory.

Add your local configuration:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=careerpilot
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
GEMINI_API_KEY=your_gemini_api_key
```

Replace the example values with your own credentials.

**Never commit your `.env` file or expose your API keys in public repositories.**

### 4. Start the Backend

From the `server` directory, run:

```bash
node server.js
```

The backend should start at:

```text
http://localhost:5000
```

Check the health endpoint:

```text
http://localhost:5000/api/health
```

### 5. Start the Frontend

Open a second terminal from the project root:

```bash
cd client
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed in the terminal, usually:

```text
http://localhost:5173
```

---

## 🔌 API Endpoints

The backend provides REST API endpoints for application management and resume analysis.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/db-health` | Check PostgreSQL connectivity |
| GET | `/api/applications` | Retrieve job applications |
| POST | `/api/applications` | Create an application |
| PUT | `/api/applications/:id` | Update an application |
| DELETE | `/api/applications/:id` | Delete an application |
| POST | `/api/analyze-resume` | Analyze resume content against a job description |

Additional endpoints may be available depending on the current backend implementation.

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `DB_HOST` | PostgreSQL server hostname |
| `DB_PORT` | PostgreSQL port, normally `5432` |
| `DB_NAME` | Database name |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `GEMINI_API_KEY` | Google Gemini API key |
| `VITE_API_URL` | Backend API base URL used by the Vite frontend |

For local development, the frontend can use:

```env
VITE_API_URL=http://localhost:5000/api
```

For the deployed frontend, configure:

```env
VITE_API_URL=https://careerpilot-ai-z5uo.onrender.com/api
```

Set frontend variables in the appropriate environment configuration and rebuild the frontend after changing production build variables.

---

## 🧪 Testing

Recommended manual tests:

- [ ] Dashboard loads successfully.
- [ ] Job applications can be created.
- [ ] Application records persist after refreshing the page.
- [ ] Existing applications can be updated and deleted.
- [ ] Analytics displays application statistics.
- [ ] PDF resume upload works.
- [ ] Resume analysis returns a result when the AI service is available.
- [ ] Backend health endpoint returns a successful response.
- [ ] PostgreSQL connection succeeds.

---

## 🔒 Security Considerations

- Keep API keys and database credentials in environment variables.
- Never commit `.env` files or secrets to GitHub.
- Validate user input on the backend.
- Restrict CORS to trusted frontend origins in production.
- Protect database setup and administrative endpoints from unauthorized access.
- Avoid exposing detailed internal server errors to public API clients.

---

## 🚀 Future Improvements

- User authentication and individual user accounts.
- Secure multi-user application data isolation.
- Interview preparation and interview scheduling.
- Automated job recommendations based on skills and interests.
- Resume version management.
- Job portal integrations.
- Email reminders for interviews and follow-ups.
- Automated testing and continuous integration.
- Improved accessibility and responsive design.

---

## 🎯 Learning Outcomes

This project provides practical experience with:

- Building a full-stack React and Node.js application.
- Designing and consuming REST APIs.
- Connecting an Express backend to PostgreSQL.
- Implementing CRUD operations.
- Integrating a generative AI API into a web application.
- Processing PDF resumes.
- Managing environment variables and application secrets.
- Deploying frontend and backend services to the cloud.
- Debugging production database and API issues.

---

## 👨‍💻 Author

**Pawan Pushkar**

Computer Science & Engineering Student  
Interested in Full-Stack Development, AI Applications, and Software Engineering.

- **GitHub:** https://github.com/pawanpushkar
- **Project Repository:** https://github.com/pawanpushkar/CareerPilot-AI
- **Live Project:** https://careerpilot-ai-frontend-fsg0.onrender.com

---

## 📄 License

This project is intended for learning and portfolio demonstration.

Add a `LICENSE` file if you want to distribute the project under a specific open-source license.

---

<div align="center">

### Built to make the job search more organized and data-driven. 🚀

**CareerPilot AI — Take control of your career journey.**

</div>
