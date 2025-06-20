import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';

function App() {
  const [rules, setRules] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const companyName = localStorage.getItem('companyName');
  const sessionId = localStorage.getItem('sessionId');

  const fetchRules = async () => {
    try {
      const res = await axios.get('https://wp-lc.onrender.com/api/autoresponder/rules', {
        params: { sessionId }
      });
      setRules(res.data.rules);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const res = await axios.get('https://wp-lc.onrender.com/api/whatsapp/session', {
        params: { companyName }
      });
      setActiveSession(res.data.session);
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  useEffect(() => {
    fetchRules();
    fetchActiveSession();
  }, [companyName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRule) {
        await axios.put(`https://wp-lc.onrender.com/api/autoresponder/rule/${editingRule._id}`, {
          keyword,
          response,
          sessionId
        });
      } else {
        await axios.post('https://wp-lc.onrender.com/api/autoresponder/rule', {
          keyword,
          response,
          sessionId,
          companyName
        });
      }

      setKeyword('');
      setResponse('');
      setEditingRule(null);
      fetchRules();
    } catch (error) {
      console.error('Error saving rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setKeyword(rule.keyword);
    setResponse(rule.response);
    setEditingRule(rule);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await axios.delete(`https://wp-lc.onrender.com/api/autoresponder/rule/${id}`, {
          params: { sessionId }
        });
        fetchRules();
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    }
  };

  const startWhatsAppSession = async () => {
    try {
      await axios.post('https://wp-lc.onrender.com/api/whatsapp/init', {
        companyName
      });
      fetchActiveSession();
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const logoutWhatsApp = async () => {
    try {
      await axios.post('https://wp-lc.onrender.com/api/whatsapp/logout', {
        companyName
      });
      setActiveSession(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="bg-green-600 min-h-screen">
      <Header />
      <div className="max-w-2xl mx-auto p-6 font-sans">
        {/* <h2 className="text-2xl font-bold mb-6 text-center">📲 WhatsApp Auto Responder</h2> */}
        
        <div className="bg-white rounded shadow p-4 mb-6">
          {/* <h3 className="text-lg font-semibold mb-3">🔑 Session Status</h3>
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">Company: </span>
              <span className="text-blue-600">{companyName}</span>
          
            </div>
            <div>
              <span className="font-medium">Session ID: </span>
              <span className="text-gray-700">{sessionId ? sessionId : 'Not connected'}</span>
            </div>
          </div> */}

        <h3 className="text-2xl font-bold mb-4 text-center text-green-700">Auto Responder</h3>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-green-600 mb-1">Keyword</label>
            <input
              type="text"
              placeholder="Enter keyword"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-green-600 mb-1">Response</label>
            <input
              type="text"
              placeholder="Enter response"
              value={response}
              onChange={e => setResponse(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
          >
            {loading ? 'Saving...' : editingRule ? 'Update Rule' : 'Add Rule'}
          </button>
        </form>

        {editingRule && (
          <button
            type="button"
            onClick={() => {
              setEditingRule(null);
              setKeyword('');
              setResponse('');
            }}
            className="text-sm text-gray-600 hover:underline mb-4"
          >
            Cancel Edit
          </button>
        )}

        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-semibold mb-3 text-green-600">Current Rules</h3>
          {rules.length === 0 ? (
            <p className="text-gray-500">No rules added yet.</p>
          ) : (
            <ul className="space-y-2">
              {rules.map(rule => (
                <li
                  key={rule._id}
                  className="border p-3 rounded bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-blue-700">"{rule.keyword}"</span>
                    <span className="ml-2 text-gray-600">→ {rule.response}</span>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-sm text-yellow-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rule._id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default App;