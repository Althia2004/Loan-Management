import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const SidebarContainer = styled.div`
  width: 250px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  padding: 30px 20px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #667eea;
  font-weight: bold;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 15px 25px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 16px;
  gap: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    padding-left: 30px;
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    border-left: 4px solid white;
    padding-left: 21px;
  }

  span {
    font-size: 20px;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  padding: 15px 25px;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 16px;
  gap: 12px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  margin-top: auto;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    padding-left: 30px;
  }

  span {
    font-size: 20px;
  }
`;

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarContainer>
      <Logo>
        <LogoIcon>$</LogoIcon>
        Money Glitch
      </Logo>
      <Nav>
        <StyledNavLink to="/dashboard">
          <span></span>
          My Dashboard
        </StyledNavLink>
        <StyledNavLink to="/loan-application">
          <span></span>
          Apply for Loan
        </StyledNavLink>
        <StyledNavLink to="/loans">
          <span></span>
          My Loans
        </StyledNavLink>
        <StyledNavLink to="/payments">
          <span></span>
          Pay Loan
        </StyledNavLink>
        <StyledNavLink to="/savings">
          <span></span>
          My Savings
        </StyledNavLink>
        <StyledNavLink to="/transactions">
          <span></span>
          My Transactions
        </StyledNavLink>
        <StyledNavLink to="/accounts">
          <span></span>
          My Profile
        </StyledNavLink>
      </Nav>
      <LogoutButton onClick={handleLogout}>
        <span></span>
        Logout
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;


