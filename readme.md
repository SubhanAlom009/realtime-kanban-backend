# 📡 CollabBoard Backend API

RESTful API server for the CollabBoard collaborative Kanban application with real-time Socket.IO communication.

## 🚀 Tech Stack

- **Node.js** + Express.js
- **MongoDB** + Mongoose ODM
- **Socket.IO** for real-time updates
- **JWT** for authentication
- **express-validator** for input validation

## 📋 Features

- User authentication & authorization
- CRUD operations for tasks
- Real-time task updates via WebSocket
- Smart task assignment algorithm
- Conflict detection & resolution
- Activity logging system

## 🔗 API Endpoints

### Authentication
```
POST /api/auth/register    # Create new user account
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user info
GET  /api/auth/all         # Get all users (for task assignment)
```

### Tasks
```
GET    /api/tasks          # Get all tasks
POST   /api/tasks          # Create new task
PUT    /api/tasks/:id      # Update task
DELETE /api/tasks/:id      # Delete task
PUT    /api/tasks/:id/lock # Lock task for editing
PUT    /api/tasks/:id/unlock # Unlock task
```

### Activity Logs
```
GET /api/logs              # Get activity logs
```

## ⚙️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/SubhanAlom009/realtime-kanban-backend.git
   cd realtime-kanban-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🌐 Frontend Repository

**Frontend**: [https://github.com/SubhanAlom009/realtime-kanban-frontend](https://github.com/SubhanAlom009/realtime-kanban-frontend)

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/kanban` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `PORT` | Server port number | `5000` |
| `NODE_ENV` | Environment mode | `development` |

## 🔄 Socket.IO Events

- `task_created` - New task added
- `task_updated` - Task modified
- `task_deleted` - Task removed
- `task_locked` - Task locked for editing
- `task_unlocked` - Task unlocked

## 💪 Author

**Subhan Alom**
- GitHub: [@SubhanAlom009](https://github.com/SubhanAlom009)
- Portfolio: [subhanalom.live](https://subhanalom.live)
