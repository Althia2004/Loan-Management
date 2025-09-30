import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const RegisterCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  color: #2d3748;
  font-size: 28px;
  font-weight: 600;
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

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
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

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Title>Register</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>First Name</Label>
            <Input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Last Name</Label>
            <Input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Contact Number</Label>
            <Input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
          
          <FormGroup>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Submit'}
          </Button>
        </Form>
        
        <LinkText>
          Already have an Account? <Link to="/login">Login Here</Link>
        </LinkText>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;