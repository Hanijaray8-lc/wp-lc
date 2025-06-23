import React, { useState } from 'react';
import Navbar from './Navbar';
import MessageForm from './Message';
import WhatsAppAuth from './WhatsAppAuth';

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasStartedAuth, setHasStartedAuth] = useState(false);

  const handleAuthStart = () => {
    setHasStartedAuth(true);
  };

  const handleAuthenticated = () => {
    console.log('✅ WhatsApp Authenticated!');
    setIsAuthenticated(true);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto py-6 px-4">
        {/* <h1 className="text-2xl font-semibold mb-6">Connect WhatsApp to Start</h1> */}

        {/* Step 1: Show the connect button initially */}
        {!hasStartedAuth && !isAuthenticated && (
          <div className="text-center mb-4">
            <button
              onClick={handleAuthStart}
              className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700"
            >
              Connected WhatsApp to Start
            </button>
          </div>
        )}

        {/* Step 2: Show QR code after button is clicked */}
        {hasStartedAuth && !isAuthenticated && (
          <div className="flex justify-center mt-4">
            <WhatsAppAuth onAuthenticated={handleAuthenticated} />
          </div>
        )}

        {/* Step 3: Show message form after successful auth */}
        {isAuthenticated && (
          <div className="mt-6">
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
