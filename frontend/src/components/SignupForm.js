import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignupForm = () => {
  const navigate = useNavigate();

const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '', // New field
});


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
const handleSignup = async (e) => {
  e.preventDefault();

  const { username, email, password, confirmPassword, companyName } = formData;

  if (!username || !email || !password || !confirmPassword || !companyName) {
    setError('All fields are required');
    alert('All fields are required');
    return;
  }

  if (password !== confirmPassword) {
    setError('Passwords do not match');
    alert('Passwords do not match');
    return;
  }

  try {
    const response = await fetch('https://wp-lc.onrender.com/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, companyName }),
    });

    const data = await response.json();

    if (response.ok) {
      setError('');
      alert('Signup successful! Redirecting to login page.');
      navigate('/login');
    } else {
      setError(data.error || 'Signup failed');
      alert(data.error || 'Signup failed');
    }
  } catch (err) {
    setError('Server error');
    alert('Server error');
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-green-600 ">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-2xl border-green-500 border-b-4 border-l-4  w-full max-w-md shadow-lg shadow-gray-200 drop-shadow-[0_0_8px_white]"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter username"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter email"
            required
          />
        </div>
        <div className="mb-4">
  <label className="block mb-1 font-semibold">Company Name</label>
  <input
    type="text"
    name="companyName"
    value={formData.companyName}
    onChange={handleChange}
    className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
    placeholder="Enter company name"
    required
  />
</div>

        <div className="mb-4 relative">
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 pr-10 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-9 right-3 text-gray-600 hover:text-gray-800"
            tabIndex={-1}
            aria-label="Toggle password visibility"
          >
            {showPassword ?  <FaEye size={20} /> : <FaEyeSlash size={20} />}
          </button>
        </div>
       <div className="mb-6 relative">
  <label className="block mb-1 font-semibold">Confirm Password</label>
  <input
    type={showConfirmPassword ? 'text' : 'password'}
    name="confirmPassword"
    value={formData.confirmPassword}
    onChange={handleChange}
    className="w-full p-2 pr-10 border rounded focus:outline-none focus:ring focus:border-blue-300"
    placeholder="Confirm password"
    required
  />
  <button
    type="button"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    className="absolute top-9 right-3 text-gray-600 hover:text-gray-800"
    tabIndex={-1}
    aria-label="Toggle confirm password visibility"
  >
    {showConfirmPassword ?  <FaEye size={20} /> : <FaEyeSlash size={20} />}
  </button>
</div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Sign Up
        </button>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-green-600 hover:underline">
            Login here
          </a>
          </p>
      </form>
    </div>
  );
};

export default SignupForm;
