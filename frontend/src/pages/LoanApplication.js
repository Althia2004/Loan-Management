import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const ApplicationContainer = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 30px;
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

const AlertBox = styled.div`
  background-color: ${props => props.type === 'warning' ? '#fff3cd' : '#d4edda'};
  color: ${props => props.type === 'warning' ? '#856404' : '#155724'};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid ${props => props.type === 'warning' ? '#ffeaa7' : '#c3e6cb'};
`;

const FormCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 600;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #7c5dfa;
    box-shadow: 0 0 0 3px rgba(124, 93, 250, 0.1);
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #7c5dfa;
    box-shadow: 0 0 0 3px rgba(124, 93, 250, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #7c5dfa;
    box-shadow: 0 0 0 3px rgba(124, 93, 250, 0.1);
  }
`;

const StatusCard = styled.div`
  background: ${props => props.eligible ? '#f0fff4' : '#fef5e7'};
  border: 1px solid ${props => props.eligible ? '#9ae6b4' : '#f6ad55'};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusIcon = styled.div`
  font-size: 24px;
`;

const StatusText = styled.div`
  color: ${props => props.eligible ? '#22543d' : '#744210'};
`;

const StatusTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const SubmitButton = styled(Button)`
  background-color: ${props => props.disabled ? '#a0aec0' : '#7c5dfa'};
  color: white;
  
  &:hover {
    background-color: ${props => props.disabled ? '#a0aec0' : '#6d4fd9'};
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const ClearButton = styled(Button)`
  background-color: #e2e8f0;
  color: #4a5568;
  
  &:hover {
    background-color: #cbd5e0;
  }
`;

const LoanApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    principal_amount: '',
    duration_months: '',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/loans/apply', formData);
      navigate('/loans');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit loan application');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      principal_amount: '',
      duration_months: '',
      purpose: ''
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <ApplicationContainer>
      <PageTitle>Loan Application</PageTitle>

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

      {!user?.loan_eligibility && (
        <AlertBox type="warning">
          ⚠️ You are not yet eligible. Member has not reached the required amount to apply for a loan. Minimum capital share of ₱20,000 is required.
        </AlertBox>
      )}

      <FormCard>
        {user?.loan_eligibility && (
          <StatusCard eligible={true}>
            <StatusIcon>✅</StatusIcon>
            <StatusText eligible={true}>
              <StatusTitle>Member in Good Standing</StatusTitle>
              <div>Good Record</div>
            </StatusText>
          </StatusCard>
        )}

        {error && (
          <AlertBox type="warning">
            {error}
          </AlertBox>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Loan Amount</Label>
            <Input
              type="number"
              name="principal_amount"
              placeholder="Type here"
              value={formData.principal_amount}
              onChange={handleChange}
              required
              disabled={!user?.loan_eligibility}
            />
          </FormGroup>

          <FormGroup>
            <Label>Duration</Label>
            <Select
              name="duration_months"
              value={formData.duration_months}
              onChange={handleChange}
              required
              disabled={!user?.loan_eligibility}
            >
              <option value="">Select...</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="18">18 Months</option>
              <option value="24">24 Months</option>
              <option value="36">36 Months</option>
            </Select>
          </FormGroup>

          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label>Loan Purpose</Label>
            <TextArea
              name="purpose"
              placeholder="Ex: Business, Health, etc"
              value={formData.purpose}
              onChange={handleChange}
              required
              disabled={!user?.loan_eligibility}
            />
          </FormGroup>
        </Form>

        <ButtonGroup>
          <SubmitButton 
            type="submit" 
            disabled={!user?.loan_eligibility || loading}
            onClick={handleSubmit}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </SubmitButton>
          <ClearButton type="button" onClick={handleClear}>
            Clear
          </ClearButton>
        </ButtonGroup>
      </FormCard>
    </ApplicationContainer>
  );
};

export default LoanApplication;