import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Container = styled.div`
  position: fixed;
  top: 60px;
  left: 250px;
  right: 0;
  bottom: 0;
  padding: 20px;
  background: #f8f9fa;
  overflow-y: auto;
  overflow-x: hidden;
  width: calc(100vw - 250px);
  height: calc(100vh - 60px);
  
  @media (max-width: 768px) {
    left: 0;
    width: 100vw;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const PageTitle = styled.h1`
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 24px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  max-width: 100%;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#3498db'};
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.color || '#2c3e50'};
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
  max-width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 300px;
  max-width: 100%;
  overflow: hidden;
`;

const ChartTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
`;

const ActivityContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 100%;
`;

const ActivityHeader = styled.div`
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const ActivityList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  padding: 10px 15px;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
  background: ${props => {
    switch (props.type) {
      case 'login': return '#3498db';
      case 'savings': return '#27ae60';
      case 'loan': return '#e74c3c';
      case 'payment': return '#f39c12';
      default: return '#95a5a6';
    }
  }};
`;

const ActivityDetails = styled.div`
  flex: 1;
`;

const ActivityDescription = styled.div`
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 4px;
`;

const ActivityTime = styled.div`
  color: #7f8c8d;
  font-size: 12px;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${props => props.active ? '#3498db' : '#bdc3c7'};
  background: ${props => props.active ? '#3498db' : 'white'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3498db;
    background: ${props => props.active ? '#2980b9' : '#ecf0f1'};
  }

  &:focus {
    outline: none;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #7f8c8d;
`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AdminReports = () => {
  const { getAuthHeaders } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState({});
  const [activityFilter, setActivityFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('7days');

  useEffect(() => {
    fetchReportsData();
  }, [timeFilter]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes, chartRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/reports/stats', {
          headers: getAuthHeaders()
        }),
        fetch(`http://localhost:5000/api/admin/reports/activities?period=${timeFilter}`, {
          headers: getAuthHeaders()
        }),
        fetch(`http://localhost:5000/api/admin/reports/charts?period=${timeFilter}`, {
          headers: getAuthHeaders()
        })
      ]);

      const statsData = await statsRes.json();
      const activitiesData = await activitiesRes.json();
      const chartData = await chartRes.json();

      setStats(statsData);
      setActivities(activitiesData.activities || []);
      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (activityFilter === 'all') return true;
    return activity.type === activityFilter;
  });

  // Loan Status Distribution (Doughnut Chart)
  const loanStatusChartData = {
    labels: chartData.loan_status?.labels || ['Pending', 'Active', 'Completed', 'Rejected'],
    datasets: [{
      data: chartData.loan_status?.data || [0, 0, 0, 0],
      backgroundColor: [
        '#FFA726', // Orange for Pending
        '#66BB6A', // Green for Active
        '#42A5F5', // Blue for Completed
        '#EF5350'  // Red for Rejected
      ],
      hoverBackgroundColor: [
        '#FF9800',
        '#4CAF50',
        '#2196F3',
        '#F44336'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  // Financial Overview (Bar Chart)
  const financialOverviewData = {
    labels: chartData.financial_overview?.labels || ['Total Savings', 'Loans Disbursed', 'Payments Received', 'Outstanding'],
    datasets: [{
      label: 'Amount (₱)',
      data: chartData.financial_overview?.data || [0, 0, 0, 0],
      backgroundColor: [
        'rgba(102, 187, 106, 0.8)', // Green for Savings
        'rgba(239, 83, 80, 0.8)',   // Red for Loans
        'rgba(66, 165, 245, 0.8)',  // Blue for Payments
        'rgba(255, 167, 38, 0.8)'   // Orange for Outstanding
      ],
      borderColor: [
        'rgba(102, 187, 106, 1)',
        'rgba(239, 83, 80, 1)',
        'rgba(66, 165, 245, 1)',
        'rgba(255, 167, 38, 1)'
      ],
      borderWidth: 2
    }]
  };

  // User Engagement (Doughnut Chart)
  const userEngagementData = {
    labels: chartData.user_engagement?.labels || ['Total Users', 'Users with Loans', 'Users with Savings', 'Active Payers'],
    datasets: [{
      data: chartData.user_engagement?.data || [0, 0, 0, 0],
      backgroundColor: [
        '#9575CD', // Purple
        '#4CAF50', // Green
        '#FFB74D', // Amber
        '#64B5F6'  // Light Blue
      ],
      hoverBackgroundColor: [
        '#7E57C2',
        '#43A047',
        '#FFA726',
        '#42A5F5'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    },
    animation: {
      animateRotate: true,
      duration: 2000
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading reports...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <PageTitle>Financial Reports & Analytics</PageTitle>
        <Subtitle>Comprehensive overview of customer activities and financial metrics</Subtitle>
      </Header>

      {/* Statistics Cards */}
      <StatsGrid>
        <StatCard color="#27ae60">
          <StatValue color="#27ae60">{formatCurrency(stats.total_savings || 0)}</StatValue>
          <StatLabel>Total Savings</StatLabel>
        </StatCard>
        <StatCard color="#e74c3c">
          <StatValue color="#e74c3c">{formatCurrency(stats.total_loans || 0)}</StatValue>
          <StatLabel>Active Loans</StatLabel>
        </StatCard>
        <StatCard color="#f39c12">
          <StatValue color="#f39c12">{formatCurrency(stats.total_capital_share || 0)}</StatValue>
          <StatLabel>Capital Shares</StatLabel>
        </StatCard>
        <StatCard color="#3498db">
          <StatValue color="#3498db">{stats.total_users || 0}</StatValue>
          <StatLabel>Total Members</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Time Filter */}
      <FilterButtons>
        <FilterButton 
          active={timeFilter === '7days'}
          onClick={() => setTimeFilter('7days')}
        >
          Last 7 Days
        </FilterButton>
        <FilterButton 
          active={timeFilter === '30days'}
          onClick={() => setTimeFilter('30days')}
        >
          Last 30 Days
        </FilterButton>
        <FilterButton 
          active={timeFilter === '3months'}
          onClick={() => setTimeFilter('3months')}
        >
          Last 3 Months
        </FilterButton>
        <FilterButton 
          active={timeFilter === '1year'}
          onClick={() => setTimeFilter('1year')}
        >
          Last Year
        </FilterButton>
      </FilterButtons>

      {/* Charts Grid */}
      <ChartsGrid>
        <ChartContainer>
          <ChartTitle>📊 Loan Status Distribution</ChartTitle>
          <Doughnut data={loanStatusChartData} options={doughnutOptions} />
        </ChartContainer>
        <ChartContainer>
          <ChartTitle>👥 User Engagement</ChartTitle>
          <Doughnut data={userEngagementData} options={doughnutOptions} />
        </ChartContainer>
      </ChartsGrid>

      {/* Financial Overview Chart */}
      <ChartContainer style={{ marginBottom: '20px' }}>
        <ChartTitle>💰 Financial Overview</ChartTitle>
        <Bar data={financialOverviewData} options={chartOptions} />
      </ChartContainer>

      {/* Recent Activities */}
      <ActivityContainer>
        <ActivityHeader>
          <ChartTitle style={{ color: 'white', margin: 0 }}>Recent Customer Activities</ChartTitle>
          <FilterButtons style={{ marginTop: '15px', marginBottom: '0' }}>
            <FilterButton 
              active={activityFilter === 'all'}
              onClick={() => setActivityFilter('all')}
            >
              All Activities
            </FilterButton>
            <FilterButton 
              active={activityFilter === 'login'}
              onClick={() => setActivityFilter('login')}
            >
              Logins
            </FilterButton>
            <FilterButton 
              active={activityFilter === 'savings'}
              onClick={() => setActivityFilter('savings')}
            >
              Savings
            </FilterButton>
            <FilterButton 
              active={activityFilter === 'loan'}
              onClick={() => setActivityFilter('loan')}
            >
              Loans
            </FilterButton>
          </FilterButtons>
        </ActivityHeader>
        <ActivityList>
          {filteredActivities.map((activity, index) => (
            <ActivityItem key={index}>
              <ActivityIcon type={activity.type}>
                {activity.type === 'login' && 'L'}
                {activity.type === 'savings' && 'S'}
                {activity.type === 'loan' && 'L'}
                {activity.type === 'payment' && 'P'}
              </ActivityIcon>
              <ActivityDetails>
                <ActivityDescription>{activity.description}</ActivityDescription>
                <ActivityTime>{formatDate(activity.created_at)}</ActivityTime>
              </ActivityDetails>
              {activity.amount && (
                <StatValue style={{ fontSize: '16px', margin: 0 }}>
                  {formatCurrency(activity.amount)}
                </StatValue>
              )}
            </ActivityItem>
          ))}
          {filteredActivities.length === 0 && (
            <ActivityItem>
              <ActivityDetails>
                <ActivityDescription>No activities found for the selected filter.</ActivityDescription>
              </ActivityDetails>
            </ActivityItem>
          )}
        </ActivityList>
      </ActivityContainer>
    </Container>
  );
};

export default AdminReports;