# TaskFlow API - Complete Documentation

## Production Tracking System

This system allows admins to create projects with daily production targets, assign users, and track hourly production updates.

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Admin Routes](#admin-routes)
3. [Employee Routes](#employee-routes)
4. [Super Admin Routes](#super-admin-routes)

---

## 🔐 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 👨‍💼 Admin Routes

Base URL: `/api/admin`

### 1. Create Project

**Endpoint:** `POST /api/admin/project`

**Access:** Admin, Super Admin

**Request Body:**
```json
{
  "projectSubject": "Website Development Project",
  "projectCode": "WEB001",
  "dailyProductionTarget": 200,
  "assignedUsers": ["user_id_1", "user_id_2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "project_id",
    "projectSubject": "Website Development Project",
    "projectCode": "WEB001",
    "dailyProductionTarget": 200,
    "createdBy": {
      "_id": "admin_id",
      "name": "Admin Name",
      "email": "admin@example.com"
    },
    "assignedUsers": [
      {
        "_id": "user_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "position": "Developer"
      }
    ],
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Get All Projects

**Endpoint:** `GET /api/admin/projects`

**Access:** Admin, Super Admin

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "project_id",
      "projectSubject": "Website Development",
      "projectCode": "WEB001",
      "dailyProductionTarget": 200,
      "assignedUsers": [...],
      "status": "active"
    }
  ]
}
```

---

### 3. Get Project by ID

**Endpoint:** `GET /api/admin/project/:id`

**Access:** Admin, Super Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "project_id",
    "projectSubject": "Website Development",
    "projectCode": "WEB001",
    "dailyProductionTarget": 200,
    "createdBy": {...},
    "assignedUsers": [...]
  }
}
```

---

### 4. Update Project

**Endpoint:** `PUT /api/admin/project/:id`

**Access:** Admin, Super Admin

**Request Body:**
```json
{
  "projectSubject": "Updated Project Name",
  "dailyProductionTarget": 250,
  "assignedUsers": ["user_id_1", "user_id_2", "user_id_3"],
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {...}
}
```

---

### 5. Delete Project

**Endpoint:** `DELETE /api/admin/project/:id`

**Access:** Admin, Super Admin

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

### 6. Get All Users (for assignment)

**Endpoint:** `GET /api/admin/users`

**Access:** Admin, Super Admin

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "position": "Developer",
      "role": "employee"
    }
  ]
}
```

---

### 7. Get Project Statistics

**Endpoint:** `GET /api/admin/project/:id/stats`

**Access:** Admin, Super Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "project": {
      "projectSubject": "Website Development",
      "projectCode": "WEB001",
      "dailyProductionTarget": 200
    },
    "statistics": {
      "totalTasks": 15,
      "completedTasks": 10,
      "inProgressTasks": 5,
      "totalProduction": 2500,
      "averageCompletion": 85
    }
  }
}
```

---

## 👨‍💻 Employee Routes

Base URL: `/api/employee`

### 1. Get My Assigned Projects

**Endpoint:** `GET /api/employee/projects`

**Access:** Employee, Admin, Super Admin

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "project_id",
      "projectSubject": "Website Development",
      "projectCode": "WEB001",
      "dailyProductionTarget": 200,
      "status": "active",
      "createdBy": {
        "name": "Admin Name",
        "email": "admin@example.com"
      }
    }
  ]
}
```

---

### 2. Create Daily Task

**Endpoint:** `POST /api/employee/task`

**Access:** Employee, Admin, Super Admin

**Request Body:**
```json
{
  "projectId": "project_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Daily task created successfully",
  "data": {
    "_id": "task_id",
    "projectId": {
      "projectSubject": "Website Development",
      "projectCode": "WEB001",
      "dailyProductionTarget": 200
    },
    "userId": "user_id",
    "date": "2024-01-01T00:00:00.000Z",
    "dailyTarget": 200,
    "hourlyUpdates": [],
    "totalProduction": 0,
    "completionPercentage": 0,
    "remainingHours": 8,
    "status": "in-progress"
  }
}
```

---

### 3. Add Hourly Production Update

**Endpoint:** `POST /api/employee/task/:id/update`

**Access:** Employee, Admin, Super Admin

**Request Body:**
```json
{
  "production": 25
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hour 1 updated successfully",
  "data": {
    "_id": "task_id",
    "projectId": {...},
    "hourlyUpdates": [
      {
        "hour": 1,
        "production": 25,
        "timestamp": "2024-01-01T09:00:00.000Z"
      }
    ],
    "totalProduction": 25,
    "completionPercentage": 13,
    "remainingHours": 7,
    "status": "in-progress"
  }
}
```

**Example: Complete 8-Hour Day**

**Daily Target: 200 units**

Hour 1:
```json
{ "production": 20 }
```
Response:
```json
{
  "success": true,
  "message": "Hour 1 updated successfully",
  "data": {
    "summary": {
      "hourNumber": 1,
      "thisHourProduction": 20,
      "cumulativeTotal": 20,
      "dailyTarget": 200,
      "completionPercentage": 10,
      "remainingHours": 7,
      "status": "in-progress"
    }
  }
}
```
**Result: 20 total → 20/200 = 10%**

---

Hour 2:
```json
{ "production": 24 }
```
Response:
```json
{
  "summary": {
    "hourNumber": 2,
    "thisHourProduction": 24,
    "cumulativeTotal": 44,
    "completionPercentage": 22,
    "remainingHours": 6
  }
}
```
**Result: 20+24 = 44 total → 44/200 = 22%**

---

Hour 3:
```json
{ "production": 30 }
```
**Result: 44+30 = 74 total → 74/200 = 37%**

---

Hour 4:
```json
{ "production": 26 }
```
**Result: 74+26 = 100 total → 100/200 = 50%**

---

Hour 5:
```json
{ "production": 20 }
```
**Result: 100+20 = 120 total → 120/200 = 60%**

---

Hour 6:
```json
{ "production": 30 }
```
**Result: 120+30 = 150 total → 150/200 = 75%**

---

Hour 7:
```json
{ "production": 25 }
```
**Result: 150+25 = 175 total → 175/200 = 88%**

---

Hour 8:
```json
{ "production": 25 }
```
**Result: 175+25 = 200 total → 200/200 = 100%**
**Status: "completed" ✅**

---

### 4. Get Today's Task

**Endpoint:** `GET /api/employee/task/today`

**Access:** Employee, Admin, Super Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "task_id",
    "projectId": {
      "projectSubject": "Website Development",
      "projectCode": "WEB001",
      "dailyProductionTarget": 200
    },
    "hourlyUpdates": [
      {
        "hour": 1,
        "production": 25,
        "timestamp": "2024-01-01T09:00:00.000Z"
      },
      {
        "hour": 2,
        "production": 30,
        "timestamp": "2024-01-01T10:00:00.000Z"
      }
    ],
    "totalProduction": 55,
    "completionPercentage": 28,
    "remainingHours": 6,
    "status": "in-progress"
  }
}
```

---

### 5. Get All My Tasks

**Endpoint:** `GET /api/employee/tasks`

**Access:** Employee, Admin, Super Admin

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "task_id",
      "projectId": {
        "projectSubject": "Website Development",
        "projectCode": "WEB001"
      },
      "date": "2024-01-01T00:00:00.000Z",
      "totalProduction": 200,
      "completionPercentage": 100,
      "status": "completed"
    },
    {
      "_id": "task_id_2",
      "projectId": {
        "projectSubject": "Mobile App",
        "projectCode": "MOB001"
      },
      "date": "2023-12-31T00:00:00.000Z",
      "totalProduction": 180,
      "completionPercentage": 90,
      "status": "completed"
    }
  ]
}
```

---

### 6. Get Task by ID

**Endpoint:** `GET /api/employee/task/:id`

**Access:** Employee, Admin, Super Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "task_id",
    "projectId": {...},
    "hourlyUpdates": [...],
    "totalProduction": 200,
    "completionPercentage": 100,
    "status": "completed"
  }
}
```

---

### 7. Get My Statistics

**Endpoint:** `GET /api/employee/stats`

**Access:** Employee, Admin, Super Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 20,
    "completedTasks": 15,
    "inProgressTasks": 5,
    "totalProduction": 3500,
    "averageCompletion": 87,
    "todayTask": {
      "remainingHours": 5,
      "completionPercentage": 45,
      "totalProduction": 90
    }
  }
}
```

---

## 🔄 Complete Workflow Example

### Step 1: Admin Creates Project

```bash
curl -X POST http://localhost:5000/api/admin/project \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectSubject": "E-commerce Website Development",
    "projectCode": "ECOM001",
    "dailyProductionTarget": 200,
    "assignedUsers": ["employee_id_1", "employee_id_2"]
  }'
```

### Step 2: Employee Views Assigned Projects

```bash
curl -X GET http://localhost:5000/api/employee/projects \
  -H "Authorization: Bearer EMPLOYEE_TOKEN"
```

### Step 3: Employee Creates Daily Task

```bash
curl -X POST http://localhost:5000/api/employee/task \
  -H "Authorization: Bearer EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project_id"
  }'
```

### Step 4: Employee Updates Hourly Production (8 times)

**Hour 1:**
```bash
curl -X POST http://localhost:5000/api/employee/task/TASK_ID/update \
  -H "Authorization: Bearer EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"production": 25}'
```

**Hour 2:**
```bash
curl -X POST http://localhost:5000/api/employee/task/TASK_ID/update \
  -H "Authorization: Bearer EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"production": 30}'
```

... (Continue for all 8 hours)

### Step 5: Employee Views All Tasks

```bash
curl -X GET http://localhost:5000/api/employee/tasks \
  -H "Authorization: Bearer EMPLOYEE_TOKEN"
```

### Step 6: Admin Views Project Statistics

```bash
curl -X GET http://localhost:5000/api/admin/project/PROJECT_ID/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📊 Data Flow

```
Admin Creates Project
    ↓
Project with Daily Target (e.g., 200 units)
    ↓
Assigns Users to Project
    ↓
Employee Creates Daily Task
    ↓
Task Created with:
- Daily Target: 200
- Remaining Hours: 8
- Total Production: 0
- Completion: 0%
    ↓
Employee Updates Hour 1: 25 units
    ↓
Task Updated:
- Total Production: 25
- Completion: 13% (25/200)
- Remaining Hours: 7
    ↓
Employee Updates Hour 2: 30 units
    ↓
Task Updated:
- Total Production: 55
- Completion: 28% (55/200)
- Remaining Hours: 6
    ↓
... (Continue for 8 hours)
    ↓
After Hour 8:
- Total Production: 200
- Completion: 100%
- Remaining Hours: 0
- Status: "completed"
```

---

## 🎯 Key Features

1. **Automatic Calculation:**
   - Total production = Sum of all hourly updates
   - Completion percentage = (Total production / Daily target) × 100
   - Remaining hours = 8 - Number of updates

2. **Validation:**
   - Only one task per day per user per project
   - Maximum 8 hourly updates
   - Cannot update completed tasks
   - Only assigned users can create tasks

3. **Real-time Tracking:**
   - Each hourly update is timestamped
   - Progress is calculated automatically
   - Status changes to "completed" after 8 hours

4. **Statistics:**
   - Project-level statistics
   - User-level statistics
   - Average completion rates
   - Total production tracking

---

## 🐛 Error Responses

### Project Code Already Exists
```json
{
  "success": false,
  "message": "Project code already exists"
}
```

### Task Already Created for Today
```json
{
  "success": false,
  "message": "Task already created for today",
  "data": {...}
}
```

### All 8 Hours Updated
```json
{
  "success": false,
  "message": "All 8 hours have been updated"
}
```

### Not Assigned to Project
```json
{
  "success": false,
  "message": "You are not assigned to this project"
}
```

---

## 📝 Notes

- All dates are stored in UTC
- Production values must be positive numbers
- Project codes are automatically converted to uppercase
- Tasks are automatically marked as "completed" after 8 hourly updates
- Employees can only view and update their own tasks
- Admins can view all projects and statistics

---

## 🚀 Next Steps

1. Test all endpoints with Postman
2. Integrate with frontend
3. Add real-time notifications
4. Implement data visualization
5. Add export functionality for reports
