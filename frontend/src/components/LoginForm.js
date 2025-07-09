import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setError('');
      // Store companyName, username, and sessionId in localStorage
      localStorage.setItem('companyName', data.companyName);
      localStorage.setItem('username', data.username);
      localStorage.setItem('sessionId', data.sessionId); // <-- Add this line
      alert('Login successful! Redirecting to homepage.');
      navigate('/Homepage');
    } else {
      setError(data.error || 'Login failed');
    }
  } catch (err) {
    setError('Server error');
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-green-600">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl border-green-500 border-b-4 border-l-4 w-full max-w-md shadow-lg shadow-gray-200 drop-shadow-[0_0_25px_white]"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter username"
            required
          />
        </div>

        <div className="mb-6 relative">
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 pr-10 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter password"
            required
          />
         <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute top-9 right-3 text-gray-600 hover:text-gray-800 focus:outline-none"
  tabIndex={-1}
  aria-label={showPassword ? 'Hide password' : 'Show password'}
>
  {showPassword ?  <FaEye size={20} /> : <FaEyeSlash size={20} />}
</button>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Login
        </button>
       <br />
        <br />
        <br />
          <button
          onClick={() => navigate('/help')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          Contact Admin for Register
        </button>
      </form>
      
      {/* Footer for LifeChangers + Admin Access */}
      <div className="absolute bottom-4 flex items-center gap-2 text-white text-sm hover:scale-105 transition">
        <span>Life Changers Ind</span>
      <Link
  to="/alog"
  title="A"
  className="text-2xl hover:underline"
>
  🛡️
</Link>

        </div>
    </div>
  );
};

export default LoginForm;