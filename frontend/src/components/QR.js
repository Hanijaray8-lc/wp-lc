import React, { useState } from 'react';
import WhatsAppAuth from './WhatsAppAuth';
import BulkMessageForm from './BulkMessageForm';
import Header from './Header';
import { ToastContainer } from 'react-toastify';

function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WhatsApp Auth Section */}
          <div className="bg-green-600 p-6 rounded-lg shadow-md">
            <h2 className="text-xl text-white font-semibold mb-4">WhatsApp Authentication</h2>
            <WhatsAppAuth onAuthenticated={setIsAuthenticated} />
          </div>

          {/* Bulk Message Section */}
          <div className="bg-green-600 p-6 rounded-lg shadow-md">
            <h2 className="text-xl text-white font-semibold mb-4">Message Configuration</h2>
            {isAuthenticated ? (
              <BulkMessageForm />
            ) : (
              <div className="text-center py-8 bg-white shadow-inner rounded-lg">
                <p className="text-green-700 font-medium">
                  Please authenticate with WhatsApp first to send messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
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

export default HomePage;
