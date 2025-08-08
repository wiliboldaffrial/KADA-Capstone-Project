# MediLink: Hospital Management App

A modern, responsive hospital management dashboard built with React and Tailwind CSS, providing real-time patient, appointment, announcement, and room availability tracking — with charts powered by date-fns and custom chart components.

## Features

- Interactive charts for weekly and monthly patient statistics using `PatientChartDay` and `PatientBarMonth`.
- Patient management with search and delete functionality.
- Appointments overview with real-time status ("Finished" or upcoming time).
- Announcement board showing the latest urgent or regular notices with author name and role.
- Room availability tracking.
- Responsive design for desktop and mobile.
- Toast notifications for success and error actions.

## Tech Stack

**Frontend:**
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [date-fns](https://date-fns.org/)
- [react-hot-toast](https://react-hot-toast.com/)

**Backend (API):**
- Node.js + Express (API endpoints like `/api/patients`, `/api/appointments`, etc.)
- MongoDB (ObjectId-based user and announcement authoring)


## Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/wiliboldaffrial/KADA-Capstone-Project]
   cd KADA-Capstone-Project
   ```
   
2. Frontend Installation & Startup
   ```bash
   cd frontend/bingungcore
   npm install
   npm start
   ```
   
3. Backend Installation & Startup
   ```bash
   cd backend
   npm install
   node server
   ```

You should able to see you webapp running on localhost:3000

## ENV Variables
1. inside frontend/bingungcore root, create `.env` file and store your React app API URL
     ```bash
     REACT_APP_API_URL=your_react_app_api_url
     ```
1. inside backend root, create `.env` file and store your Mongo URI and Google Generative AI configuration
     ```bash
      MONGO_URI=your_mongo_uri
      PORT=5000
      
      REACT_APP_API_URL=your_react_app_api_url
      
      # Google Generative AI Configuration
      GOOGLE_AI_API_KEY=your_google_ai_api_key
      
      # Optional: AI Service Configuration
      AI_MODEL=gemini-1.5-flash
      AI_MAX_RETRIES=3
      AI_TIMEOUT=30000
     ```
