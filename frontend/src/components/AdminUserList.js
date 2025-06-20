import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessPermissions, setAccessPermissions] = useState({
    homepage: false,
    history: false,
    report: false,
    manual: false,
    xl: false,
    dashboard: false,
    group: false,
    contact: false ,// <-- Add this line
   auto: false,
    extractor: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://wp-lc.onrender.com/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setError('Failed to fetch users');
        }
      })
      .catch(() => setError('Server error'));
  }, []);

  const handleAccept = async (userId) => {
    setLoadingUserId(userId);
    try {
      await fetch(`https://wp-lc.onrender.com/api/users/${userId}/activate`, { method: 'PATCH' });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: true } : u));
      alert('User accepted successfully!');
    } catch (err) {
      alert('Failed to accept user.');
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleReject = async (userId) => {
    setLoadingUserId(userId);
    try {
      await fetch(`https://wp-lc.onrender.com/api/users/${userId}/deactivate`, { method: 'PATCH' });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: false } : u));
      alert('User rejected successfully!');
    } catch (err) {
      alert('Failed to reject user.');
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    // Initialize permissions based on existing user data or default to false
    setAccessPermissions(user.accessPermissions || {
      homepage: false,
      history: false,
      report: false,
      manual: false,
      xl: false,
      dashboard: false,
      group: false,
      contact: false, // <-- Add this line
      auto: false,
      extractor: false
    });
    setShowAccessModal(true);
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setAccessPermissions(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const savePermissions = async () => {
    try {
      const response = await fetch(`https://wp-lc.onrender.com/api/users/${selectedUser._id}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessPermissions }),
      });

      if (response.ok) {
        alert('Permissions updated successfully!');
        setUsers(users.map(u => 
          u._id === selectedUser._id ? { ...u, accessPermissions } : u
        ));
        setShowAccessModal(false);
      } else {
        alert('Failed to update permissions');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header with Signup button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Registered Users</h1>
        <button
          onClick={() => navigate('/signup')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          Signup
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded shadow">
          <thead>
            <tr className="bg-green-600 text-white text-center">
              <th className="py-2 px-4 border-b">Username</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Company Name</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="text-center hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{user.username}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.companyName}</td>
                <td className="py-2 px-4 border-b">
                  {user.isActive ? (
                    <span className="text-green-600 font-semibold">Active</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Inactive</span>
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handleView(user)}
                      className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleAccept(user._id)}
                      className={`px-3 py-1 text-sm rounded text-white 
                        ${loadingUserId === user._id ? 'bg-green-800' :
                        user.isActive ? 'bg-green-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                      disabled={loadingUserId === user._id || user.isActive}
                    >
                      {user.isActive ? 'Accepted' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleReject(user._id)}
                      className={`px-3 py-1 text-sm rounded text-white 
                        ${loadingUserId === user._id ? 'bg-red-800' :
                        !user.isActive ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                      disabled={loadingUserId === user._id || !user.isActive}
                    >
                      {!user.isActive ? 'Rejected' : 'Reject'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Access Control Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Access Control for {selectedUser?.username}</h2>
            <div className="space-y-3 mb-6">
              {Object.entries(accessPermissions).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    name={key}
                    checked={value}
                    onChange={handlePermissionChange}
                    className="mr-2"
                  />
                  <label htmlFor={key} className="capitalize">
                    {key === 'xl' ? 'Excel Editor' : key === 'report' ? 'Reports' : key === 'contact' ? 'Contact' : key === 'auto' ? 'Auto Responder' : key === 'extractor' ? 'Extractor' : key}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAccessModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={savePermissions}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;