import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const UsersContainer = styled.div`
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

const AddUserButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  
  &:hover {
    background: #218838;
  }
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

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-width: 300px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  min-width: 120px;
`;

const UsersTable = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 150px;
  padding: 15px 20px;
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 150px;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  align-items: center;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const UserInfo = styled.div`
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

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'REGULAR MEMBER': return '#d4edda';
      case 'MEMBER': return '#fff3cd';
      default: return '#f8d7da';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'REGULAR MEMBER': return '#155724';
      case 'MEMBER': return '#856404';
      default: return '#721c24';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const ActionButton = styled.button`
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &.edit {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.delete {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  
  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SubmitButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #5a6fd8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
`;

// Delete Modal Components
const DeleteModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DeleteModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 500px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const DeleteModalHeader = styled.div`
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid #eee;
  position: relative;
  
  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    
    &:hover {
      color: #333;
      background: #f5f5f5;
    }
  }
`;

const DeleteModalTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const UserNameDisplay = styled.div`
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
`;

const ReasonSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const DeleteModalActions = styled.div`
  display: flex;
  border-top: 1px solid #eee;
`;

const DeleteModalButton = styled.button`
  flex: 1;
  padding: 16px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &.confirm {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &.cancel {
    background: white;
    color: #666;
    border-right: 1px solid #eee;
    
    &:hover {
      background: #f8f9fa;
    }
  }
`;

const DeleteModalBody = styled.div`
  padding: 20px;
  text-align: center;
`;

const DeleteWarningIcon = styled.div`
  font-size: 48px;
  color: #dc3545;
  margin-bottom: 16px;
`;

const DeleteWarningText = styled.p`
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
  line-height: 1.5;
  
  &.strong {
    font-weight: 600;
    color: #dc3545;
  }
`;

const DeleteReasonSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  color: #333;
  margin-top: 16px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #dc3545;
    box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
  }
  
  option {
    padding: 8px;
  }
`;

const DeleteModalFooter = styled.div`
  display: flex;
  border-top: 1px solid #eee;
`;

const DeleteCancelButton = styled.button`
  flex: 1;
  padding: 16px;
  border: none;
  background: white;
  color: #666;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-right: 1px solid #eee;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const DeleteConfirmButton = styled.button`
  flex: 1;
  padding: 16px;
  border: none;
  background: #dc3545;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #c82333;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const AdminUsers = () => {
  const { getAuthHeaders } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    password: '',
    capital_share: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/admin/users', { headers });
      const data = await response.json();
      
      setUsers(data.users || []);
      
      // Calculate stats
      const regularMembers = data.users.filter(u => u.member_status === 'REGULAR MEMBER').length;
      const eligibleForLoans = data.users.filter(u => u.loan_eligibility).length;
      const totalCapitalShare = data.users.reduce((sum, u) => sum + (u.capital_share || 0), 0);
      
      setStats({
        total: data.users.length,
        regularMembers,
        eligibleForLoans,
        totalCapitalShare
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    console.log('Add User button clicked');
    setModalMode('add');
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      contact_number: '',
      password: '',
      capital_share: ''
    });
    setSelectedUser(null);
    setShowModal(true);
    console.log('Modal should be open, showModal set to:', true);
  };

  const handleEditUser = (user) => {
    setModalMode('edit');
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      contact_number: user.contact_number,
      password: '',
      capital_share: user.capital_share
    });
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    setUserToDelete(user);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    const hasActiveLoans = userToDelete.active_loans > 0;
    
    // If user has active loans and no reason is selected, show error
    if (hasActiveLoans && !deleteReason) {
      alert('Please select a reason for deletion when the user has active loans.');
      return;
    }
    
    const reason = hasActiveLoans ? deleteReason : 'no_active_loans';
    
    try {
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          reason: reason,
          confirmed_with_active_loans: hasActiveLoans
        })
      });
      
      const result = await response.json();
      
      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);
      console.log('Delete result:', result);
      
      if (response.ok) {
        // Close modal and reset state
        setShowDeleteModal(false);
        setUserToDelete(null);
        setDeleteReason('');
        fetchUsers(); // Refresh the list
        alert(`User "${userToDelete.first_name} ${userToDelete.last_name}" has been deleted successfully.`);
      } else {
        console.error('Delete failed:', result);
        alert(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Network error while deleting user:', error);
      alert(`Network error: ${error.message || 'Failed to delete user'}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted, modalMode:', modalMode);
    console.log('Form data:', formData);
    
    try {
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      };
      
      const url = modalMode === 'add' ? '/api/admin/users' : `/api/admin/users/${selectedUser.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      
      console.log('Making request to:', url, 'with method:', method);
      console.log('Headers:', headers);
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (response.ok) {
        console.log('Success! Closing modal and refreshing list');
        setShowModal(false);
        fetchUsers(); // Refresh the list
      } else {
        console.error('Request failed:', responseData);
        alert(`Failed to ${modalMode} user: ${responseData.message}`);
      }
    } catch (error) {
      console.error(`Failed to ${modalMode} user:`, error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.member_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  if (loading) {
    return (
      <UsersContainer>
        <LoadingSpinner>Loading users...</LoadingSpinner>
      </UsersContainer>
    );
  }

  return (
    <UsersContainer>
      <Header>
        <PageTitle>User Management</PageTitle>
        <AddUserButton onClick={handleAddUser}>
          Add New User
        </AddUserButton>
      </Header>

      <StatsCards>
        <StatCard>
          <StatNumber color="#333">{stats.total || 0}</StatNumber>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#28a745">{stats.regularMembers || 0}</StatNumber>
          <StatLabel>Regular Members</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#007bff">{stats.eligibleForLoans || 0}</StatNumber>
          <StatLabel>Loan Eligible</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#6f42c1">{formatCurrency(stats.totalCapitalShare || 0)}</StatNumber>
          <StatLabel>Total Capital Share</StatLabel>
        </StatCard>
      </StatsCards>

      <FilterContainer>
        <SearchInput
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="MEMBER">Member</option>
          <option value="REGULAR MEMBER">Regular Member</option>
        </FilterSelect>
      </FilterContainer>

      <UsersTable>
        <TableHeader>
          <div>Name</div>
          <div>Email</div>
          <div>Contact</div>
          <div>Capital Share</div>
          <div>Status</div>
          <div>Joined Date</div>
          <div>Actions</div>
        </TableHeader>
        
        {filteredUsers.map((user) => (
          <TableRow key={user.id}>
            <UserInfo>
              <h4>{user.first_name} {user.last_name}</h4>
              <p>ID: {user.user_id}</p>
            </UserInfo>
            
            <div>{user.email}</div>
            
            <div>{user.contact_number}</div>
            
            <div>{formatCurrency(user.capital_share)}</div>
            
            <StatusBadge status={user.member_status}>
              {user.member_status}
            </StatusBadge>
            
            <div>{formatDate(user.created_at)}</div>
            
            <ActionButtons>
              <ActionButton 
                className="edit"
                onClick={() => handleEditUser(user)}
              >
                Edit
              </ActionButton>
              <ActionButton 
                className="delete"
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </ActionButton>
            </ActionButtons>
          </TableRow>
        ))}
      </UsersTable>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'add' ? 'Add New User' : 'Edit User'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>First Name</Label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Contact Number</Label>
                <Input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Password {modalMode === 'edit' && '(leave empty to keep current)'}</Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={modalMode === 'add'}
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Capital Share</Label>
                <Input
                  type="number"
                  name="capital_share"
                  value={formData.capital_share}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Member Status (Auto-calculated)</Label>
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px',
                  color: '#666'
                }}>
                  {parseFloat(formData.capital_share || 0) >= 20000 
                    ? 'REGULAR MEMBER (Loan Eligible)' 
                    : 'MEMBER (Not Loan Eligible)'
                  }
                </div>
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Capital Share ≥ ₱20,000 = Regular Member (Loan Eligible)
                  <br />
                  Capital Share &lt; ₱20,000 = Member (Not Loan Eligible)
                </small>
              </FormGroup>
              
              <SubmitButton type="submit">
                {modalMode === 'add' ? 'Add User' : 'Update User'}
              </SubmitButton>
            </Form>
          </ModalContent>
        </Modal>
      )}
      
      {showDeleteModal && userToDelete && (
        <DeleteModal>
          <DeleteModalContent>
            <DeleteModalHeader>
              <DeleteModalTitle>Delete User</DeleteModalTitle>
              <button 
                className="close-button" 
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </DeleteModalHeader>
            
            <DeleteModalBody>
              <DeleteWarningIcon>⚠️</DeleteWarningIcon>
              <DeleteWarningText>
                Are you sure you want to delete <strong>{userToDelete.first_name} {userToDelete.last_name}</strong>?
              </DeleteWarningText>
              
              {userToDelete.active_loans > 0 && (
                <>
                  <DeleteWarningText style={{ color: '#dc3545', fontWeight: 'bold' }}>
                    This user has {userToDelete.active_loans} active loan(s). 
                    Please specify a reason for deletion:
                  </DeleteWarningText>
                  
                  <DeleteReasonSelect 
                    value={deleteReason} 
                    onChange={(e) => setDeleteReason(e.target.value)}
                  >
                    <option value="">Select a reason...</option>
                    <option value="expired">Expired</option>
                    <option value="personal">Personal</option>
                  </DeleteReasonSelect>
                </>
              )}
            </DeleteModalBody>
            
            <DeleteModalFooter>
              <DeleteCancelButton onClick={() => setShowDeleteModal(false)}>
                Cancel
              </DeleteCancelButton>
              <DeleteConfirmButton onClick={confirmDelete}>
                Delete User
              </DeleteConfirmButton>
            </DeleteModalFooter>
          </DeleteModalContent>
        </DeleteModal>
      )}
    </UsersContainer>
  );
};

export default AdminUsers;