import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Hardcoded admin credentials (for demonstration)
    const adminUsername = 'lcGoyee';
    const adminPassword = 'life@123';

    if (username === adminUsername && password === adminPassword) {
      alert('✅ Admin login successful!');
      // Redirect or show admin panel here
     navigate('/admin');
      
      
    } else {
      setError('❌ Invalid username or password');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: '300px',
    margin: '100px auto',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    padding: '10px',
    margin: '10px 0',
    fontSize: '16px'
  },
  button: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px'
  },
  error: {
    color: 'red',
    marginTop: '10px'
  }
};

export default AdminLogin;
