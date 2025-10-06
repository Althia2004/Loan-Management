import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminLoans from './admin/AdminLoans';
import AdminUsers from './admin/AdminUsers';
import AdminTransactions from './admin/AdminTransactions';
import AdminSavings from './admin/AdminSavings';
import AdminReports from './admin/AdminReports';
import AdminSettings from './admin/AdminSettings';
import AdminSidebar from './admin/AdminSidebar';
import AdminRoute from './admin/AdminRoute';
import AdminHeader from './admin/AdminHeader';
import styled from 'styled-components';

const AdminLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  margin-top: 70px;
`;

const AdminApp = () => {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminSidebar />
                  <MainContent>
                    <AdminHeader />
                    <ContentArea>
                      <Routes>
                        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
                        <Route path="/dashboard" element={<AdminDashboard />} />
                        <Route path="/loans" element={<AdminLoans />} />
                        <Route path="/users" element={<AdminUsers />} />
                        <Route path="/transactions" element={<AdminTransactions />} />
                        <Route path="/savings" element={<AdminSavings />} />
                        <Route path="/reports" element={<AdminReports />} />
                        <Route path="/settings" element={<AdminSettings />} />
                      </Routes>
                    </ContentArea>
                  </MainContent>
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route path="/" element={<Navigate to="/admin/login" />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
};

export default AdminApp;