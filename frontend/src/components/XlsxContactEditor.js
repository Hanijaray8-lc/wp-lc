import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import logo from '../assets/icon.jpg'; // Adjust logo path
import Header from './Header';

const XlsxContactEditor = () => {
  // Your existing states and handlers here...
  const fileInputRef = useRef(null);
  const [contacts, setContacts] = useState([]);
  const [fileName, setFileName] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  // Handlers like handleFileChange, handleAdd, handleEdit, handleSave, handleDelete, handleExport...

  // New handlers for buttons:
  const handleCreateNew = () => {
    setContacts([]); // reset contacts for new file
    setFileName('');
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    // your existing code to load file and parse...
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const parsedContacts = jsonData.slice(1).map((row, index) => ({
        id: index + 1,
        name: row[0] || '',
        phone: row[1] || '',
      }));

      setContacts(parsedContacts);
    };

    reader.readAsArrayBuffer(file);
  };

  // ... other handlers (handleEdit, handleSave, handleDelete, handleAdd, handleExport) unchanged

  return (
    <div>
      <Header />
    <div className="min-h-screen bg-green-600">
      {/* Header */}
            {/* <header className="bg-green-700 text-white shadow-md">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between px-6 py-4 space-y-4 lg:space-y-0"> */}
          
          {/* Logo + Title */}
          {/* <div className="flex items-center gap-4">
            {/* Logo (Replace src with your image path) */}
        {/* <img
        src={logo}
        alt="Logo"
        className="h-12 w-12 z-20 rounded-full object-cover bg-green-700 p-1 drop-shadow-[0_0_8px_white]"
      />
        */}
      
            {/* <div>
              <h1 className="text-2xl lg:text-3xl text-white font-bold tracking-tight">
                WhatsApp Bulk Sender
              </h1>
              <p className="text-sm text-green-100">Send messages to multiple contacts efficiently</p>
            </div>
          </div>
       */}
          {/* Optional nav or button (extendable) */}
          {/* <nav className="text-sm space-x-4">
            <a href="#" className="hover:underline">Home</a>
            <a href="#" className="hover:underline">Campaigns</a>
          </nav> */}
      
        {/* </div>
      </header> */}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded">
          {/* Buttons for New and Choose Existing */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleCreateNew}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + New Create
            </button>

            <button
              onClick={handleChooseFileClick}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Choose Existing File
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          </div>

          {/* Show loaded file name */}
          {fileName && (
            <p className="mb-4 font-medium">
              Loaded File: <span className="italic">{fileName}</span>
            </p>
          )}

          {/* Add New Contact */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="border p-2 rounded w-1/2"
            />
            <input
              type="text"
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="border p-2 rounded w-1/2"
            />
            <button
  onClick={() => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      alert('Please enter both name and phone number.');
      return;
    }
    setContacts([...contacts, { id: Date.now(), ...newContact }]);
    setNewContact({ name: '', phone: '' });
  }}
  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
>
  Add
</button>

          </div>

          {contacts.length > 0 ? (
            <>
              <table className="w-full border border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">S.No</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Phone</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c, i) => (
                    <tr key={i} className="text-center">
                      <td className="border p-2">{i + 1}</td>
                      <td className="border p-2">
                        {editIndex === i ? (
                          <input
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="border p-1 rounded"
                            autoFocus
                          />
                        ) : (
                          c.name
                        )}
                      </td>
                      <td className="border p-2">
                        {editIndex === i ? (
                          <input
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            className="border p-1 rounded"
                          />
                        ) : (
                          c.phone
                        )}
                      </td>
                      <td className="border p-2 space-x-2">
                        {editIndex === i ? (
                          <button
                            onClick={() => {
                              const updated = [...contacts];
                              updated[editIndex] = { ...updated[editIndex], ...editData };
                              setContacts(updated);
                              setEditIndex(null);
                            }}
                            className="text-green-600 font-medium"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditIndex(i);
                              setEditData({ name: contacts[i].name, phone: contacts[i].phone });
                            }}
                            className="text-green-600 font-medium"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setContacts(contacts.filter((_, idx) => idx !== i));
                            if (editIndex === i) setEditIndex(null);
                          }}
                          className="text-red-600 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Export Button */}
              <button
                onClick={() => {
                  const wsData = [
                    ['Name', 'Phone'], // Header
                    ...contacts.map((c) => [c.name, c.phone]),
                  ];
                  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');
                  XLSX.writeFile(workbook, 'updated_contacts.xlsx');
                }}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Download Updated Excel
              </button>
            </>
          ) : (
            <p className="text-center text-gray-500">
              {fileName ? 'No contacts found in this file.' : 'Create new or choose a file to start.'}
            </p>
          )}
        </div>
      </main>
    </div>
        </div>
  );
};

export default XlsxContactEditor;