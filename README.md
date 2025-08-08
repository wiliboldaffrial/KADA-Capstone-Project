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
   git clone https://github.com/wiliboldaffrial/KADA-Capstone-Project
   cd KADA-Capstone-Project

   # Running Backend
   cd backend
   npm install
   node server.js

   #Running Frontend
   cd frontend/bingungcore
   npm install
   npm start
   ```
   You should see the App running in your browser at http://localhost:3000/
