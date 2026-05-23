# TaskFlow Backend API

RESTful API for TaskFlow Enterprise Task Manager built with Node.js, Express, and MongoDB.

## 🚀 Features

- ✅ User Authentication (JWT)
- ✅ Role-Based Access Control (RBAC)
- ✅ Super Admin, Admin, Employee roles
- ✅ Security code system for admin registration
- ✅ Password hashing with bcrypt
- ✅ MongoDB database
- ✅ RESTful API design
- ✅ Error handling middleware
- ✅ Request validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the backend directory (already created):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=taskflow_secret_key_2024_change_in_production
JWT_EXPIRE=7d
SUPER_ADMIN_CODE=company@123
CORS_ORIGIN=http://localhost:3000
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**Mac/Linux:**
```bash
# Start MongoDB
mongod
```

Or use MongoDB Atlas (cloud):
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update MONGODB_URI in .env

### 4. Start the Server

**Development mode (with nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on http://localhost:5000

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/profile` | Update profile | Private |
| PUT | `/change-password` | Change password | Private |

### Super Admin Routes (`/api/superadmin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/create-admin` | Create admin account | Super Admin |
| POST | `/generate-code` | Generate admin security code | Super Admin |
| GET | `/admins` | Get all admins | Super Admin |
| GET | `/employees` | Get all employees | Super Admin |
| DELETE | `/admin/:id` | Delete admin | Super Admin |
| PUT | `/admin/:id/toggle-status` | Block/Unblock admin | Super Admin |
| GET | `/security-codes` | Get all security codes | Super Admin |
| GET | `/stats` | Get system statistics | Super Admin |

## 🔐 Authentication

### Register User

**Endpoint:** `POST /api/auth/register`

**Employee Registration:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "position": "Software Developer",
  "role": "employee"
}
```

**Admin Registration:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "position": "Project Manager",
  "role": "admin",
  "securityCode": "ADMIN_CODE_HERE"
}
```

**Super Admin Registration:**
```json
{
  "name": "Super Admin",
  "email": "superadmin@example.com",
  "password": "password123",
  "position": "CEO",
  "role": "superadmin",
  "securityCode": "company@123"
}
```

### Login

**Endpoint:** `POST /api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "position": "Software Developer",
      "role": "employee"
    },
    "token": "JWT_TOKEN_HERE"
  }
}
```

### Using JWT Token

Include the token in the Authorization header for protected routes:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Testing the API

### Using cURL

**Register Employee:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "position": "Developer",
    "role": "employee"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the API endpoints
2. Set Authorization type to "Bearer Token"
3. Add your JWT token
4. Make requests

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── superAdminController.js  # Super admin logic
├── middleware/
│   ├── auth.js              # JWT verification & authorization
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js              # User model
│   ├── Project.js           # Project model
│   ├── Task.js              # Task model
│   └── SecurityCode.js      # Security code model
├── routes/
│   ├── authRoutes.js        # Auth routes
│   └── superAdminRoutes.js  # Super admin routes
├── utils/
│   └── generateToken.js     # JWT token generator
├── .env                     # Environment variables
├── .env.example             # Example env file
├── package.json             # Dependencies
├── server.js                # Entry point
└── README.md                # This file
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- Security code system for privileged roles
- Input validation
- Error handling
- CORS protection

## 🐛 Common Issues

### MongoDB Connection Error

**Problem:** Cannot connect to MongoDB

**Solution:**
- Make sure MongoDB is running
- Check MONGODB_URI in .env
- For MongoDB Atlas, whitelist your IP address

### JWT Token Invalid

**Problem:** "Not authorized to access this route"

**Solution:**
- Make sure token is included in Authorization header
- Token format: `Bearer YOUR_TOKEN`
- Check if token has expired (default: 7 days)

### Port Already in Use

**Problem:** Port 5000 is already in use

**Solution:**
- Change PORT in .env file
- Or kill the process using port 5000

## 📝 Next Steps

1. ✅ Authentication system - DONE
2. ✅ Super Admin features - DONE
3. ⏳ Admin features (projects, tasks, team management)
4. ⏳ Employee features (view tasks, update status)
5. ⏳ Real-time notifications
6. ⏳ File upload functionality
7. ⏳ Analytics and reports

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC

## 👨‍💻 Author

TaskFlow Development Team
