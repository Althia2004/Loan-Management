import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 70px; /* Account for header height */
  width: 250px;
  height: calc(100vh - 70px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  z-index: 999;
  overflow-y: auto;
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
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-weight: bold;
  margin-right: 12px;
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

const AdminSidebar = () => {
  const navItems = [
    { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/admin/loans', icon: '💳', label: 'Loans' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/transactions', icon: '📊', label: 'Activity Log' },
    { path: '/admin/savings', icon: '💰', label: 'Savings' },
    { path: '/admin/reports', icon: '📈', label: 'Reports' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <SidebarContainer>
      <Logo>
        <LogoIcon>💰</LogoIcon>
        Money Glitch
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
    </SidebarContainer>
  );
};

export default AdminSidebar;