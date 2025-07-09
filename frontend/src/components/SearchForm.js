import { useState } from 'react';
import axios from 'axios';

function App() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/extractor/extract`, {
        content
      });
      
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Social Media Phone Number Extractor
          </h1>
          <p className="text-gray-600">
            Paste social media content to extract phone numbers
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Content
              </label>
              <textarea
                id="content"
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Paste content from social media posts, profiles, or comments here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Extracting...' : 'Extract Phone Numbers'}
              </button>
            </div>
          </form>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {results && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Extraction Results
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Found <span className="font-medium">{results.count}</span> phone number(s):
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
              {results.phoneNumbers.map((number, index) => (
                <div key={index} className="py-3 px-4 flex justify-between items-center">
                  <span className="font-mono text-gray-800">{number}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(number)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;