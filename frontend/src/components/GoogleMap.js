import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';

const MapScrapeNoAPI = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [messageText, setMessageText] = useState("Hi! 👋 We found your business on Google Maps and wanted to connect.");
  const [sessionId, setSessionId] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('sessionId');
    const company = localStorage.getItem('companyName') || 'Unknown';
    if (session) setSessionId(session);
    setCompanyName(company);
  }, []);

  const fetchData = async () => {
    if (!query) return;

    setLoading(true);
    setResults([]);
    setError(null);
    setSelectedPhones([]);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/scrape-maps?query=${encodeURIComponent(query)}&companyName=${encodeURIComponent(companyName)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.trim()) {
            try {
              const business = JSON.parse(line);
              setResults(prev => [...prev, business]);
            } catch (parseErr) {
              console.warn('Parse error:', line);
            }
          }
        }
      }

      if (buffer.trim()) {
        try {
          const business = JSON.parse(buffer);
          setResults(prev => [...prev, business]);
        } catch (parseErr) {
          console.warn('Final parse error:', buffer);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePhoneSelection = (phone) => {
    setSelectedPhones((prev) =>
      prev.includes(phone)
        ? prev.filter((p) => p !== phone)
        : [...prev, phone]
    );
  };

  const sendWhatsAppMessage = async () => {
  if (!sessionId || !companyName) {
    alert('❌ Session or company info missing. Please login again.');
    return;
  }

  if (selectedPhones.length === 0 || !messageText.trim()) {
    alert('❌ Please select at least one phone number and write a message.');
    return;
  }

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/contacts/google-message`,
      {
        ids: selectedPhones.map(p => p.replace(/\D/g, '')),
        message: messageText,
        companyName,
      },
      {
        headers: {
          'x-session-id': sessionId,
        },
      }
    );

    const { success, results } = response.data;

    if (success) {
      const sent = results.filter(r => r.status === 'sent').length;
      const failed = results.filter(r => r.status === 'failed').length;

      if (failed > 0) {
        alert(`✅ ${sent} contacts messaged successfully.\n❌ ${failed} failed (not WhatsApp users or invalid).`);
      } else {
        alert(`✅ All ${sent} messages sent successfully!`);
      }
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
    <div className="min-h-screen bg-green-600 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-600 mb-6">
          WhatsApp Bulk Messenger (via Google Maps Scraper)
        </h1>

        {/* Search & Scrape */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
          <input
            type="text"
            className="w-full sm:w-2/3 border border-gray-300 rounded-lg px-4 py-2 text-lg shadow focus:outline-green-500"
            placeholder="e.g., hospitals in chennai"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={fetchData}
            disabled={loading || !query}
            className={`transition-all px-6 py-2 text-lg font-semibold rounded-lg shadow ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? 'Extracting...' : 'Scrape'}
          </button>
        </div>

        {/* Message Box */}
        {results.length > 0 && (
          <div className="mb-3">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 shadow-sm focus:outline-green-500"
              rows={2}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter your WhatsApp message here..."
            />
          </div>
        )}

        {/* Send WhatsApp Button */}
        {selectedPhones.length > 0 && (
          <div className="mb-6 text-center">
            <button
              onClick={sendWhatsAppMessage}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all"
            >
              Send WhatsApp Message to {selectedPhones.length} Contacts
            </button>
          </div>
        )}

        {/* Loading & Errors */}
        {loading && <p className="text-center text-green-700 mb-4">Extracting results... please wait.</p>}
        {error && <p className="text-center text-red-600 mb-4">Error: {error}</p>}

        {/* Results List */}
        <div className="max-h-[500px] overflow-y-auto space-y-6 pr-2">
          {results.length === 0 && !loading && !error && (
            <p className="text-center text-gray-500">No results yet. Try searching something.</p>
          )}

          {results.map((biz, i) => (
            <div
              key={i}
              className="bg-green-50 border border-green-100 rounded-xl p-5 shadow hover:shadow-md transition-all"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-green-900 mb-1">{biz.name || 'No Name'}</h3>
              
              <p className="text-gray-700 mb-1"><strong>Address:</strong> {biz.address || 'N/A'}</p>

              <div className="flex items-center mb-1">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedPhones.includes(biz.phone)}
                  disabled={!biz.phone || biz.phone === 'N/A'}
                  onChange={() => togglePhoneSelection(biz.phone)}
                />
                <span className="text-gray-700"><strong>Phone:</strong> {biz.phone || 'N/A'}</span>
              </div>

              <p className="text-gray-700 mb-1">
                <strong>Website:</strong>{' '}
                {biz.website && biz.website !== 'N/A' ? (
                  <a
                    href={biz.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline"
                  >
                    Visit
                  </a>
                ) : (
                  'N/A'
                )}
              </p>

              <p className="text-gray-700">
                <strong>Google Maps:</strong>{' '}
                <a href={biz.mapLink} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
                  View
                </a>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default MapScrapeNoAPI;