import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const BulkMessageForm = () => {
  const [sessionId, setSessionId] = useState('');
  const [file, setFile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [manualContacts, setManualContacts] = useState([{ phone: '' }]);
  const [mediaFile, setMediaFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    // Auto-fetch sessionId from localStorage
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) setSessionId(storedSessionId);
  }, []);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
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

  const handleMediaChange = (e) => {
    setMediaFile(e.target.files[0]);
  };

  const isValidPhone = (phone) => /^\d{10,15}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setProgress(0);
    setReport(null);

    const fileNumbers = contacts
      .map(c => String(c.phone).trim())
      .filter(isValidPhone);

    const manualNumbers = manualContacts
      .map(c => String(c.phone).trim())
      .filter(isValidPhone);

    const allNumbers = [...new Set([...fileNumbers, ...manualNumbers])];

    const hasExcelFile = file && fileNumbers.length > 0;
    const hasManual = manualNumbers.length > 0;

    if (!sessionId) {
      alert('Session ID is required');
      setIsSending(false);
      return;
    }

    if (!hasExcelFile && !hasManual) {
      alert('Please add at least one valid phone number.');
      setIsSending(false);
      return;
    }

    const numbersString = allNumbers.join(',');

    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('phoneNumbers', numbersString);
    formData.append('message', message);
    if (mediaFile) formData.append('media', mediaFile);
    if (isScheduled) formData.append('scheduleTime', scheduleTime);

    const companyName = localStorage.getItem('companyName');
    if (companyName) formData.append('companyName', companyName);

    const url = isScheduled
      ? 'https://wp-lc.onrender.com/api/whatsapp/schedule'
      : 'https://wp-lc.onrender.com/api/whatsapp/send-bulk';

    try {
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });

      if (isScheduled) {
        alert('Message scheduled successfully! Fetching report later...');
        setTimeout(async () => {
          try {
            const reportRes = await axios.get('https://wp-lc.onrender.com/api/whatsapp/latest-campaign', {
              params: { companyName },
            });
            setReport(reportRes.data.report);
          } catch {
            setReport({ total: 0, success: 0, failed: 0, failedNumbers: [], error: 'Failed to fetch report' });
          }
        }, Math.max(new Date(scheduleTime).getTime() - Date.now() + 5000, 5000));
      } else {
        setReport(response.data.report);
        alert('Messages sent successfully!');
      }
    } catch (err) {
      console.error('Error sending messages:', err);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Session ID */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session ID</label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div> */}

        {/* File Upload */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Send Bulk Messages</h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contacts File (CSV/Excel)
            </label>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
          </div>

          {contacts.length > 0 && (
            <div className="flex-1 border rounded-md h-36 overflow-y-auto">
              <table className="min-w-full text-sm text-left text-gray-600">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2">S.No</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-1">{c.id}</td>
                      <td className="px-4 py-1">{c.name}</td>
                      <td className="px-4 py-1">{c.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manual Contacts */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Manual Contacts</h3>
          {manualContacts.map((contact, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Phone Number"
                value={contact.phone}
                onChange={(e) => {
                  const updated = [...manualContacts];
                  updated[index].phone = e.target.value;
                  setManualContacts(updated);
                }}
                className="border p-2 rounded w-full"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setManualContacts([...manualContacts, { phone: '' }])}
            className="text-green-600 text-sm"
          >
            + Add another contact
          </button>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Media File */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Media / Document (Optional)
          </label>
          <input type="file" onChange={handleMediaChange} />
        </div>

        {/* Schedule */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={() => setIsScheduled(!isScheduled)}
              className="form-checkbox"
            />
            <span>Schedule this message</span>
          </label>
          {isScheduled && (
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="mt-2 px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isSending}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isSending ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSending ? 'Sending...' : 'Send Messages'}
          </button>
          {isSending && (
            <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </form>

      {/* Report */}
      {report && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-2">Send Report</h3>
          <p>Total: {report.total}</p>
          <p>Success: {report.success}</p>
          <p>Failed: {report.failed}</p>
          {report.failedNumbers?.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Failed Numbers:</p>
              <ul className="list-disc pl-5">
                {report.failedNumbers.map((num, idx) => (
                  <li key={idx}>{num}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkMessageForm;