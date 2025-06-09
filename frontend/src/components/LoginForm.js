import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'LifeChangers' && password === 'LcUser@1996') {
      setError('');
      navigate('/Homepage');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-600">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
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
  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
</button>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
