import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import History from './components/History';
import LatestReport from './components/LatestReport';
import ManualContact from './components/ManualContact';
import LoginForm from './components/LoginForm';
import QR from './components/QR';
import SignupForm from './components/SignupForm';
import Services from './components/Services';
import XlsxContactEditor from './components/XlsxContactEditor';
import AdminUserList from './components/AdminUserList';
import ToolDashboard from './components/ToolDashboard';
import Group from './components/Group';
import Contact from './components/Contact';
import Navbar from './components/Navbar';
import Extractor from './components/Extractor';
import AutoResponderRule from './components/AutoResponderRules';
import Message from './components/Message'; 
import HomePage from './components/HomePage';
import MessageProgress from './components/MessageProgress';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/Homepage" element={<ProtectedRoute permission="homepage"><QR /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute permission="history"><History /></ProtectedRoute>} />
          <Route path="/Report" element={<ProtectedRoute permission="report"><LatestReport /></ProtectedRoute>} />
          <Route path="/manual" element={<ProtectedRoute permission="manual"><ManualContact /></ProtectedRoute>} />
          <Route path="/" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/services" element={<Services />} />
          <Route path="/xl" element={<ProtectedRoute permission="xl"><XlsxContactEditor /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminUserList/>} />
          <Route path="/dashboard" element={<ProtectedRoute permission="dashboard"><ToolDashboard/></ProtectedRoute>} />
          <Route path="/group" element={<ProtectedRoute permission="group"><Group /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute permission="contact"><Contact /></ProtectedRoute>} />
          <Route path="/nav" element={<Navbar />} />
          <Route path="/auto" element={<ProtectedRoute permission="auto"><AutoResponderRule/></ProtectedRoute>} />
          <Route path='/extractor' element={<ProtectedRoute permission="extractor"><Extractor /></ProtectedRoute>} />
          <Route path="/messageform" element={<Message />} />
          <Route path="/messageprogress" element={<MessageProgress />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

// ProtectedRoute component
function ProtectedRoute({ children, permission }) {
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const username = localStorage.getItem('username');
        if (!username) {
          toast.error('Please login first');
          navigate('/');
          return;
        }

        const response = await fetch(`https://wp-lc.onrender.com/api/users/${username}/permissions`);
        const data = await response.json();
        
        if (response.ok && data.accessPermissions && data.accessPermissions[permission]) {
          setHasPermission(true);
        } else {
          toast.error('You do not have permission to access this page');
          setHasPermission(false);
        }
      } catch (err) {
        toast.error('Error checking permissions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [navigate, permission]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="mb-4">You don't have permission to view this page.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default App;