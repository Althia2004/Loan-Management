import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const TransactionsContainer = styled.div`
  margin-left: 250px; /* Account for sidebar */
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  color: #333;
  margin: 0;
  font-size: 28px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  min-width: 120px;
`;

const DateInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
`;

const StatsCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.color || '#333'};
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 14px;
`;

const ActivitiesTable = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  padding: 15px 20px;
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  align-items: center;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const AdminInfo = styled.div`
  h4 {
    margin: 0 0 5px;
    color: #333;
    font-size: 14px;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 12px;
  }
`;

const ActionBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  background: ${props => {
    switch (props.action) {
      case 'CREATE_USER': return '#d4edda';
      case 'UPDATE_USER': return '#fff3cd';
      case 'DELETE_USER': return '#f8d7da';
      case 'APPROVE_LOAN': return '#d1ecf1';
      case 'REJECT_LOAN': return '#f8d7da';
      case 'LOGIN': return '#e2e3e5';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.action) {
      case 'CREATE_USER': return '#155724';
      case 'UPDATE_USER': return '#856404';
      case 'DELETE_USER': return '#721c24';
      case 'APPROVE_LOAN': return '#0c5460';
      case 'REJECT_LOAN': return '#721c24';
      case 'LOGIN': return '#383d41';
      default: return '#666';
    }
  }};
`;

const TimeAgo = styled.span`
  color: #666;
  font-size: 12px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: white;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AdminTransactions = () => {
  const { getAuthHeaders } = useAdminAuth();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, [actionFilter, dateFilter, startDate, endDate, currentPage]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      let url = `/api/admin/activities?page=${currentPage}&per_page=20`;
      
      if (actionFilter !== 'all') {
        url += `&action=${actionFilter}`;
      }
      
      if (dateFilter !== 'all') {
        url += `&date_filter=${dateFilter}`;
      }
      
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      
      if (endDate) {
        url += `&end_date=${endDate}`;
      }
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      setActivities(data.activities || []);
      setTotalPages(data.pages || 1);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayActivities = data.activities.filter(activity => 
        activity.created_at.startsWith(today)
      ).length;
      
      const userActions = data.activities.filter(activity => 
        ['CREATE_USER', 'UPDATE_USER', 'DELETE_USER'].includes(activity.action)
      ).length;
      
      const loanActions = data.activities.filter(activity => 
        ['APPROVE_LOAN', 'REJECT_LOAN'].includes(activity.action)
      ).length;
      
      const logins = data.activities.filter(activity => 
        activity.action === 'LOGIN'
      ).length;
      
      setStats({
        total: data.total || 0,
        today: todayActivities,
        userActions,
        loanActions,
        logins
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch admin activities:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      'CREATE_USER': 'Created User',
      'UPDATE_USER': 'Updated User',
      'DELETE_USER': 'Deleted User',
      'APPROVE_LOAN': 'Approved Loan',
      'REJECT_LOAN': 'Rejected Loan',
      'LOGIN': 'Logged In'
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <TransactionsContainer>
        <LoadingSpinner>Loading admin activities...</LoadingSpinner>
      </TransactionsContainer>
    );
  }

  return (
    <TransactionsContainer>
      <Header>
        <PageTitle>Admin Activity Log</PageTitle>
      </Header>

      <FilterContainer>
        <FilterSelect value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="all">All Actions</option>
          <option value="CREATE_USER">User Creation</option>
          <option value="UPDATE_USER">User Updates</option>
          <option value="DELETE_USER">User Deletion</option>
          <option value="APPROVE_LOAN">Loan Approvals</option>
          <option value="REJECT_LOAN">Loan Rejections</option>
          <option value="LOGIN">Admin Logins</option>
        </FilterSelect>
        
        <FilterSelect value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </FilterSelect>
        
        {dateFilter === 'custom' && (
          <>
            <DateInput
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <DateInput
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </>
        )}
      </FilterContainer>

      <StatsCards>
        <StatCard>
          <StatNumber color="#333">{stats.total || 0}</StatNumber>
          <StatLabel>Total Activities</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#28a745">{stats.today || 0}</StatNumber>
          <StatLabel>Today's Activities</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#007bff">{stats.userActions || 0}</StatNumber>
          <StatLabel>User Management</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#ffc107">{stats.loanActions || 0}</StatNumber>
          <StatLabel>Loan Decisions</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#6c757d">{stats.logins || 0}</StatNumber>
          <StatLabel>Admin Logins</StatLabel>
        </StatCard>
      </StatsCards>

      <ActivitiesTable>
        <TableHeader>
          <div>Admin</div>
          <div>Action</div>
          <div>Description</div>
          <div>Time</div>
          <div>IP Address</div>
        </TableHeader>
        
        {activities.map((activity) => (
          <TableRow key={activity.id}>
            <AdminInfo>
              <h4>{activity.admin_name}</h4>
              <p>ID: {activity.admin_id}</p>
            </AdminInfo>
            
            <ActionBadge action={activity.action}>
              {getActionLabel(activity.action)}
            </ActionBadge>
            
            <div>
              <div style={{ fontSize: '14px', color: '#333', marginBottom: '2px' }}>
                {activity.description}
              </div>
              {activity.target_type && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Target: {activity.target_type} #{activity.target_id}
                </div>
              )}
            </div>
            
            <div>
              <div style={{ fontSize: '14px', color: '#333' }}>
                {formatDate(activity.created_at)}
              </div>
              <TimeAgo>{getTimeAgo(activity.created_at)}</TimeAgo>
            </div>
            
            <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
              {activity.ip_address || 'N/A'}
            </div>
          </TableRow>
        ))}
      </ActivitiesTable>
      
      {totalPages > 1 && (
        <Pagination>
          <PageButton 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          
          {[...Array(totalPages)].map((_, i) => (
            <PageButton
              key={i + 1}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </PageButton>
          ))}
          
          <PageButton 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </Pagination>
      )}
    </TransactionsContainer>
  );
};

export default AdminTransactions;