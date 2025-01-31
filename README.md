# Organization Portal

A comprehensive organization management system that allows members to track attendance, donations, and events, with administrative capabilities for managing the organization.

## Features

### Member Features
- Secure login with organization-provided credentials
- Personal dashboard
- Attendance tracking
- Donation history and management
- Bio and profile management
- Event calendar and notifications
- View announcements

### Admin Features
- Administrative dashboard
- Member attendance management
- Event creation and management
- Announcement broadcasting
- Member management
- Analytics and reports

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (hosted on Koyeb)
- **Authentication**: JWT (JSON Web Tokens)
- **Hosting**: Koyeb

## Project Setup

1. **Clone the repository**
```bash
git clone [repository-url]
cd organization-portal
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Environment Setup**
Create `.env` files in both frontend and backend directories:

Backend `.env`:
```
PORT=5000
DATABASE_URL=your_koyeb_postgres_url
JWT_SECRET=your_jwt_secret
```

Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

4. **Database Setup**
- Create a PostgreSQL database on Koyeb
- Run migrations:
```bash
cd backend
npm run migrate
```

5. **Run the application**
```bash
# Start backend server
cd backend
npm run dev

# Start frontend application
cd frontend
npm start
```

## Project Structure

```
organization-portal/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── public/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
└── README.md
```

## API Documentation

### Authentication Endpoints
- POST /api/auth/login
- POST /api/auth/logout

### User Endpoints
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/users/attendance
- GET /api/users/donations

### Admin Endpoints
- POST /api/admin/users
- PUT /api/admin/attendance
- POST /api/admin/announcements
- POST /api/admin/events

## Deployment

1. Create a Koyeb account and install Koyeb CLI
2. Set up PostgreSQL database on Koyeb
3. Deploy backend and frontend services
4. Configure environment variables in Koyeb dashboard
5. Set up continuous deployment with GitHub integration

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for session management
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration
- Rate limiting
