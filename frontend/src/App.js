import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import Transactions from './pages/Transactions';
import Savings from './pages/Savings';
import Accounts from './pages/Accounts';
import LoanApplication from './pages/LoanApplication';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="loans" element={<Loans />} />
            <Route path="loan-application" element={<LoanApplication />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="savings" element={<Savings />} />
            <Route path="accounts" element={<Accounts />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;