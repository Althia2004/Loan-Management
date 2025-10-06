import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const LoansContainer = styled.div`
  padding: 20px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #2d3748;
`;

const ApplyButton = styled(Link)`
  background-color: #7c5dfa;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #6d4fd9;
  }
`;

const UserCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
`;

const UserDetails = styled.div``;

const UserName = styled.h3`
  font-size: 20px;
  margin-bottom: 4px;
`;

const UserRole = styled.p`
  opacity: 0.8;
  font-size: 14px;
`;

const CapitalInfo = styled.div`
  text-align: right;
`;

const CapitalAmount = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => props.eligible ? '#c6f6d5' : '#fed7d7'};
  color: ${props => props.eligible ? '#22543d' : '#742a2a'};
`;

const LoansTable = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const TableTitle = styled.h3`
  margin-bottom: 20px;
  color: #2d3748;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  color: #4a5568;
  font-weight: 600;
  background-color: #f7fafc;
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const NoLoansMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  font-size: 16px;
`;

const Loans = () => {
  const { user, getAuthHeaders } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  console.log('[USER LOANS] Component loaded');
  console.log('[USER LOANS] User:', user);
  console.log('[USER LOANS] Initial loans state:', loans);
  console.log('[USER LOANS] GetAuthHeaders function available:', typeof getAuthHeaders);
  console.log('[USER LOANS] Token from localStorage:', localStorage.getItem('token'));
  console.log('[USER LOANS] Current auth headers:', getAuthHeaders());

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        console.log('[USER LOANS] Fetching loans...');
        
        const headers = getAuthHeaders();
        console.log('[USER LOANS] Auth headers:', headers);
        
        if (!headers || !headers.Authorization) {
          console.error('[USER LOANS] No auth headers available!');
          setLoading(false);
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/loans/', { headers });
        console.log('[USER LOANS] Response status:', response.status);
        console.log('[USER LOANS] Response data:', response.data);
        console.log('[USER LOANS] Number of loans:', response.data.loans?.length || 0);
        
        setLoans(response.data.loans || []);
        setLoading(false);
      } catch (error) {
        console.error('[USER LOANS] Error fetching loans:', error);
        console.error('[USER LOANS] Error response:', error.response?.data);
        setLoading(false);
      }
    };

    if (user) {
      console.log('[USER LOANS] User is logged in, calling fetchLoans()');
      fetchLoans();
    } else {
      console.log('[USER LOANS] No user found, not fetching loans');
      setLoading(false);
    }
  }, [user]); // Only depend on user, not getAuthHeaders

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
        return { background: '#c6f6d5', color: '#22543d' };
      case 'pending':
        return { background: '#feebc8', color: '#744210' };
      case 'rejected':
        return { background: '#fed7d7', color: '#742a2a' };
      default:
        return { background: '#e2e8f0', color: '#4a5568' };
    }
  };

  if (loading) {
    return <LoansContainer><div>Loading loans...</div></LoansContainer>;
  }

  // Separate approved and rejected loans
  const approvedLoans = loans.filter(loan => loan.status.toLowerCase() === 'approved');
  const rejectedLoans = loans.filter(loan => loan.status.toLowerCase() === 'rejected');

  return (
    <LoansContainer>
      <PageHeader>
        <PageTitle>Loans</PageTitle>
      </PageHeader>

      <UserCard>
        <UserInfo>
          <UserAvatar>
            {getInitials(user?.first_name, user?.last_name)}
          </UserAvatar>
          <UserDetails>
            <UserName>{user?.first_name} {user?.last_name}</UserName>
            <UserRole>{user?.member_status}</UserRole>
          </UserDetails>
        </UserInfo>
        <CapitalInfo>
          <CapitalAmount>{user?.capital_share?.toLocaleString()} Php</CapitalAmount>
          <StatusBadge eligible={user?.loan_eligibility}>
            {user?.loan_eligibility ? 'Eligible' : 'Not Eligible'}
          </StatusBadge>
        </CapitalInfo>
      </UserCard>

      <LoansTable>
        <TableTitle>Your Active Loans</TableTitle>
        {approvedLoans.length === 0 ? (
          <NoLoansMessage>
            No active loans. {user?.loan_eligibility ? 'Apply for your first loan!' : 'Increase your capital share to ₱20,000 to be eligible for loans.'}
          </NoLoansMessage>
        ) : (
          <Table>
            <thead>
              <tr>
                <TableHeader>Sl No</TableHeader>
                <TableHeader>Principal Amount</TableHeader>
                <TableHeader>Left to repay</TableHeader>
                <TableHeader>Duration</TableHeader>
                <TableHeader>Interest rate</TableHeader>
                <TableHeader>Monthly Amortization</TableHeader>
              </tr>
            </thead>
            <tbody>
              {approvedLoans.map((loan, index) => (
                <tr key={loan.id}>
                  <TableCell>{String(index + 1).padStart(2, '0')}.</TableCell>
                  <TableCell>₱{loan.principal_amount.toLocaleString()}</TableCell>
                  <TableCell>₱{loan.remaining_balance.toLocaleString()}</TableCell>
                  <TableCell>{loan.duration_months} Months</TableCell>
                  <TableCell>{loan.interest_rate}%</TableCell>
                  <TableCell>₱{loan.monthly_payment.toLocaleString()} / month</TableCell>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f7fafc', fontWeight: 'bold' }}>
                <TableCell>Total</TableCell>
                <TableCell>₱{approvedLoans.reduce((sum, loan) => sum + loan.principal_amount, 0).toLocaleString()}</TableCell>
                <TableCell>₱{approvedLoans.reduce((sum, loan) => sum + loan.remaining_balance, 0).toLocaleString()}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell style={{ color: '#e53e3e' }}>
                  ₱{approvedLoans.reduce((sum, loan) => sum + loan.monthly_payment, 0).toLocaleString()} / month
                </TableCell>
              </tr>
            </tfoot>
          </Table>
        )}
      </LoansTable>

      {rejectedLoans.length > 0 && (
        <LoansTable style={{ marginTop: '30px' }}>
          <TableTitle>Rejected Loan Applications</TableTitle>
          <Table>
            <thead>
              <tr>
                <TableHeader>Sl No</TableHeader>
                <TableHeader>Principal Amount</TableHeader>
                <TableHeader>Duration</TableHeader>
                <TableHeader>Purpose</TableHeader>
                <TableHeader>Application Date</TableHeader>
                <TableHeader>Status</TableHeader>
              </tr>
            </thead>
            <tbody>
              {rejectedLoans.map((loan, index) => (
                <tr key={loan.id} style={{ background: '#fff5f5' }}>
                  <TableCell>{String(index + 1).padStart(2, '0')}.</TableCell>
                  <TableCell>₱{loan.principal_amount.toLocaleString()}</TableCell>
                  <TableCell>{loan.duration_months} Months</TableCell>
                  <TableCell>{loan.purpose || 'N/A'}</TableCell>
                  <TableCell>{new Date(loan.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span style={{ 
                      background: '#fed7d7', 
                      color: '#742a2a', 
                      padding: '4px 12px', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      REJECTED
                    </span>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </LoansTable>
      )}
    </LoansContainer>
  );
};

export default Loans;