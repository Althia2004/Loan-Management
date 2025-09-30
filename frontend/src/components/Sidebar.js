import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  z-index: 1000;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  font-size: 24px;
  font-weight: bold;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #667eea;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 8px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

const NavIcon = styled.span`
  margin-right: 12px;
  font-size: 20px;
`;

const LogoutButton = styled.button`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/savings', icon: '💰', label: 'Savings' },
    { path: '/loans', icon: '💳', label: 'Loans' },
    { path: '/transactions', icon: '📊', label: 'Transactions' },
    { path: '/accounts', icon: '👤', label: 'Accounts' },
  ];

  return (
    <SidebarContainer>
      <Logo>
        <LogoIcon>$</LogoIcon>
        MoneyGlitch
      </Logo>
      
      <NavList>
        {navItems.map((item) => (
          <NavItem key={item.path}>
            <StyledNavLink to={item.path}>
              <NavIcon>{item.icon}</NavIcon>
              {item.label}
            </StyledNavLink>
          </NavItem>
        ))}
      </NavList>
      
      <LogoutButton onClick={handleLogout}>
        Logout
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;