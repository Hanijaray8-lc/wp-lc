import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const MessageSender = () => {
  const [mode, setMode] = useState('bulk');

  // Shared
  const [mediaFile, setMediaFile] = useState(null);
  const [message, setMessage] = useState('');

  // Bulk
  const [file, setFile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [manualContacts, setManualContacts] = useState([{ phone: '' }]);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  // Manual
  const [manualPhone, setManualPhone] = useState('');
  const [manualSuccess, setManualSuccess] = useState('');
  const [manualError, setManualError] = useState('');

  const isValidPhone = (phone) => /^\d{10,15}$/.test(phone);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const parsedContacts = jsonData.slice(1).map((row, index) => ({
        id: index + 1,
        name: row[0] || '',
        phone: '91' + String(row[1]).replace(/[^0-9]/g, '').replace(/^91/, ''),
      }));

      setContacts(parsedContacts);
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setProgress(0);
    setReport(null);

    const fileNumbers = contacts.map(c => String(c.phone).trim()).filter(isValidPhone);
    const manualNumbers = manualContacts.map(c => String(c.phone).trim()).filter(isValidPhone);
    const allNumbers = [...new Set([...fileNumbers, ...manualNumbers])];

    const hasExcelFile = file && fileNumbers.length > 0;
    const hasManual = manualNumbers.length > 0;

    if (!hasExcelFile && !hasManual) {
      alert('Please add at least one valid phone number (file or manual).');
      setIsSending(false);
      return;
    }

    const formData = new FormData();
    formData.append('phoneNumbers', allNumbers.join(','));
    formData.append('message', message);
    if (mediaFile) formData.append('media', mediaFile);
    if (isScheduled) formData.append('scheduleTime', scheduleTime);

    const url = isScheduled
      ? 'https://wp-lc.onrender.com/api/whatsapp/schedule'
      : 'https://wp-lc.onrender.com/api/whatsapp/send-bulk';

    try {
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      if (isScheduled) {
        alert('Message scheduled successfully!');
        setTimeout(async () => {
          try {
            const reportRes = await axios.get('https://wp-lc.onrender.com/api/whatsapp/latest-campaign');
            setReport(reportRes.data.report);
          } catch (err) {
            setReport({ total: 0, success: 0, failed: 0, failedNumbers: [], error: 'Failed to fetch report' });
          }
        }, Math.max(new Date(scheduleTime).getTime() - Date.now() + 5000, 5000));
      } else {
        setReport(response.data.report);
        alert('Messages sent successfully!');
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualError('');
    setManualSuccess('');

    if (!manualPhone || !message) {
      setManualError('Phone number and message are required.');
      return;
    }

    const formData = new FormData();
    formData.append('phoneNumbers', manualPhone);
    formData.append('message', message);
    if (mediaFile) formData.append('media', mediaFile);

    try {
      await axios.post('https://wp-lc.onrender.com/api/whatsapp/send-manual', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setManualSuccess('Message sent successfully!');
    } catch (err) {
      console.error(err);
      setManualError('Something went wrong.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${mode === 'bulk' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('bulk')}
        >
          Bulk Message
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === 'manual' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('manual')}
        >
          Manual Message
        </button>
      </div>

      {mode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Phone Number"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input type="file" onChange={(e) => setMediaFile(e.target.files[0])} />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Send Message
          </button>
          {manualError && <p className="text-red-500">{manualError}</p>}
          {manualSuccess && <p className="text-green-600">{manualSuccess}</p>}
        </form>
      ) : (
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div>
            <label>Upload File (CSV/Excel):</label>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
          </div>

          {contacts.length > 0 && (
            <div className="border rounded max-h-40 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-2">S.No</th>
                    <th className="px-2">Name</th>
                    <th className="px-2">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id}>
                      <td className="px-2">{c.id}</td>
                      <td className="px-2">{c.name}</td>
                      <td className="px-2">{c.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div>
            <h4>Manual Contacts</h4>
            {manualContacts.map((contact, idx) => (
              <div key={idx} className="mb-2">
                <input
                  type="text"
                  value={contact.phone}
                  onChange={(e) => {
                    const updated = [...manualContacts];
                    updated[idx].phone = e.target.value;
                    setManualContacts(updated);
                  }}
                  className="w-full border p-2 rounded"
                  placeholder="Phone Number"
                />
              </div>
            ))}
            <button type="button" onClick={() => setManualContacts([...manualContacts, { phone: '' }])} className="text-green-600 text-sm">
              + Add another contact
            </button>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full border p-2 rounded"
            placeholder="Enter your message"
            required
          />

          <div>
            <label>Optional Media File</label>
            <input type="file" onChange={(e) => setMediaFile(e.target.files[0])} />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={isScheduled} onChange={() => setIsScheduled(!isScheduled)} />
              <span>Schedule Message</span>
            </label>
            {isScheduled && (
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="mt-2 border p-2 rounded"
              />
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSending}
              className={`px-4 py-2 rounded text-white ${isSending ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isSending ? 'Sending...' : 'Send Messages'}
            </button>

            {isSending && (
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            )}
          </div>

          {report && (
            <div className="bg-gray-50 p-4 rounded mt-4">
              <h4 className="font-bold">Send Report</h4>
              <p>Total: {report.total}</p>
              <p>Success: {report.success}</p>
              <p>Failed: {report.failed}</p>
              {report.failedNumbers?.length > 0 && (
                <>
                  <p>Failed Numbers:</p>
                  <ul className="list-disc pl-5">
                    {report.failedNumbers.map((num, i) => (
                      <li key={i}>{num}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default MessageSender;
