# Money Glitch

A comprehensive financial management platform with separate user and admin interfaces, built with Flask (Python) backend and React (Node.js) frontend.

## Features

### User Interface
- User Authentication (Register/Login)
- Dashboard with loan overview and statistics
- Loan Application and Management
- Transaction History
- Savings Management
- Payment Processing
- Responsive Design

### Admin Interface
- Admin Authentication
- Comprehensive Dashboard with Statistics
- Loan Management (Approve/Reject)
- User Management
- Activity Tracking
- Recovery Rate Analytics
- Monthly Loan Charts

## Technology Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **JWT** - Authentication
- **SQLite** - Database

### Frontend
- **React** - JavaScript library
- **React Router** - Navigation
- **Styled Components** - CSS-in-JS styling
- **Chart.js** - Data visualization
- **Axios** - HTTP client

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create admin user:
   ```bash
   python create_admin.py
   ```

4. Run the Flask application:
   ```bash
   python app.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Usage

### User Access
- **URL**: `http://localhost:3000`
- **Email**: `test@example.com`
- **Password**: `password123`

### Admin Access
- **URL**: `http://localhost:3000/admin`
- **Username**: `admin`
- **Password**: `admin123`

### API Endpoints

#### User APIs
- **Authentication**: `/api/auth/`
- **Users**: `/api/users/`
- **Loans**: `/api/loans/`
- **Transactions**: `/api/transactions/`
- **Payments**: `/api/payments/`
- **Savings**: `/api/savings/`

#### Admin APIs
- **Admin Auth**: `/api/admin/login`
- **Dashboard Stats**: `/api/admin/dashboard/stats`
- **Recent Loans**: `/api/admin/dashboard/recent-loans`
- **Monthly Data**: `/api/admin/dashboard/monthly-loans`
- **Loan Management**: `/api/admin/loans`
- **User Management**: `/api/admin/users`
- **Recovery Rates**: `/api/admin/recovery-rates`

## Project Structure

```
loan-management/
├── backend/
│   ├── routes/              # API route handlers
│   │   ├── admin.py        # Admin API routes
│   │   ├── auth.py         # User authentication
│   │   ├── loans.py        # Loan management
│   │   └── ...
│   ├── models.py           # User database models
│   ├── admin_models.py     # Admin database models
│   ├── app.py             # Flask application
│   ├── create_admin.py    # Admin user creation script
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── admin/         # Admin interface components
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminLogin.js
│   │   │   └── ...
│   │   ├── components/    # User interface components
│   │   ├── pages/        # User page components
│   │   ├── contexts/     # React contexts
│   │   ├── App.js        # User application
│   │   └── AdminApp.js   # Admin application
│   └── package.json      # Node.js dependencies
└── README.md
```

## Admin Dashboard Features

- **Statistics Overview**: Active users, borrowers, cash flow metrics
- **Loan Management**: View, approve, and reject loan applications
- **User Management**: Monitor user accounts and activities
- **Analytics**: Recovery rates, monthly loan trends
- **Activity Logging**: Track all admin actions
- **Real-time Data**: Live updates of system metrics

## Development

### Running in Development Mode

1. **Backend** (Terminal 1):
   ```bash
   cd backend
   python app.py
   ```

2. **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

### Building for Production

```bash
cd frontend
npm run build
```

## License

This project is licensed under the MIT License.