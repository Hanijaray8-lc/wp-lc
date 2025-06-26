import { useEffect, useState } from 'react';
import Header from './Header'; // Make sure your Header component is in './Header.jsx'

export default function CampaignHistory() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for the modal: if it's open and what message it contains
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const MESSAGE_PREVIEW_LENGTH = 100; // Define how many characters to show initially

  useEffect(() => {
    const companyName = localStorage.getItem('companyName');
    fetch(`https://wp-lc.onrender.com/api/whatsapp/campaign-history?companyName=${encodeURIComponent(companyName)}`)
      .then(res => res.json())
      .then(data => {
        setCampaigns(data.campaigns);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load campaign history.");
        setLoading(false);
      });
  }, []);

  // Function to open the modal with a specific message
  const openMessageModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeMessageModal = () => {
    setIsModalOpen(false);
    setModalMessage(''); // Clear the message when closing
  };

  // Inline MessageModal Component
  const MessageModal = ({ message, onClose }) => {
    if (!message) return null; // Don't render if no message is provided

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
          <h3 className="text-xl font-bold mb-4 text-green-700">Full Message</h3>
          {/* Using whitespace-pre-wrap to preserve formatting like line breaks */}
          <p className="whitespace-pre-wrap text-gray-800 text-base mb-6">{message}</p>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-semibold"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center py-10 text-blue-500 text-lg">Loading campaign history...</div>;
  if (error) return <div className="text-center py-10 text-red-500 text-lg">{error}</div>;

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-3xl font-extrabold mb-6 text-green-800 flex items-center justify-center">
            📜 Campaign History
          </h2>

          {campaigns.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">No campaign history found. Start a new campaign!</p>
          ) : (
            <div className="space-y-6">
              {campaigns.map((camp, index) => {
                const needsShowMore = camp.message.length > MESSAGE_PREVIEW_LENGTH;
                const displayMessagePreview = needsShowMore
                  ? `${camp.message.substring(0, MESSAGE_PREVIEW_LENGTH)}...`
                  : camp.message;

                return (
                  <div key={index} className="border border-green-200 p-5 rounded-lg shadow-md bg-green-50 hover:shadow-lg transition-shadow duration-300">
                    <p className="text-sm text-gray-500 mb-2">
                      <strong className="text-green-700">Date:</strong> {new Date(camp.date).toLocaleString()}
                    </p>
                    <p className="text-gray-800 mb-2">
                      <strong className="text-green-700">Message:</strong> {displayMessagePreview}
                      {needsShowMore && (
                        <button
                          onClick={() => openMessageModal(camp.message)}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
                        >
                          Show More
                        </button>
                      )}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700 text-sm mb-2">
                      <p><strong className="text-green-700">Total Contacts:</strong> {camp.totalContacts}</p>
                      <p><strong className="text-green-700">Successful:</strong> <span className="text-green-600 font-semibold">{camp.successful}</span></p>
                      <p><strong className="text-green-700">Failed:</strong> <span className="text-red-600 font-semibold">{camp.failed}</span></p>
                    </div>

                    {camp.media && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong className="text-green-700">Media:</strong> {camp.media.name} ({(camp.media.size / 1024).toFixed(2)} KB)
                      </p>
                    )}

                    {camp.failedNumbers?.length > 0 && (
                      <details className="mt-3 bg-red-50 p-3 rounded-md border border-red-200">
                        <summary className="cursor-pointer text-red-700 font-semibold text-sm hover:text-red-800">
                          View Failed Numbers ({camp.failedNumbers.length})
                        </summary>
                        <ul className="list-disc list-inside text-xs text-red-600 mt-2 max-h-24 overflow-y-auto custom-scrollbar">
                          {camp.failedNumbers.map((num, idx) => (
                            <li key={idx}>{num}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Message Modal rendered here */}
      {isModalOpen && (
        <MessageModal
          message={modalMessage}
          onClose={closeMessageModal}
        />
      )}
    </div>
  );
}