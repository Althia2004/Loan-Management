import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #2d3748;
  font-size: 28px;
  font-weight: 600;
`;

const LoginTypeToggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: 10px 20px;
  border: none;
  background: ${props => props.active ? '#7c5dfa' : '#f7fafc'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#6d4fd9' : '#edf2f7'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  color: #4a5568;
  font-weight: 600;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #7c5dfa;
    box-shadow: 0 0 0 3px rgba(124, 93, 250, 0.1);
  }
`;

const Button = styled.button`
  background-color: #7c5dfa;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #6d4fd9;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  text-align: center;
  margin-bottom: 20px;
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 20px;
  color: #718096;
  
  a {
    color: #7c5dfa;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login: userLogin } = useAuth();
  const { login: adminLogin } = useAdminAuth();
  const navigate = useNavigate();

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

    let result;
    
    if (loginType === 'admin') {
      // Use email for admin login (supports both username and email)
      result = await adminLogin(formData.email, formData.password);
      if (result.success) {
        navigate('/admin/dashboard');
      }
    } else {
      // User login
      result = await userLogin(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    }
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>🏦 CoCoLoan</Title>
        
        <LoginTypeToggle>
          <ToggleButton 
            active={loginType === 'user'} 
            onClick={() => setLoginType('user')}
            type="button"
          >
            User Login
          </ToggleButton>
          <ToggleButton 
            active={loginType === 'admin'} 
            onClick={() => setLoginType('admin')}
            type="button"
          >
            Admin Login
          </ToggleButton>
        </LoginTypeToggle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{loginType === 'admin' ? 'Username or Email' : 'Email'}</Label>
            <Input
              type={loginType === 'admin' ? 'text' : 'email'}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={loginType === 'admin' ? 'Enter username or email' : 'Enter your email'}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;