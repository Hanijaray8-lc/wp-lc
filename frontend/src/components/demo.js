import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WhatsAppAuth from './components/WhatsAppAuth';
import BulkMessageForm from './components/BulkMessageForm';
import { ToastContainer } from 'react-toastify';
import logo from './assets/icon.jpg'; // Ensure you have a logo image in the assets folder
import 'react-toastify/dist/ReactToastify.css';
import History from './components/History'; // Import the History component
import LatestReport from './components/LatestReport'; // Import the LatestReport component
function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-md">
  <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between px-6 py-4 space-y-4 lg:space-y-0">
    
    {/* Logo + Title */}
    <div className="flex items-center gap-4">
      {/* Logo (Replace src with your image path) */}
  <img
  src={logo}
  alt="Logo"
  className="h-12 w-12 z-20 rounded-full object-cover bg-green-700 p-1 drop-shadow-[0_0_8px_white]"
/>


      <div>
        <h1 className="text-2xl lg:text-3xl text-white font-bold tracking-tight">
          WhatsApp Bulk Sender
        </h1>
        <p className="text-sm text-green-100">Send messages to multiple contacts efficiently</p>
      </div>
    </div>

    {/* Optional nav or button (extendable) */}
    <nav className="text-sm space-x-4">
      <a href="#" className="hover:underline">Auto</a>
      <a href="#" className="hover:underline">Manual</a>
    </nav>

  </div>
</header>


      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WhatsApp Auth Section */}
          <div className="bg-green-600 p-6 rounded-lg shadow-md">
            <h2 className="text-xl text-white font-semibold mb-4">WhatsApp Authentication</h2>
            <WhatsAppAuth onAuthenticated={(status) => setIsAuthenticated(status)} />
          </div>

          {/* Bulk Message Section */}
          <div className="bg-green-600 p-6 rounded-lg shadow-md">
            <h2 className="text-xl text-white font-semibold mb-4">Message Configuration</h2>
            {isAuthenticated ? (
              <BulkMessageForm />
            ) : (
              <div className="text-center py-8 shadow-md shadow-gray-200 bg-white rounded-lg">
                <p className="text-green-700 font-medium">
                  Please authenticate with WhatsApp first to send messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/history" element={<History />} />
        <Route path="/Report" element={<LatestReport />} />
        {/* You can add more routes like history page, etc */}
      </Routes>
    </Router>
  );
}

export default App;
