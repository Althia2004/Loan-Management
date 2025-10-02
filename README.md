# Money Glitch

A comprehensive financial management platform built with Python Flask backend and React frontend, designed to handle member loans, savings, transactions, and account management.

## Features

### User Management
- User registration and authentication
- JWT-based authorization
- User profiles with capital share tracking
- Member status and loan eligibility management

### Loan Management
- Loan application system
- Eligibility checking (minimum ₱20,000 capital share)
- Loan approval workflow
- Interest calculation and monthly payment computation
- Loan status tracking (Pending, Approved, Active, Completed)

### Savings Management
- Savings deposit functionality
- Interest rate calculation
- Savings history tracking
- Total balance management

### Transactions
- Comprehensive transaction logging
- Transaction types: Loans, Savings, Payments, Penalties
- Transaction history with detailed records
- Real-time transaction updates

### Payments
- Loan payment processing
- Payment history tracking
- Balance updates after payments
- Payment confirmation system

### Dashboard
- User overview with capital share status
- Loan eligibility indicators
- Recent transaction summaries
- Interactive charts and visualizations
- Monthly payment tracking

## Technology Stack

### Backend (Python Flask)
- **Flask**: Web framework
- **Flask-SQLAlchemy**: Database ORM
- **Flask-JWT-Extended**: JWT authentication
- **Flask-CORS**: Cross-origin resource sharing
- **Flask-Bcrypt**: Password hashing
- **SQLite**: Database (development)

### Frontend (React)
- **React 18**: UI framework
- **React Router**: Navigation
- **Styled Components**: CSS-in-JS styling
- **Chart.js & React-Chartjs-2**: Data visualization
- **Axios**: HTTP client

## Project Structure

```
loan-management/
├── backend/
│   ├── app.py              # Flask application entry point
│   ├── models.py           # Database models
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   └── routes/
│       ├── auth.py        # Authentication routes
│       ├── users.py       # User management routes
│       ├── loans.py       # Loan management routes
│       ├── transactions.py # Transaction routes
│       ├── payments.py    # Payment routes
│       └── savings.py     # Savings routes
├── frontend/
│   ├── package.json       # Node.js dependencies
│   ├── src/
│   │   ├── App.js         # Main application component
│   │   ├── index.js       # Application entry point
│   │   ├── index.css      # Global styles
│   │   ├── components/    # Reusable components
│   │   │   ├── Layout.js
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   └── PrivateRoute.js
│   │   ├── contexts/      # React contexts
│   │   │   └── AuthContext.js
│   │   └── pages/         # Page components
│   │       ├── Login.js
│   │       ├── Register.js
│   │       ├── Dashboard.js
│   │       ├── Loans.js
│   │       ├── LoanApplication.js
│   │       ├── Transactions.js
│   │       ├── Savings.js
│   │       └── Accounts.js
│   └── public/
│       └── index.html
└── README.md
```

## Installation and Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

6. Initialize the database:
```bash
python app.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
cd backend
python app.py
```
The backend will run on `http://localhost:5000`

2. Start the frontend development server:
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

### Production Deployment

#### Backend
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Frontend
```bash
cd frontend
npm run build
# Serve the build directory with a web server
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get dashboard data

### Loans
- `GET /api/loans` - Get user loans
- `POST /api/loans/apply` - Apply for loan
- `PUT /api/loans/{id}/approve` - Approve loan
- `GET /api/loans/{id}` - Get loan details

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions/create` - Create transaction
- `GET /api/transactions/summary` - Get transaction summary

### Payments
- `GET /api/payments` - Get user payments
- `POST /api/payments/make` - Make payment
- `GET /api/payments/history` - Get payment history

### Savings
- `GET /api/savings` - Get user savings
- `POST /api/savings/deposit` - Make savings deposit
- `GET /api/savings/summary` - Get savings summary

## Database Models

### User
- Personal information (name, email, contact)
- Capital share amount
- Member status and loan eligibility
- Authentication credentials

### Loan
- Principal amount and interest rate
- Duration and monthly payment
- Remaining balance and status
- Purpose and approval dates

### Transaction
- Transaction type and amount
- Description and timestamps
- User association

### Saving
- Deposit amount and balance
- Interest rate and creation date

### Payment
- Payment amount and date
- Associated loan and user
- Payment status

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.