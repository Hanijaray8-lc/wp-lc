import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import {
  FaCheckCircle, FaTimesCircle, FaUserPlus, FaUserMinus, FaSearch
} from 'react-icons/fa';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const sessionId = localStorage.getItem('sessionId');
  const companyName = localStorage.getItem('companyName') || 'Unknown'; // ✅ Added this

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get('https://wp-lc.onrender.com/api/contacts/contacts', {
          headers: { 'x-session-id': sessionId }
        });
        setContacts(res.data.contacts);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        alert('Failed to load WhatsApp contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [sessionId]);

  const toggleSelectContact = (contact) => {
    setSelectedContacts(prev =>
      prev.some(c => c.id === contact.id)
        ? prev.filter(c => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  const selectAllContacts = () => setSelectedContacts([...contacts]);
  const clearAllContacts = () => setSelectedContacts([]);

  const handleSend = async () => {
  const ids = selectedContacts.map(c => c.id);
  if (!ids.length) return alert('Please select at least one contact.');
  if (!message.trim() && !file) return alert('Please enter a message or select a file.');

  try {
    let fileName = null;

    if (file) {
      const formData = new FormData();
      formData.append('media', file);

      const uploadRes = await axios.post('https://wp-lc.onrender.com/api/contacts/upload', formData, {
        headers: {
          'x-session-id': sessionId // ✅ let browser set Content-Type
        }
      });

      fileName = uploadRes.data.fileName;
    }

    const payload = file
      ? { ids, fileName, caption: message, companyName }
      : { ids, message, companyName };

    const url = file
      ? 'https://wp-lc.onrender.com/api/contacts/send-media'
      : 'https://wp-lc.onrender.com/api/contacts/send-message';

    await axios.post(url, payload, {
      headers: { 'x-session-id': sessionId }
    });

    alert('Message sent successfully!');
    setMessage('');
    setFile(null);
    setSelectedContacts([]);
  } catch (err) {
    console.error('❌ Error sending message:', err.response?.data || err.message);
    alert('Failed to send message.');
  }
};



  const isSelected = (id) => selectedContacts.some(c => c.id === id);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.number.includes(searchTerm)
  );

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-green-600 p-6 text-gray-800">
  <div className="bg-white p-6 rounded-lg shadow-md grid md:grid-cols-3 gap-6">
    {/* Contact List */}
    <div className="md:col-span-2 flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-700">All Contacts</h2>
        <button
          className="text-sm bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          onClick={selectAllContacts}
        >
          <FaCheckCircle className="inline mr-1" /> Select All
        </button>
      </div>

      <div className="mb-3 relative">
        <FaSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or number"
          className="w-full pl-10 pr-3 py-2 border rounded bg-white text-gray-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {loading ? (
          <p>Loading...</p>
        ) : filteredContacts.length === 0 ? (
          <p className="text-gray-500">No contacts found.</p>
        ) : (
          filteredContacts.map(contact => (
            <div
              key={contact.id}
              className={`flex justify-between items-center p-3 rounded-lg border ${
                isSelected(contact.id)
                  ? 'bg-green-100 border-green-500'
                  : 'bg-white'
              }`}
            >
              <div>
                <p className="font-semibold">{contact.name}</p>
                <p className="text-sm text-gray-500">{contact.number}</p>
              </div>
              <button
                className={`text-xs px-3 py-2 rounded flex items-center gap-1 font-medium ${
                  isSelected(contact.id)
                    ? 'bg-red-100 hover:bg-red-200 text-red-700'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                onClick={() => toggleSelectContact(contact)}
              >
                {isSelected(contact.id) ? <FaUserMinus /> : <FaUserPlus />}
                {isSelected(contact.id) ? 'Remove' : 'Select'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Right Panel */}
    <div className="sticky top-6 self-start">
      {selectedContacts.length > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-green-700">Selected Members</h2>
              <button
                className="text-sm text-red-700 border border-red-400 px-2 py-1 rounded hover:bg-red-100"
                onClick={clearAllContacts}
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {selectedContacts.map(c => (
                <div
                  key={c.id}
                  className="bg-green-50 p-3 rounded-lg flex justify-between"
                >
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-gray-600">{c.number}</p>
                  </div>
                  <button
                    className="text-sm text-red-600 px-2 py-1 rounded hover:bg-red-100"
                    onClick={() => toggleSelectContact(c)}
                  >
                    <FaTimesCircle />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Message / File Upload */}
          <div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Send Message</h2>
            <textarea
              className="w-full h-32 p-3 border rounded bg-white text-gray-800"
              placeholder="Type your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {/* <h3 className="text-ld font-semibold mt-5 text-[#075E54]">Optional Media File</h3>
            <input
              type="file"
              className="mt-2"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*,audio/*,video/*,application/pdf"
            /> */}
            <button
              onClick={handleSend}
              className="block mt-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 w-full"
            >
              Send to Selected Members
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

    </div>
  );
};

export default Contacts;
