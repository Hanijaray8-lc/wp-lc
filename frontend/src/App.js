
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import 'react-toastify/dist/ReactToastify.css';
import History from './components/History'; // Import the History component
import LatestReport from './components/LatestReport'; // Import the LatestReport component
import ManualContact from './components/ManualContact'; // Import the Manual component
import Header from './components/Header'; // Import the Navbar component
import LoginForm from './components/LoginForm';
import QR from './components/QR'; // Import the QR component


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Homepage" element={<QR />} />
        <Route path="/history" element={<History />} />
        <Route path="/Report" element={<LatestReport />} />
        <Route path="/manual" element={<ManualContact />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;
