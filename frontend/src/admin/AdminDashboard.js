import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardContainer = styled.div`
  margin-left: 250px; /* Account for sidebar */
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  color: #333;
  margin: 0;
  font-size: 28px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: ${props => props.bgColor || '#fff'};
  color: ${props => props.textColor || '#333'};
  padding: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const StatIcon = styled.div`
  background: rgba(255,255,255,0.2);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const StatInfo = styled.div`
  h3 {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
  }
  
  p {
    margin: 5px 0 0;
    font-size: 14px;
    opacity: 0.9;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  
  h3 {
    margin: 0 0 20px;
    color: #333;
  }
`;

const RecentLoansCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  
  h3 {
    margin: 0 0 20px;
    color: #333;
  }
`;

const LoanItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const LoanInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0;
    font-size: 14px;
    color: #333;
  }
  
  p {
    margin: 2px 0 0;
    font-size: 12px;
    color: #666;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'PENDING': return '#fff3cd';
      case 'APPROVED': return '#d1ecf1';
      case 'ACTIVE': return '#d4edda';
      case 'COMPLETED': return '#d1ecf1';
      default: return '#f8d7da';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'PENDING': return '#856404';
      case 'APPROVED': return '#0c5460';
      case 'ACTIVE': return '#155724';
      case 'COMPLETED': return '#0c5460';
      default: return '#721c24';
    }
  }};
`;

const RecoveryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const RecoveryCard = styled.div`
  background: ${props => props.bgColor};
  color: white;
  padding: 20px;
  border-radius: 10px;
  
  h3 {
    margin: 0 0 10px;
    font-size: 16px;
  }
  
  .percentage {
    font-size: 32px;
    font-weight: bold;
    margin: 10px 0;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
`;

const AdminDashboard = () => {
  const { getAuthHeaders } = useAdminAuth();
  const [stats, setStats] = useState({});
  const [recentLoans, setRecentLoans] = useState([]);
  const [chartData, setChartData] = useState({});
  const [recoveryRates, setRecoveryRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = getAuthHeaders();
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/dashboard/stats', { headers });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent loans
      const loansResponse = await fetch('/api/admin/dashboard/recent-loans?per_page=8', { headers });
      const loansData = await loansResponse.json();
      setRecentLoans(loansData.loans || []);

      // Fetch monthly chart data
      const chartResponse = await fetch('/api/admin/dashboard/monthly-loans', { headers });
      const monthlyData = await chartResponse.json();
      
      setChartData({
        labels: monthlyData.months,
        datasets: [
          {
            label: 'Loans Released',
            data: monthlyData.data,
            fill: true,
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      });

      // Fetch recovery rates
      const recoveryResponse = await fetch('/api/admin/recovery-rates', { headers });
      const recoveryData = await recoveryResponse.json();
      setRecoveryRates(recoveryData);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (loading) {
    return <DashboardContainer>Loading...</DashboardContainer>;
  }

  return (
    <DashboardContainer>
      <Header>
        <PageTitle>Dashboard</PageTitle>
      </Header>

      <StatsGrid>
        <StatCard bgColor="#6b8e4e" textColor="white">
          <StatIcon>👥</StatIcon>
          <StatInfo>
            <h3>{stats.active_users || 0}</h3>
            <p>ACTIVE USERS</p>
          </StatInfo>
        </StatCard>

        <StatCard bgColor="#7d8e3e" textColor="white">
          <StatIcon>👤</StatIcon>
          <StatInfo>
            <h3>{stats.borrowers || 0}</h3>
            <p>BORROWERS</p>
          </StatInfo>
        </StatCard>

        <StatCard bgColor="#8e7d3e" textColor="white">
          <StatIcon>💵</StatIcon>
          <StatInfo>
            <h3>{stats.cash_disbursed?.toLocaleString() || 0}</h3>
            <p>CASH DISBURSED</p>
          </StatInfo>
        </StatCard>

        <StatCard bgColor="#6e8e4e" textColor="white">
          <StatIcon>💰</StatIcon>
          <StatInfo>
            <h3>{stats.cash_received?.toLocaleString() || 0}</h3>
            <p>CASH RECEIVED</p>
          </StatInfo>
        </StatCard>

        <StatCard bgColor="#7d8e5e" textColor="white">
          <StatIcon>🏛️</StatIcon>
          <StatInfo>
            <h3>{stats.total_savings?.toLocaleString() || 0}</h3>
            <p>SAVINGS</p>
          </StatInfo>
        </StatCard>

        <StatCard bgColor="#8e6d3e" textColor="white">
          <StatIcon>📋</StatIcon>
          <StatInfo>
            <h3>{stats.repaid_loans || 0}</h3>
            <p>REPAID LOANS</p>
          </StatInfo>
        </StatCard>

        <StatCard bgColor="#6e7e5e" textColor="white">
          <StatIcon>🏦</StatIcon>
          <StatInfo>
            <h3>{stats.other_accounts || 0}</h3>
            <p>OTHER ACCOUNTS</p>
          </StatInfo>
        </StatCard>

        <StatCard bgColor="#7e8e6e" textColor="white">
          <StatIcon>📊</StatIcon>
          <StatInfo>
            <h3>{stats.total_loans || 0}</h3>
            <p>LOANS</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <div>
          <ChartCard>
            <h3>Loans Released Monthly</h3>
            {chartData.labels && (
              <Line data={chartData} options={chartOptions} />
            )}
          </ChartCard>

          <RecoveryGrid style={{ marginTop: '20px' }}>
            <RecoveryCard bgColor="#f39c12">
              <h3>Rate of Recovery (Open, Fully Paid, Default Loans)</h3>
              <div className="percentage">{recoveryRates.open_fully_paid_default || 45}%</div>
              <p>Percentage of the due amount that is paid for all loans until today</p>
            </RecoveryCard>

            <RecoveryCard bgColor="#27ae60">
              <h3>Rate of Recovery (Open Loans)</h3>
              <div className="percentage">{recoveryRates.open_loans || 35}%</div>
              <p>Percentage of the due amount that is paid for open loans until today</p>
            </RecoveryCard>
          </RecoveryGrid>
        </div>

        <RecentLoansCard>
          <h3>Recent Loans</h3>
          {recentLoans.map((loan, index) => (
            <LoanItem key={loan.id}>
              <UserAvatar>
                {loan.user_name?.charAt(0) || 'U'}
              </UserAvatar>
              <LoanInfo>
                <h4>{loan.status || 'Reviewing Status'}</h4>
                <p>{loan.user_name} - ${loan.principal_amount?.toLocaleString()}</p>
              </LoanInfo>
              <StatusBadge status={loan.status}>
                {loan.status || 'PENDING'}
              </StatusBadge>
            </LoanItem>
          ))}
        </RecentLoansCard>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default AdminDashboard;