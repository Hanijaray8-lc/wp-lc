import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from 'react-icons/fa';
import Header from './Header';


function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [copiedLink, setCopiedLink] = useState(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const iconMap = {
  facebook: <FaFacebook className="text-blue-600" />,
  instagram: <FaInstagram className="text-pink-600" />,
  linkedin: <FaLinkedin className="text-blue-500" />,
  twitter: <FaTwitter className="text-sky-500" />,
  youtube: <FaYoutube className="text-red-600" />,
};

  // Load history on initial render
useEffect(() => {
  const fetchHistory = async () => {
    try {
      const companyName = localStorage.getItem('companyName'); // ✅
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/history?companyName=${companyName}`);
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };
  fetchHistory();
}, []);


  const extractLinks = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);
    setCopiedLink(null);
    setSelectedHistoryId(null);

    try {
      const companyName = localStorage.getItem('companyName'); // <-- Get companyName
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/socialextract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, companyName }) // <-- Send companyName
      });
      const data = await response.json();
      setResults(data.socialLinks);
      
      // Fetch updated history
      const historyResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/history`);
      setHistory(historyResponse.data);
      
      // Find and select the newly created history item
      const newItem = historyResponse.data.find(item => item.url === url);
      if (newItem) {
        setSelectedHistoryId(newItem._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (historyItem) => {
    setUrl(historyItem.url);
    setResults({ socialLinks: historyItem.socialLinks });
    setSelectedHistoryId(historyItem._id);
    setError('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const SocialIcon = ({ platform, link }) => {
    if (!link) return null;

    const icons = {
      facebook: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
      instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
      linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
      twitter: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
      youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
    };

    const platformColors = {
      facebook: 'bg-blue-600 hover:bg-blue-700',
      instagram: 'bg-pink-600 hover:bg-pink-700',
      linkedin: 'bg-blue-500 hover:bg-blue-600',
      twitter: 'bg-blue-400 hover:bg-blue-500',
      youtube: 'bg-red-600 hover:bg-red-700'
    };

    return (
      <div className="flex items-center p-3 mb-2 bg-gray-100 rounded hover:bg-gray-200 transition">
        <div className="flex items-center flex-1">
          <div className={`w-10 h-10 flex items-center justify-center rounded-full ${platformColors[platform]} text-white mr-3`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d={icons[platform]} />
            </svg>
          </div>
          <div>
            <span className="capitalize font-medium">{platform}</span>
            <p className="text-xs text-gray-500 truncate max-w-xs">{link}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => copyToClipboard(link)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-300 rounded transition"
            title="Copy link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-300 rounded transition"
            title="Visit link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-green-600">
      <Header />
      <div className="flex">
        {/* Left Sidebar - History */}
        <div className="w-1/3  bg-green-650 shadow-lg p-6 overflow-y-auto h-[650px] sticky top-0">
          <h2 className="text-2xl font-semibold mb-4 ">Extraction History</h2>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item._id}
                  className={`border-b pb-4 last:border-0 last:pb-0 cursor-pointer p-3 rounded transition ${selectedHistoryId === item._id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{item.url}</h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
               <div className="flex flex-wrap gap-2">
  {Object.entries(item.socialLinks).map(([platform, link]) => (
    link && (
      <div key={platform} className="relative group flex items-center space-x-1">
        <div className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${selectedHistoryId === item._id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 hover:bg-gray-200'}`}>
          {iconMap[platform]}
          <span className="capitalize">{platform}</span>
        </div>
        <div className="absolute z-10 -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
          {link}
        </div>
      </div>
    )
  ))}
</div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No extraction history yet</p>
            </div>
          )}
        </div>

        {/* Right Main Content */}
        <div className="w-2/3 p-3 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Extractor</h1>
              <p className="text-gray-600">Enter a website URL to extract social media links</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <div className="flex">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={extractLinks}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-r-md disabled:opacity-50 transition flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extracting...
                    </>
                  ) : 'Extract'}
                </button>
              </div>
              {error && <p className="mt-2 text-red-500">{error}</p>}
            </div>

            {copiedLink && (
              <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Link copied to clipboard!
              </div>
            )}

            {results && (
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Extracted Social Links</h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                      className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy All
                    </button>
                    {selectedHistoryId && (
                      <span className="text-sm text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        From history
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <SocialIcon platform="facebook" link={results.facebook} />
                  <SocialIcon platform="instagram" link={results.instagram} />
                  <SocialIcon platform="linkedin" link={results.linkedin} />
                  <SocialIcon platform="twitter" link={results.twitter} />
                  <SocialIcon platform="youtube" link={results.youtube} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;