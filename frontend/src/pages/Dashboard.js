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
  const { user, getAuthHeaders } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = getAuthHeaders();
        const response = await axios.get('http://localhost:5000/api/users/dashboard', { headers });
        console.log('Dashboard Data:', response.data);
        console.log('Active Loans:', response.data.active_loans);
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const activeLoans = dashboardData?.active_loans || [];

  // Generate colors for active loans
  const generateColors = (count) => {
    const colors = [
      '#667eea', // Purple
      '#48bb78', // Green
      '#ed8936', // Orange
      '#4299e1', // Blue
      '#f56565', // Red
      '#38b2ac', // Teal
      '#ed64a6', // Pink
      '#ecc94b', // Yellow
    ];
    return colors.slice(0, count);
  };

  const loanStatusData = {
    labels: activeLoans.length > 0 
      ? activeLoans.map((loan, index) => `Loan ${index + 1} (${loan.loan_type || 'Regular'})`)
      : ['No Active Loans'],
    datasets: [
      {
        data: activeLoans.length > 0 
          ? activeLoans.map(loan => loan.remaining_balance)
          : [1],
        backgroundColor: activeLoans.length > 0 
          ? generateColors(activeLoans.length)
          : ['#e2e8f0'],
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
                    display: activeLoans.length > 0
                  },
                  tooltip: {
                    enabled: activeLoans.length > 0,
                    callbacks: {
                      label: function(context) {
                        const loan = activeLoans[context.dataIndex];
                        if (!loan) return '';
                        const percentage = ((loan.remaining_balance / totalRemainingBalance) * 100).toFixed(1);
                        return [
                          `${context.label}`,
                          `Remaining: ₱${loan.remaining_balance.toLocaleString()}`,
                          `Principal: ₱${loan.principal_amount.toLocaleString()}`,
                          `Paid: ₱${(loan.principal_amount - loan.remaining_balance).toLocaleString()}`,
                          `Progress: ${percentage}% of total debt`
                        ];
                      }
                    }
                  }
                },
                cutout: '70%'
              }}
            />
          </ChartContainer>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            {activeLoans.length > 0 ? (
              <>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>
                  {activeLoans.length} Active Loan{activeLoans.length > 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '14px', color: '#f56565', marginTop: '4px' }}>
                  Total Outstanding: ₱{totalRemainingBalance.toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#718096', marginTop: '4px' }}>
                  Total Borrowed: ₱{totalLoanAmount.toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#48bb78', marginTop: '4px' }}>
                  Total Paid: ₱{paidAmount.toLocaleString()} ({((paidAmount / totalLoanAmount) * 100).toFixed(1)}%)
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Recent Transactions</h3>
          <Link 
            to="/transactions" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              padding: '8px 16px',
              border: '1px solid #667eea',
              borderRadius: '6px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#667eea';
            }}
          >
            View All Transactions →
          </Link>
        </div>
        
        {dashboardData?.recent_transactions && dashboardData.recent_transactions.length > 0 ? (
          <>
            <TransactionTable>
              <thead>
                <tr>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_transactions.slice(0, 5).map((transaction, index) => (
                  <tr key={transaction.id || index}>
                    <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge eligible={transaction.transaction_type === 'deposit' || transaction.transaction_type === 'savings'}>
                        {transaction.transaction_type?.replace('_', ' ').toUpperCase()}
                      </StatusBadge>
                    </TableCell>
                    <TableCell style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {transaction.description || transaction.transaction_id || 'Transaction'}
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      ₱{transaction.amount?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell>
                      <span style={{ 
                        color: transaction.status === 'completed' ? '#48bb78' : '#f56565',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {transaction.status || 'COMPLETED'}
                      </span>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </TransactionTable>
            <div style={{ textAlign: 'center', marginTop: '16px', padding: '12px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>
                Showing {Math.min(5, dashboardData.recent_transactions.length)} of {dashboardData.recent_transactions.length} recent transactions
              </p>
            </div>
          </>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: '#718096',
            backgroundColor: '#f7fafc',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h4 style={{ margin: '0 0 8px 0' }}>No transactions yet</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Start by making a savings deposit or loan payment to see your transaction history here.
            </p>
            <Link 
              to="/savings" 
              style={{ 
                display: 'inline-block',
                marginTop: '16px',
                color: '#667eea', 
                textDecoration: 'none',
                padding: '8px 16px',
                border: '1px solid #667eea',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              Make a Deposit
            </Link>
          </div>
        )}
      </Card>
    </DashboardContainer>
  );
};

export default Dashboard;