import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const DashboardContainer = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 30px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const UserCard = styled(Card)`
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
  font-weight: bold;
`;

const UserName = styled.h3`
  font-size: 24px;
  margin-bottom: 8px;
`;

const UserRole = styled.p`
  opacity: 0.8;
  margin-bottom: 16px;
`;

const CapitalShare = styled.div`
  font-size: 28px;
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

const ChartContainer = styled.div`
  height: 300px;
  margin: 20px 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
`;

const StatCard = styled(Card)`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: #718096;
  font-size: 14px;
`;

const TransactionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  color: #4a5568;
  font-weight: 600;
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/users/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Sample data for charts
  const moneyFlowData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Money Flow',
        data: [10000, 15000, 12000, 18000, 22000, 25000, 20000, 15000, 8000],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const loanStatusData = {
    labels: ['Current Loan', 'Remaining Balance'],
    datasets: [
      {
        data: [dashboardData?.total_loan_amount || 100000, 10000],
        backgroundColor: ['#48bb78', '#e2e8f0'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return <DashboardContainer><div>Loading dashboard...</div></DashboardContainer>;
  }

  return (
    <DashboardContainer>
      <PageTitle>Dashboard</PageTitle>
      
      <CardGrid>
        <UserCard>
          <UserAvatar>
            {getInitials(user?.first_name, user?.last_name)}
          </UserAvatar>
          <UserName>{user?.first_name} {user?.last_name}</UserName>
          <UserRole>{user?.member_status}</UserRole>
          <CapitalShare>{user?.capital_share?.toLocaleString()} Php</CapitalShare>
          <StatusBadge eligible={user?.loan_eligibility}>
            {user?.loan_eligibility ? 'Eligible for loan' : 'Not Eligible'}
          </StatusBadge>
        </UserCard>

        <Card>
          <h3>Money Flow</h3>
          <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>This Month</p>
          <ChartContainer>
            <Line 
              data={moneyFlowData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </ChartContainer>
        </Card>

        <Card>
          <h3>Current Loan Status</h3>
          <ChartContainer>
            <Doughnut 
              data={loanStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                cutout: '70%'
              }}
            />
          </ChartContainer>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Remaining Balance: {(10000).toLocaleString()} PHP
            </div>
            <div style={{ fontSize: '14px', color: '#718096' }}>
              Current Loan: {(dashboardData?.total_loan_amount || 100000).toLocaleString()} PHP
            </div>
          </div>
        </Card>
      </CardGrid>

      <StatsGrid>
        <StatCard>
          <StatValue>{dashboardData?.active_loans?.length || 0}</StatValue>
          <StatLabel>Active Loans</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>₱{(dashboardData?.total_monthly_payment || 0).toLocaleString()}</StatValue>
          <StatLabel>Monthly Payment</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>5,000</StatValue>
          <StatLabel>Penalties</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>₱{user?.capital_share?.toLocaleString() || '0'}</StatValue>
          <StatLabel>Capital Share</StatLabel>
        </StatCard>
      </StatsGrid>

      <Card>
        <h3>Recent Transactions</h3>
        <TransactionTable>
          <thead>
            <tr>
              <TableHeader>Date</TableHeader>
              <TableHeader>Transaction ID</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Balance</TableHeader>
            </tr>
          </thead>
          <tbody>
            {dashboardData?.recent_transactions?.map((transaction, index) => (
              <tr key={transaction.id}>
                <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.transaction_id}</TableCell>
                <TableCell>
                  <StatusBadge eligible={transaction.transaction_type === 'savings'}>
                    {transaction.transaction_type}
                  </StatusBadge>
                </TableCell>
                <TableCell>₱{transaction.amount.toLocaleString()}</TableCell>
                <TableCell>-</TableCell>
              </tr>
            ))}
          </tbody>
        </TransactionTable>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/transactions" style={{ color: '#667eea', textDecoration: 'none' }}>
            See All →
          </Link>
        </div>
      </Card>
    </DashboardContainer>
  );
};

export default Dashboard;