// MessageForm.js
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const MessageForm = () => {
  const [contacts, setContacts] = useState([]);
  const [manualContacts, setManualContacts] = useState([{ name: '', phone: '' }]);
  const [message, setMessage] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState('No attachments added.');
  const [isSending, setIsSending] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [report, setReport] = useState(null);
  const [sessionId, setSessionId] = useState('');

  const inputRefs = {
    image: useRef(null),
    video: useRef(null),
    document: useRef(null),
  };

  useEffect(() => {
    const sid = localStorage.getItem('sessionId');
    if (sid) setSessionId(sid);
  }, []);

  const allContacts = [
    ...manualContacts.map((c, i) => ({
      id: i + 1,
      name: c.name || '',
      phone: c.phone.trim(),
    })),
    ...contacts.map((c, i) => ({
      id: manualContacts.length + i + 1,
      name: c.name || '',
      phone: c.phone.trim(),
    })),
  ];

  const handleAttachmentFile = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setAttachmentPreview(`${type} Selected: ${file.name}`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const parsed = jsonData.slice(1).map((row, index) => ({
        id: index + 1,
        name: row[0] || '',
        phone: '91' + String(row[1]).replace(/[^0-9]/g, '').replace(/^91/, ''),
      }));
      setContacts(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  const isValidPhone = (phone) => /^91\d{10}$/.test(phone.trim());

  const handleSendMessages = async () => {
    const fileNumbers = contacts.map(c => c.phone.trim()).filter(isValidPhone);
    const manualNumbers = manualContacts.map(c => c.phone.trim()).filter(isValidPhone);
    const allNumbers = [...new Set([...fileNumbers, ...manualNumbers])];

    if (!sessionId) {
      alert('Session ID is required.');
      return;
    }

    if (allNumbers.length === 0) {
      alert('No valid WhatsApp numbers found. Use 91XXXXXXXXXX format.');
      return;
    }

    if (isScheduled && !scheduleTime) {
      alert('Please select a schedule time.');
      return;
    }

    const now = new Date();
    const scheduledDate = new Date(scheduleTime);
    if (isScheduled && scheduledDate <= now) {
      alert('Scheduled time must be in the future.');
      return;
    }

    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('phoneNumbers', allNumbers.join(','));
    formData.append('message', message);
    if (mediaFile) formData.append('media', mediaFile);
    if (isScheduled) formData.append('scheduleTime', scheduledDate.toISOString());
    const companyName = localStorage.getItem('companyName');
    if (companyName) formData.append('companyName', companyName);

    const url = isScheduled
      ? 'https://wp-lc.onrender.com/api/whatsapp/schedule'
      : 'https://wp-lc.onrender.com/api/whatsapp/send-bulk';

    try {
      setIsSending(true);
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const report = response.data?.report;
      setReport(report);
      if (report?.failed?.length > 0) {
        alert(`✅ Sent: ${report.sent.length}, ❌ Failed: ${report.failed.length}`);
      } else {
        alert('Messages sent successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send messages.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-green-600 rounded-lg">
      <h2 className='text-2xl flex items-center justify-center text-white font-bold'>Message Configuration</h2>
    <div className="p-4 grid md:grid-cols-2 gap-4 ">
      {/* Message Panel */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-semibold text-lg mb-2">Message & Attachments</h2>
        {/* <label className="block text-sm font-medium mb-1">Session ID</label>
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="border rounded px-3 py-2 mb-3 w-full"
          placeholder="Enter your Session ID"
          required
        /> */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full border rounded p-2"
          placeholder="Enter your message"
          required
        />
        <div className="mt-4">
          <p className="font-medium mb-1">Attachments:</p>
          <div className="flex gap-2 mb-2 flex-wrap">
            {['Image', 'Video', 'Document'].map((type) => (
              <div key={type}>
                <input
                  type="file"
                  accept={type === 'Image' ? 'image/*' : type === 'Video' ? 'video/*' : '.pdf,.doc,.docx,.xls,.xlsx,.txt'}
                  onChange={(e) => handleAttachmentFile(e, type)}
                  ref={inputRefs[type.toLowerCase()]}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => inputRefs[type.toLowerCase()].current.click()}
                  className={`px-3 py-1 rounded text-white ${
                    type === 'Image' ? 'bg-blue-600' : type === 'Video' ? 'bg-purple-600' : 'bg-red-600'
                  }`}
                >
                  {type}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const url = prompt('Enter the link URL:');
                if (url) {
                  setAttachmentPreview(`Attached Link: ${url}`);
                  setMediaFile(null); // Just show preview
                }
              }}
              className="bg-gray-600 text-white px-3 py-1 rounded"
            >
              🔗 Link
            </button>
          </div>
          <div className="border p-2 rounded text-sm text-gray-600">{attachmentPreview}</div>
        </div>

        {/* Schedule Option */}
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={() => setIsScheduled(!isScheduled)}
            />
            Schedule this message
          </label>
          {isScheduled && (
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="mt-2 w-full border rounded px-3 py-2"
              required
            />
          )}
        </div>
      </div>

      {/* Contact Panel */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-semibold text-lg mb-2">Contacts</h2>
        {manualContacts.map((contact, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              placeholder="Name"
              value={contact.name}
              onChange={(e) => {
                const updated = [...manualContacts];
                updated[index].name = e.target.value;
                setManualContacts(updated);
              }}
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="91XXXXXXXXXX"
              value={contact.phone}
              onChange={(e) => {
                const updated = [...manualContacts];
                updated[index].phone = e.target.value;
                setManualContacts(updated);
              }}
              className="border px-3 py-2 rounded"
            />
            <button
              type="button"
              className="bg-green-600 text-white rounded px-2"
              onClick={() =>
                setManualContacts([...manualContacts, { name: '', phone: '' }])
              }
            >
              ➕
            </button>
          </div>
        ))}

        <label className="block font-medium mt-4">Upload Excel</label>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="border px-3 py-2 mt-1 rounded"
        />

        {allContacts.length > 0 && (
          <div className="mt-4 border rounded overflow-auto max-h-48">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="px-3 py-1">#</th>
                  <th className="px-3 py-1">Name</th>
                  <th className="px-3 py-1">Phone</th>
                </tr>
              </thead>
              <tbody>
                {allContacts.map((c, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-3 py-1">{i + 1}</td>
                    <td className="px-3 py-1">{c.name}</td>
                    <td className="px-3 py-1">{c.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={handleSendMessages}
          disabled={isSending}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded font-semibold"
        >
          {isSending ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
    </div>
  );
};

export default MessageForm;
