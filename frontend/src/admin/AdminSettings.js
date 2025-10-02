import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAdminAuth } from '../contexts/AdminAuthContext';

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

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  rows: 3;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  background: ${props => props.variant === 'danger' ? '#e74c3c' : '#3498db'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-right: 10px;

  &:hover {
    background: ${props => props.variant === 'danger' ? '#c0392b' : '#2980b9'};
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const ImagePreview = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #f8f9fa;
  border: 3px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  overflow: hidden;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImagePlaceholder = styled.div`
  color: #7f8c8d;
  font-size: 40px;
  font-weight: bold;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 8px 16px;
  background: #95a5a6;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s ease;

  &:hover {
    background: #7f8c8d;
  }
`;

const AdminList = styled.div`
  margin-top: 20px;
`;

const AdminItem = styled.div`
  padding: 15px;
  border: 1px solid #ecf0f1;
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
`;

const AdminInfo = styled.div`
  flex: 1;
`;

const AdminName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
`;

const AdminUsername = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const Message = styled.div`
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  background: ${props => props.type === 'error' ? '#fee' : '#e8f5e8'};
  color: ${props => props.type === 'error' ? '#c0392b' : '#27ae60'};
  border: 1px solid ${props => props.type === 'error' ? '#fcc' : '#c8e6c9'};
`;

const AdminSettings = () => {
  const { admin, getAuthHeaders, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [adminList, setAdminList] = useState([]);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    image: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // New admin form state
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (admin) {
      const fullName = admin.name || 
        (admin.first_name && admin.last_name ? `${admin.first_name} ${admin.last_name}` : '');
      
      setProfileForm(prev => ({
        ...prev,
        name: fullName,
        email: admin.email || ''
      }));
      fetchAdminList();
    }
  }, [admin]);

  const fetchAdminList = async () => {
    if (!admin) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/settings/admins', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminList(data.admins || []);
      }
    } catch (error) {
      console.error('Error fetching admin list:', error);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileForm(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', profileForm.name);
      formData.append('email', profileForm.email);
      if (profileForm.image) {
        formData.append('image', profileForm.image);
      }
      if (profileForm.currentPassword) {
        formData.append('currentPassword', profileForm.currentPassword);
      }
      if (profileForm.newPassword) {
        formData.append('newPassword', profileForm.newPassword);
      }

      const response = await fetch('http://localhost:5000/api/admin/settings/profile', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          // Don't set Content-Type for FormData
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Profile updated successfully', 'success');
        setProfileForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          image: null
        }));
      } else {
        showMessage(data.message || 'Error updating profile', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAdminSubmit = async (e) => {
    e.preventDefault();
    
    if (newAdminForm.password !== newAdminForm.confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/settings/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          name: newAdminForm.name,
          username: newAdminForm.username,
          email: newAdminForm.email,
          password: newAdminForm.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('New admin account created successfully', 'success');
        setNewAdminForm({
          name: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        fetchAdminList();
      } else {
        showMessage(data.message || 'Error creating admin account', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin account?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/settings/admin/${adminId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Admin account deleted successfully', 'success');
        fetchAdminList();
      } else {
        showMessage(data.message || 'Error deleting admin account', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  // Show loading state if admin data is not yet available
  if (authLoading || !admin) {
    return (
      <Container>
        <Header>
          <PageTitle>Settings</PageTitle>
          <Subtitle>Loading...</Subtitle>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <PageTitle>Settings</PageTitle>
        <Subtitle>Manage your profile and admin accounts</Subtitle>
      </Header>

      {message && (
        <Message type={messageType}>
          {message}
        </Message>
      )}

      <SettingsGrid>
        {/* Profile Settings */}
        <SettingsCard>
          <CardTitle>Profile Settings</CardTitle>
          <form onSubmit={handleProfileSubmit}>
            <FormGroup>
              <Label>Profile Image</Label>
              <ImagePreview>
                {previewImage || (admin && admin.image_url) ? (
                  <ProfileImage src={previewImage || admin.image_url} alt="Profile" />
                ) : (
                  <ImagePlaceholder>
                    {admin && admin.name ? admin.name.charAt(0).toUpperCase() : 
                     admin && admin.first_name ? admin.first_name.charAt(0).toUpperCase() : 'A'}
                  </ImagePlaceholder>
                )}
              </ImagePreview>
              <FileInputLabel htmlFor="profileImage">
                Choose Image
              </FileInputLabel>
              <FileInput
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Current Password (required to change password)</Label>
              <Input
                type="password"
                value={profileForm.currentPassword}
                onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
            </FormGroup>

            <FormGroup>
              <Label>New Password (leave blank to keep current)</Label>
              <Input
                type="password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </FormGroup>

            <FormGroup>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={profileForm.confirmPassword}
                onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </FormGroup>

            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </SettingsCard>

        {/* Admin Management */}
        <SettingsCard>
          <CardTitle>Admin Management</CardTitle>
          
          <form onSubmit={handleNewAdminSubmit}>
            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={newAdminForm.name}
                onChange={(e) => setNewAdminForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Username</Label>
              <Input
                type="text"
                value={newAdminForm.username}
                onChange={(e) => setNewAdminForm(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={newAdminForm.email}
                onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                value={newAdminForm.password}
                onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={newAdminForm.confirmPassword}
                onChange={(e) => setNewAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </FormGroup>

            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Admin Account'}
            </Button>
          </form>

          <AdminList>
            <h4 style={{ color: '#2c3e50', marginBottom: '15px' }}>Current Admins</h4>
            {adminList.map((adminItem) => (
              <AdminItem key={adminItem.id}>
                <AdminInfo>
                  <AdminName>{adminItem.name}</AdminName>
                  <AdminUsername>@{adminItem.username} • {adminItem.email}</AdminUsername>
                </AdminInfo>
                {adminItem.id !== admin?.id && (
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteAdmin(adminItem.id)}
                  >
                    Delete
                  </Button>
                )}
              </AdminItem>
            ))}
          </AdminList>
        </SettingsCard>
      </SettingsGrid>
    </Container>
  );
};

export default AdminSettings;