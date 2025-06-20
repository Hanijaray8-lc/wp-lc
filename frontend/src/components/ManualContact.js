import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';

const SendBulkForm = () => {
  const [sessionId, setSessionId] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [message, setMessage] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    // Auto-fetch sessionId from localStorage
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) setSessionId(storedSessionId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message || !phoneNumbers.trim() || !sessionId.trim()) {
      alert('Session ID, phone numbers, and message are required.');
      return;
    }

    const formData = new FormData();
    formData.append('message', message);
    formData.append('phoneNumbers', phoneNumbers);
    formData.append('sessionId', sessionId);
    if (mediaFile) formData.append('media', mediaFile);

    // Add companyName from localStorage
    const companyName = localStorage.getItem('companyName');
    if (companyName) {
      formData.append('companyName', companyName);
    }

    try {
      setIsSending(true);
      const response = await axios.post('https://wp-lc.onrender.com/api/whatsapp/send-bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReport(response.data.report);
    } catch (error) {
      console.error('❌ Error sending messages:', error.response?.data || error.message);
      alert('Failed to send messages. Check console for details.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-green-600 p-6 flex justify-center items-start">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Send Bulk Messages</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* <div>
              <label className="block text-sm font-medium text-green-800">Session ID</label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID"
                required
                className="w-full border border-green-300 rounded-md p-2 mt-1 text-sm"
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-green-800">Phone Numbers</label>
              <textarea
                rows={3}
                className="w-full border border-green-300 rounded-md p-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. 9123456789, 919876543210"
                value={phoneNumbers}
                onChange={(e) => setPhoneNumbers(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-800">Message</label>
              <textarea
                rows={4}
                className="w-full border border-green-300 rounded-md p-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-800">Optional Media File</label>
              <input
                type="file"
                accept="image/*,video/*,application/pdf"
                onChange={(e) => setMediaFile(e.target.files[0])}
                className="mt-1 text-sm text-green-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              {isSending ? 'Sending...' : 'Send Messages'}
            </button>
          </form>

          {report && (
            <div className="mt-6 bg-green-100 p-4 rounded-md text-sm text-green-900">
              <h3 className="text-lg font-semibold mb-2">📊 Report</h3>
              <p>Total: {report.total}</p>
              <p>✅ Sent: {report.success}</p>
              <p>❌ Failed: {report.failed}</p>
              {report.failedNumbers?.length > 0 && (
                <div>
                  <p className="mt-2 font-medium">Failed Numbers:</p>
                  <ul className="list-disc list-inside text-red-700">
                    {report.failedNumbers.map((num, i) => (
                      <li key={i}>{num}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendBulkForm;