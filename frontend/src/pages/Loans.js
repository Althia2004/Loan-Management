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
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await axios.get('/api/loans');
        setLoans(response.data.loans);
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

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

  return (
    <LoansContainer>
      <PageHeader>
        <PageTitle>Loans</PageTitle>
        {user?.loan_eligibility && (
          <ApplyButton to="/loan-application">Apply for Loan</ApplyButton>
        )}
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
        <TableTitle>Your Loans</TableTitle>
        {loans.length === 0 ? (
          <NoLoansMessage>
            No loans found. {user?.loan_eligibility ? 'Apply for your first loan!' : 'Increase your capital share to ₱20,000 to be eligible for loans.'}
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
              {loans.map((loan, index) => (
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
                <TableCell>₱{loans.reduce((sum, loan) => sum + loan.principal_amount, 0).toLocaleString()}</TableCell>
                <TableCell>₱{loans.reduce((sum, loan) => sum + loan.remaining_balance, 0).toLocaleString()}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell style={{ color: '#e53e3e' }}>
                  ₱{loans.reduce((sum, loan) => sum + loan.monthly_payment, 0).toLocaleString()} / month
                </TableCell>
              </tr>
            </tfoot>
          </Table>
        )}
      </LoansTable>
    </LoansContainer>
  );
};

export default Loans;