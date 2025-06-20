import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';

const normalizePhone = (raw) => {
  const digits = raw.replace(/\D/g, '');

  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `${digits}`;
  }

  if (digits.length === 13 && digits.startsWith('91')) {
    return `${digits}`;
  }

  return null;
};

function ContactExtractor() {
  const [url, setUrl] = useState('');
  const [contacts, setContacts] = useState({ emails: [], phones: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Load sessionId and companyName from localStorage on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    const storedCompanyName = localStorage.getItem('companyName') || 'Unknown';

    if (storedSessionId) setSessionId(storedSessionId);
    setCompanyName(storedCompanyName);
  }, []);

  const extractContacts = async () => {
  try {
    setLoading(true);
    setError('');

    // ✅ Logged-in user's company name (stored during login)
    const companyName = localStorage.getItem('companyName');

    const response = await axios.post('https://wp-lc.onrender.com/api/extract', {
      url,
      companyName, // ✅ Send to backend
    });

    setContacts(response.data);
    setSelectedPhones([]); // Reset selection
    setSelectAll(false);
  } catch (err) {
    setError('❌ Failed to extract contacts. Make sure the server is running and the URL is valid.');
  } finally {
    setLoading(false);
  }
};

  const togglePhone = (phone) => {
    const normalized = normalizePhone(phone);
    if (!normalized) return;

    setSelectedPhones((prev) =>
      prev.includes(normalized)
        ? prev.filter((p) => p !== normalized)
        : [...prev, normalized]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPhones([]);
    } else {
      const all = contacts.phones.map(normalizePhone).filter(Boolean);
      setSelectedPhones(all);
    }
    setSelectAll(!selectAll);
  };

  const sendWhatsAppMessage = async () => {
  try {
    const response = await axios.post(
      'https://wp-lc.onrender.com/api/contacts/message',
      {
        ids: selectedPhones.map(p => p.replace('+', '')),
        message,
        companyName, // ✅ keep this in body
      },
      {
        headers: {
          'x-session-id': sessionId, 
        },
      }
    );

    if (response.data.success) {
      alert('✅ Message sent successfully!');
    } else {
      alert('⚠️ Some messages may have failed to send.');
    }
  } catch (err) {
    console.error('❌ WhatsApp Send Error:', err.response?.data || err.message);
    alert('❌ Failed to send message.');
  }
};


  return (
    <div>
    <Header />
    <div className="min-h-screen bg-green-600 flex  justify-center p-6">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl p-6 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
          Website Contact Extractor & WhatsApp Sender
        </h1>

        {/* URL Input */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            placeholder="Enter website URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={extractContacts}
            disabled={loading || !url}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Extracting...' : 'Extract'}
          </button>
        </div>

        {error && <p className="text-red-500 mb-4 animate-pulse text-center">{error}</p>}

       
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          
          <div className="bg-gray-50 p-4 rounded shadow-inner animate-fadeInUp">
            <h2 className="text-xl font-semibold text-green-700 mb-3">📧 Emails Found</h2>
            {contacts.emails.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {contacts.emails.map((email, i) => (
                  <li key={i} className="text-gray-800">{email}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No emails found</p>
            )}
          </div> */}

          {/* Phones */}
          <div className="bg-gray-50 p-4 rounded shadow-inner animate-fadeInUp">
            <h2 className="text-xl font-semibold text-green-700 mb-3">Phone Numbers Found</h2>

            {contacts.phones.length > 0 ? (
              <>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="mr-2"
                  />
                  <label className="text-lg text-green-600">Select All</label>
                </div>

                <ul className="list-disc list-inside space-y-1 mb-4">
                  {contacts.phones.map(normalizePhone).filter(Boolean).map((fullPhone, i) => (
                    <li key={i} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPhones.includes(fullPhone)}
                        onChange={() => togglePhone(fullPhone)}
                        className="mr-2"
                      />
                      <span className="text-gray-800">{fullPhone}</span>
                    </li>
                  ))}
                </ul>

                {/* Message Input */}
                <textarea
                  rows="3"
                  className="w-full border border-gray-300 rounded p-2 mb-3"
                  placeholder="Enter WhatsApp message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                {/* Send Button */}
                <button
                  onClick={sendWhatsAppMessage}
                  className="bg-green-600 text-white w-full max-w-3xl py-2 rounded hover:bg-green-700 transition"
                  disabled={selectedPhones.length === 0 || !message}
                >
                  📤 Send WhatsApp Message
                </button>
              </>
            ) : (
              <p className="text-gray-500 italic">No phone numbers found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactExtractor;
