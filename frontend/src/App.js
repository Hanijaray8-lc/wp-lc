
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import 'react-toastify/dist/ReactToastify.css';
import History from './components/History'; // Import the History component
import LatestReport from './components/LatestReport'; // Import the LatestReport component
import ManualContact from './components/ManualContact'; // Import the Manual component
import LoginForm from './components/LoginForm';
import QR from './components/QR'; // Import the QR component
import SignupForm from './components/SignupForm';
import Navbar from './components/Navbar'; // Import the Navbar component
import XlsxContactEditor from './components/XlsxContactEditor';
import AdminUserList from './components/AdminUserList';
import ToolDashboard from './components/ToolDashboard';
import Group from './components/Group'; // Import the Group component


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Homepage" element={<QR />} />
        <Route path="/history" element={<History />} />
        <Route path="/Report" element={<LatestReport />} />
        <Route path="/manual" element={<ManualContact />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/nav" element={<Navbar />} />
        <Route path="/xl" element={<XlsxContactEditor />} />
        <Route path="/admin" element={<AdminUserList/>} />
        <Route path="/dashboard" element={<ToolDashboard/>} />
        <Route path="/group" element={<Group />} />
      </Routes>
    </Router>
  );
}

export default App;
