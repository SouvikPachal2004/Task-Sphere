# 🚀 Task Sphere

Task Sphere is a full-stack task management and production tracking system built for teams, admins, employees, and super admins. It helps manage projects, assign employees, track daily production, monitor hourly updates, and handle role-based access securely.

## 🌐 Live Demo

🔗 **Live App:** https://tasksphere-app.netlify.app

## ✨ Features

- 🔐 JWT-based authentication
- 👥 Role-based access control
- 🛡️ Super Admin, Admin, and Employee dashboards
- 📁 Project creation and management
- ✅ Task assignment and tracking
- ⏱️ Hourly production updates
- 📊 Dashboard statistics
- 🔔 Notification system
- 🌙 Light/Dark theme support
- 🚀 Railway deployment ready
- 🍃 MongoDB database integration

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Font Awesome

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

### Deployment
- Railway
- Railway MongoDB

## 📁 Project Structure

```text
TaskSphere/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── dashboard-admin.html
│   ├── dashboard-employee.html
│   ├── dashboard-superadmin.html
│   ├── css/
│   └── js/
├── backend/
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── railway.json
├── package.json
└── README.md
```

## ⚙️ Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
SUPER_ADMIN_CODE=company@123
CORS_ORIGIN=http://localhost:5000
```

## 🚀 Run Locally

```bash
cd backend
npm install
npm start
```

Then open:

```text
http://localhost:5000
```

## 🌍 Deployment

This project is deployed on Railway.

🔗 **Production URL:** https://tasksphere-web-production.up.railway.app

## 👨‍💻 Author

**Souvik Pachal**

GitHub: https://github.com/SouvikPachal2004

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
