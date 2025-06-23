import React, { useState } from 'react';
import Header from './Header';
import MessageForm from './MessageForm';
import WhatsAppAuth from './WhatsAppAuth';
import Navbar from '../../components/Navbar'; // Import the Navbar component

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasStartedAuth, setHasStartedAuth] = useState(false);
  const [authComplete, setAuthComplete] = useState(false); // ✅ track countdown completion

  const handleAuthStart = () => {
    setHasStartedAuth(true);
  };

  const handleAuthenticated = () => {
    console.log('✅ WhatsApp Authenticated!');
    setIsAuthenticated(true);
    // Wait for WhatsAppAuth countdown to finish before showing form
    setTimeout(() => {
      setAuthComplete(true); // ✅ after 10s countdown (WhatsAppAuth), show form
    }, 2000);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
<Navbar/>

      <main className="flex-grow w-full mx-auto py-6 px-4">
        <h1 className="text-2xl font-semibold mb-6">Compose and Send Bulk Message</h1>

        {/* Step 1: Show the connect button initially */}
        {!hasStartedAuth && !isAuthenticated && (
          <div className="text-center mb-4">
            <button
              onClick={handleAuthStart}
              className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700"
            >
              Connect WhatsApp to Start
            </button>
          </div>
        )}

        {/* Step 2: Show WhatsApp auth (even if already authenticated) */}
        {hasStartedAuth && (!isAuthenticated || (isAuthenticated && !authComplete)) && (
          <div className="flex justify-center mt-4">
            <WhatsAppAuth onAuthenticated={handleAuthenticated} />
          </div>
        )}

        {/* Step 3: Show form only after auth AND countdown complete */}
        {isAuthenticated && authComplete && (
          <div className="mt-6 w-full">
            <MessageForm />
          </div>
        )}
      </main>

      <footer className="bg-green-700 text-white text-center py-3 text-sm">
        © 2025 LC WA Bulk Messenger. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
