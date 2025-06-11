import React from 'react';
import WhatsAppAuth from './WhatsAppAuth';
import BulkMessageForm from './BulkMessageForm';
import { ToastContainer } from 'react-toastify';
import Header from './Header'; // Import the Header component
function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
        <Header />
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
export default HomePage;