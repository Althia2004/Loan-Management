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

  const activityChartData = {
    labels: chartData.daily_activities?.labels || [],
    datasets: [{
      label: 'User Activities',
      data: chartData.daily_activities?.data || [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const incomeChartData = {
    labels: chartData.income_sources?.labels || [],
    datasets: [{
      data: chartData.income_sources?.data || [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0'
      ],
      hoverBackgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0'
      ]
    }]
  };

  const monthlyTrendsData = {
    labels: chartData.monthly_trends?.labels || [],
    datasets: [
      {
        label: 'Savings',
        data: chartData.monthly_trends?.savings || [],
        backgroundColor: 'rgba(39, 174, 96, 0.8)',
        borderColor: 'rgba(39, 174, 96, 1)',
        borderWidth: 2
      },
      {
        label: 'Loans',
        data: chartData.monthly_trends?.loans || [],
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        borderColor: 'rgba(231, 76, 60, 1)',
        borderWidth: 2
      }
    ]
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
          <ChartTitle>Daily Activity Trends</ChartTitle>
          <Line data={activityChartData} options={chartOptions} />
        </ChartContainer>
        <ChartContainer>
          <ChartTitle>Income Distribution</ChartTitle>
          <Doughnut data={incomeChartData} options={doughnutOptions} />
        </ChartContainer>
      </ChartsGrid>

      {/* Monthly Trends Chart */}
      <ChartContainer style={{ marginBottom: '20px' }}>
        <ChartTitle>Monthly Financial Trends</ChartTitle>
        <Bar data={monthlyTrendsData} options={chartOptions} />
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