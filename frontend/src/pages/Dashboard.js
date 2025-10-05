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

const WelcomeText = styled.p`
  font-size: 16px;
  color: #4a5568;
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

  // Generate money flow data from payment history
  const generateMoneyFlowData = () => {
    if (!dashboardData?.payment_history || dashboardData.payment_history.length === 0) {
      // Return empty data if no payments
      return {
        labels: ['No payments yet'],
        datasets: [
          {
            label: 'Payments',
            data: [0],
            borderColor: '#e2e8f0',
            backgroundColor: 'rgba(226, 232, 240, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      };
    }

    const labels = dashboardData.payment_history.map(item => item.month);
    const data = dashboardData.payment_history.map(item => item.amount);

    return {
      labels,
      datasets: [
        {
          label: 'Payment Amount (₱)',
          data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const moneyFlowData = generateMoneyFlowData();

  // Calculate loan balance data from backend response
  const totalLoanAmount = dashboardData?.total_principal_amount || 0;
  const totalRemainingBalance = dashboardData?.total_remaining_balance || 0;
  const paidAmount = totalLoanAmount - totalRemainingBalance;

  const loanStatusData = {
    labels: totalLoanAmount > 0 ? ['Paid Amount', 'Remaining Balance'] : ['No Active Loans'],
    datasets: [
      {
        data: totalLoanAmount > 0 ? [paidAmount, totalRemainingBalance] : [1],
        backgroundColor: totalLoanAmount > 0 ? ['#48bb78', '#f56565'] : ['#e2e8f0'],
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
          <CapitalShare>₱{user?.capital_share?.toLocaleString('en-PH')}</CapitalShare>
          <StatusBadge eligible={user?.loan_eligibility}>
            {user?.loan_eligibility ? 'Eligible for loan' : 'Not Eligible'}
          </StatusBadge>
        </UserCard>

        <Card>
          <h3>Payment History</h3>
          <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>
            {dashboardData?.payment_history?.length > 0 ? 'Last 12 Months' : 'No payment history yet'}
          </p>
          <ChartContainer>
            <Line 
              data={moneyFlowData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    display: dashboardData?.payment_history?.length > 0,
                    position: 'top'
                  },
                  tooltip: {
                    enabled: dashboardData?.payment_history?.length > 0,
                    callbacks: {
                      label: function(context) {
                        return `Payment: ₱${context.parsed.y.toLocaleString()}`;
                      }
                    }
                  }
                },
                scales: {
                  y: { 
                    beginAtZero: true, 
                    grid: { display: false },
                    ticks: {
                      callback: function(value) {
                        return '₱' + value.toLocaleString();
                      }
                    }
                  },
                  x: { grid: { display: false } }
                }
              }}
            />
          </ChartContainer>
          {dashboardData?.payment_history?.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: '#718096' }}>
              Total Payments: ₱{dashboardData.payment_history.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </div>
          )}
        </Card>

        <Card>
          <h3>Current Loan Status</h3>
          <ChartContainer>
            <Doughnut 
              data={loanStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    position: 'bottom',
                    display: totalLoanAmount > 0
                  },
                  tooltip: {
                    enabled: totalLoanAmount > 0,
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const percentage = ((value / totalLoanAmount) * 100).toFixed(1);
                        return `${label}: ₱${value.toLocaleString()} (${percentage}%)`;
                      }
                    }
                  }
                },
                cutout: '70%'
              }}
            />
          </ChartContainer>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            {totalLoanAmount > 0 ? (
              <>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f56565' }}>
                  Remaining Balance: ₱{totalRemainingBalance.toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#48bb78', marginTop: '4px' }}>
                  Paid Amount: ₱{paidAmount.toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#718096', marginTop: '4px' }}>
                  Total Loan: ₱{totalLoanAmount.toLocaleString()}
                </div>
              </>
            ) : (
              <div style={{ fontSize: '16px', color: '#718096' }}>
                No active loans
              </div>
            )}
          </div>
        </Card>
      </CardGrid>

      <StatsGrid>
        <StatCard>
          <StatValue>{dashboardData?.active_loans?.length || 0}</StatValue>
          <StatLabel>Active Loans</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>₱{totalRemainingBalance.toLocaleString()}</StatValue>
          <StatLabel>Total Outstanding</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>₱{(dashboardData?.total_monthly_payment || 0).toLocaleString()}</StatValue>
          <StatLabel>Monthly Payment</StatLabel>
        </StatCard>
        <StatCard style={{ 
          borderLeft: dashboardData?.total_penalties > 0 ? '4px solid #f56565' : '4px solid #e2e8f0',
          backgroundColor: dashboardData?.total_penalties > 0 ? '#fef5f5' : 'white'
        }}>
          <StatValue style={{ 
            color: dashboardData?.total_penalties > 0 ? '#f56565' : '#667eea'
          }}>
            {dashboardData?.total_penalties > 0 && '⚠️ '}₱{(dashboardData?.total_penalties || 0).toLocaleString()}
          </StatValue>
          <StatLabel style={{ 
            color: dashboardData?.total_penalties > 0 ? '#f56565' : '#718096'
          }}>
            Penalties {dashboardData?.total_penalties > 0 ? '(Overdue)' : ''}
          </StatLabel>
          {dashboardData?.overdue_loans?.length > 0 && (
            <div style={{ fontSize: '12px', color: '#f56565', marginTop: '4px' }}>
              {dashboardData.overdue_loans.length} overdue loan{dashboardData.overdue_loans.length > 1 ? 's' : ''}
            </div>
          )}
        </StatCard>
      </StatsGrid>

      {dashboardData?.overdue_loans?.length > 0 && (
        <Card style={{ borderLeft: '4px solid #f56565' }}>
          <h3 style={{ color: '#f56565' }}>⚠️ Overdue Loan Penalties</h3>
          <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>
            You have {dashboardData.overdue_loans.length} overdue loan{dashboardData.overdue_loans.length > 1 ? 's' : ''} with penalties
          </p>
          <TransactionTable>
            <thead>
              <tr>
                <TableHeader>Loan ID</TableHeader>
                <TableHeader>Days Overdue</TableHeader>
                <TableHeader>Monthly Payment</TableHeader>
                <TableHeader>Penalty Amount</TableHeader>
                <TableHeader>Due Date</TableHeader>
              </tr>
            </thead>
            <tbody>
              {dashboardData.overdue_loans.map((overdueData, index) => (
                <tr key={index}>
                  <TableCell>#{overdueData.loan_id}</TableCell>
                  <TableCell>
                    <span style={{ color: '#f56565', fontWeight: 'bold' }}>
                      {overdueData.days_overdue} days
                    </span>
                  </TableCell>
                  <TableCell>₱{overdueData.monthly_payment.toLocaleString()}</TableCell>
                  <TableCell style={{ color: '#f56565', fontWeight: 'bold' }}>
                    ₱{overdueData.penalty_amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{new Date(overdueData.due_date).toLocaleDateString()}</TableCell>
                </tr>
              ))}
            </tbody>
          </TransactionTable>
          <div style={{ 
            background: '#fed7d7', 
            padding: '12px', 
            borderRadius: '8px', 
            marginTop: '16px',
            fontSize: '14px'
          }}>
            <strong>Penalty Calculation:</strong> 5% of monthly payment for every 30-day period overdue.
            Pay your loans on time to avoid additional penalties.
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link 
              to="/accounts" 
              style={{ 
                background: '#48bb78', 
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '4px', 
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Make Payment Now
            </Link>
          </div>
        </Card>
      )}

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