import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import Transactions from './pages/Transactions';
import Savings from './pages/Savings';
import Accounts from './pages/Accounts';
import LoanApplication from './pages/LoanApplication';
import Payments from './pages/Payments';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="loans" element={<Loans />} />
              <Route path="loan-application" element={<LoanApplication />} />
              <Route path="payments" element={<Payments />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="savings" element={<Savings />} />
              <Route path="accounts" element={<Accounts />} />
            </Route>
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;