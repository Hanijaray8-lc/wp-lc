import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import MessageProgress from './MessageProgress';

const MessageForm = () => {
  const [allContacts, setAllContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [message, setMessage] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState('No attachments added.');
  const [isSending, setIsSending] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [report, setReport] = useState(null);
  const [progressKey, setProgressKey] = useState(Date.now());
  const [attachmentType, setAttachmentType] = useState(null); // To store the type of attachment

 const inputRefs = {
  image: useRef(null),
  video: useRef(null),
  document: useRef(null), // for message attachments (pdf, docx, ppt etc)
  excel: useRef(null),    // ✅ separate input for uploading Excel contacts
};


  useEffect(() => {
    const sid = localStorage.getItem('sessionId');
    if (sid) setSessionId(sid);
  }, []);

  // Validates if a phone number is in the 91XXXXXXXXXX format.
  const isValidPhone = (phone) => /^91\d{10}$/.test(phone.trim());

  // Handles the selection of attachment files (image, video, document).
  const handleAttachmentFile = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) {
      setMediaFile(null);
      setAttachmentPreview('No attachments added.');
      setAttachmentType(null);
      return;
    }
    setMediaFile(file);
    setAttachmentType(type); // Set the type of attachment
    setAttachmentPreview(`${type} Selected: ${file.name}`);
    setError(''); // Clear any previous error
  };

  // Handles the upload of an Excel file for contacts.
  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(new Uint8Array(evt.target.result), { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
        const parsed = rows.slice(1).map(row => ({
          name: row[0]?.toString().trim() || '',
          phone: '91' + (row[1]?.toString().replace(/\D/g, '').replace(/^91/, '') || '')
        }));
        const valid = parsed.filter(c => isValidPhone(c.phone));

        if (valid.length === 0) {
          setError('No valid contacts found in the uploaded Excel file. Ensure phone numbers are in the correct format (e.g., 91XXXXXXXXXX).');
        } else {
          setAllContacts(prev => [...prev, ...valid]);
          setError('');
        }
      } catch (err) {
        setError('Error parsing Excel file. Please ensure it is a valid Excel file with contacts.');
        console.error('Excel parsing error:', err);
      } finally {
        // Clear the file input after processing
       if (inputRefs.excel.current) {
  inputRefs.excel.current.value = '';
}

      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handles adding a new contact manually.
  const handleAddContact = () => {
    if (!isValidPhone(newContact.phone)) {
      setError('Please enter a valid 12-digit Indian WhatsApp number (e.g., 91XXXXXXXXXX).');
      return;
    }
    // Check for duplicate phone numbers
    if (allContacts.some(contact => contact.phone === newContact.phone)) {
      setError('This phone number is already in your contact list.');
      return;
    }
    setAllContacts(prev => [...prev, newContact]);
    setNewContact({ name: '', phone: '' });
    setError('');
  };

  // Handles sending messages (bulk or scheduled).
 const handleSendMessages = async () => {
  const validNumbers = allContacts
    .map(c => c.phone.trim())
    .filter(isValidPhone);

  // Check session ID
  if (!sessionId) {
    alert('❗ Session ID is missing. Please log in again or refresh the page.');
    return;
  }

  // Prevent sending empty message without attachment
  if (!message.trim() && !mediaFile && attachmentType !== 'link') {
    alert('❗ Message content cannot be empty unless an attachment or link is included.');
    return;
  }

  // Ensure at least one valid number
  if (validNumbers.length === 0) {
    alert('❗ No valid contacts found. Please ensure all numbers are in 91XXXXXXXXXX format.');
    return;
  }

  // Validate scheduling fields
  if (isScheduled) {
    if (!scheduleTime) {
      alert('⏰ Please select a valid schedule date and time.');
      return;
    }

    const scheduledDate = new Date(scheduleTime);

    if (isNaN(scheduledDate.getTime())) {
      alert('❗ Invalid schedule format. Please re-select a valid future time.');
      return;
    }

    if (scheduledDate <= new Date()) {
      alert('⏰ Scheduled time must be in the future.');
      return;
    }
  }

  // Everything is valid, proceed
  setShowProgress(true);
  setProgressKey(Date.now());
  setReport(null);

  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('phoneNumbers', validNumbers.join(','));
  formData.append('message', message);

  if (mediaFile) {
    formData.append('media', mediaFile);
    formData.append('attachmentType', attachmentType); // Include type for server
  }

  if (isScheduled) {
    formData.append('scheduleTime', new Date(scheduleTime).toISOString());
  }

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

    const result = response.data?.report;

    if (result) {
      setReport(result);
      const sentCount = result.sent?.length || 0;
      const failedCount = result.failed?.length || 0;

      if (sentCount === 0 && failedCount === 0) {
       alert('✅ All messages sent successfully!');
        } else if (failedCount > 0) {
        alert(`✅ Sent: ${sentCount}, ❌ Failed: ${failedCount}. See below for details.`);
      } else {
       alert('✅ All messages sent successfully!');
       alert('⚠️ No messages were sent. Check your contact list and message format.');
      }
    } else {
     if (isScheduled) {
    alert('✅ Scheduled time is fixed. Your message will be sent automatically at the selected time.');
  } else {
    alert('⚠️ No response report received from server. Messages may not have been sent.');
  }}
  } catch (error) {
    console.error('Server error:', error);
    const serverMsg = error?.response?.data?.message || 'Server error occurred. Please try again later.';
    alert(`❌ Message send failed: ${serverMsg}`);

    // Populate the failed list for UI
    setReport({
      sent: [],
      failed: validNumbers.map(phone => ({ number: phone, reason: serverMsg })),
    });
  } finally {
    setIsSending(false);
  }
};


  // Resets the form to its initial state.
  const resetForm = () => {
    setAllContacts([]);
    setNewContact({ name: '', phone: '' });
    setMessage('');
    setMediaFile(null);
    setAttachmentPreview('No attachments added.');
    setScheduleTime('');
    setIsScheduled(false);
    setError('');
    setEditIndex(null);
    setReport(null); // Clear the report
    setShowProgress(false); // Hide progress
    setAttachmentType(null); // Reset attachment type
    // Clear file inputs
    Object.values(inputRefs).forEach(ref => {
      if (ref.current) ref.current.value = '';
    });
  };

  return (
    <div className="p-4 grid md:grid-cols-2 gap-4">
      {/* Message Panel */}
      <div className="bg-white rounded p-4 w-full shadow">
        <h2 className="text-lg font-semibold mb-2">Message & Attachments</h2>
        <textarea
          className="w-full border rounded p-2"
          rows={6}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Enter your message here..."
        />
        <div className="mt-4">
          <p className="font-medium mb-1">Attachments:</p>
          <div className="flex flex-wrap gap-2 mb-2">
          {['Image', /*'Video'*/, 'Document'].map(type => (
  <div key={type}>
    <input
      type="file"
      accept={
        type === 'Image' ? 'image/*' :
        // type === 'Video' ? '.mp4,.mov,.avi,.mkv,.flv,.wmv,.webm' : // ✅ all common video types
        '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx,.rtf'
      }
      ref={inputRefs[type.toLowerCase()]}
      className="hidden"
      onChange={e => handleAttachmentFile(e, type)}
    />
    <button
      type="button"
      onClick={() => inputRefs[type.toLowerCase()].current.click()}
      className={`px-3 py-1 rounded text-white ${
        type === 'Image' ? 'bg-blue-600' :
        // type === 'Video' ? 'bg-purple-600' :
         'bg-red-600'
      }`}
    >
      {type}
    </button>
  </div>
))}


            <button
              type="button"
              className="bg-gray-600 text-white px-3 py-1 rounded"
              onClick={() => {
                const url = prompt('Enter link URL (e.g., https://example.com):');
                if (url) {
                  // Basic URL validation
                  try {
                    new URL(url); // Throws error for invalid URL format
                    setAttachmentPreview(`Attached Link: ${url}`);
                    setMediaFile(null); // No media file for a link attachment
                    setAttachmentType('link'); // Set attachment type to link
                    setMessage(prev => (prev ? prev + '\n' : '') + url); // Append link to message
                    setError('');
                  } catch (e) {
                    setError('Invalid URL format. Please enter a full URL (e.g., https://example.com).');
                  }
                }
              }}
            >
              🔗 Link
            </button>
          </div>
          <div className="border p-2 rounded text-sm text-gray-600">
            {attachmentPreview}
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={() => setIsScheduled(prev => !prev)}
            /> Schedule Message
          </label>
          {isScheduled && (
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={e => setScheduleTime(e.target.value)}
              className="mt-2 w-full border rounded p-2"
            />
          )}
        </div>
      </div>

      {/* Contacts Panel */}
      <div className="bg-white rounded p-4 w-full shadow">
        <h2 className="text-lg font-semibold mb-2">Contacts</h2>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input
            className="border px-3 py-2 rounded"
            type="text"
            placeholder="Name (Optional)"
            value={newContact.name}
            onChange={e => setNewContact(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="border px-3 py-2 rounded"
            type="tel"
            placeholder="91XXXXXXXXXX"
            value={newContact.phone}
            onChange={e => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
          />
          <button
            type="button"
            className="bg-green-600 text-white px-2 rounded"
            onClick={handleAddContact}
          >
            ➕ Add
          </button>
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="overflow-auto max-h-48 border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="px-3 py-1">#</th>
                <th className="px-3 py-1">Name</th>
                <th className="px-3 py-1">Phone</th>
                <th className="px-3 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allContacts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 py-3">No contacts added yet.</td>
                </tr>
              ) : (
                allContacts.map((c, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-3 py-1">{i + 1}</td>
                    <td className="px-3 py-1">
                      {editIndex === i ? (
                        <input
                          value={c.name}
                          onChange={e => {
                            const arr = [...allContacts];
                            arr[i].name = e.target.value;
                            setAllContacts(arr);
                          }}
                          className="border px-1 py-1 rounded w-full"
                        />
                      ) : c.name}
                    </td>
                    <td className="px-3 py-1">
                      {editIndex === i ? (
                        <input
                          value={c.phone}
                          onChange={e => {
                            const arr = [...allContacts];
                            // Basic validation during edit
                            if (!isValidPhone(e.target.value)) {
                              setError('Invalid phone number format.');
                            } else {
                              setError('');
                            }
                            arr[i].phone = e.target.value;
                            setAllContacts(arr);
                          }}
                          className="border px-1 py-1 rounded w-full"
                        />
                      ) : c.phone}
                    </td>
                    <td className="px-3 py-1 flex gap-2">
                      {editIndex === i ? (
                        <button className="text-blue-600" onClick={() => {
                          if (isValidPhone(allContacts[i].phone)) {
                            setEditIndex(null);
                            setError('');
                          } else {
                            setError('Please correct the phone number before saving.');
                          }
                        }}>✅</button>
                      ) : (
                        <button className="text-yellow-600" onClick={() => setEditIndex(i)}>✏️</button>
                      )}
                      <button
                        className="text-red-600"
                        onClick={() => setAllContacts(prev => prev.filter((_, idx) => idx !== i))}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-3">
  <button
    type="button"
    className="bg-blue-500 text-white px-4 py-1 rounded"
    onClick={() => inputRefs.excel.current.click()} // ✅ use new input ref
  >
    📁 Upload Excel
  </button>
  <input
    ref={inputRefs.excel} // ✅ use new input ref here
    type="file"
    accept=".xlsx,.xls,.csv"
    className="hidden"
    onChange={handleExcelUpload}
  />
</div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleSendMessages}
            disabled={isSending}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send Message'}
          </button>
          <button
            onClick={resetForm}
            className="bg-gray-400 text-white px-4 py-2 rounded w-full"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Progress */}
      {showProgress && report && (
        <div className="w-full col-span-2 mt-6">
          <MessageProgress
            key={progressKey}
            totalMessages={allContacts.length}
            sentNumbers={report?.sent || []}
            failedNumbers={report?.failed || []}
          />
        </div>
      )}
    </div>
  );
};

export default MessageForm;