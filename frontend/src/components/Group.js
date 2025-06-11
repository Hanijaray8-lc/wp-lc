import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserShield, FaUsers } from 'react-icons/fa';
import { IoCheckmarkCircleSharp, IoCloseCircle } from 'react-icons/io5';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import Header from './Header'; // Assuming you have a Header component

function App() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/groups/my-groups');
      setGroups(res.data.groups || []);
    } catch (err) {
      console.error('Failed to load groups:', err);
      alert('Error fetching groups. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const isMemberSelected = (member) => {
    return selectedMembers.some((m) => m.number === member.number);
  };

  const toggleSelectMember = (member) => {
    if (isMemberSelected(member)) {
      setSelectedMembers((prev) => prev.filter((m) => m.number !== member.number));
    } else {
      setSelectedMembers((prev) => [...prev, member]);
    }
  };

 const selectGroupMembers = (members) => {
  const allSelected = isAllGroupSelected(members);

  if (allSelected) {
    // Deselect all members from this group
    setSelectedMembers((prev) =>
      prev.filter((m) => !members.some((gm) => gm.number === m.number))
    );
  } else {
    // Select all members from this group (only those not already selected)
    const newMembers = members.filter(
      (member) => !selectedMembers.some((m) => m.number === member.number)
    );
    setSelectedMembers((prev) => [...prev, ...newMembers]);
  }
};

  const removeMember = (number) => {
    setSelectedMembers((prev) => prev.filter((m) => m.number !== number));
  };

  const clearAllSelectedMembers = () => {
    setSelectedMembers([]);
  };

  const isAllGroupSelected = (members) =>
    members.every((member) => isMemberSelected(member));

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-green-600 p-6 font-sans">
        <header className="text-white text-3xl font-bold text-center mb-8">
          WhatsApp Group Members
        </header>

        {loading ? (
          <div className="text-white text-center">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="text-white text-center">No groups found.</div>
        ) : (
          <>
            {/* Group Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {groups.map((group, index) => (
                <div key={index} className="bg-white text-[#075E54] rounded-lg shadow-md p-5">
                  <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-[#075E54]">
                    <FaUsers className="text-[#25D366]" />
                    {group.groupName}
                  </h2>

                  <button
                    onClick={() => selectGroupMembers(group.members)}
                    className="flex items-center gap-2 text-green"
                  ><span className="text-sm">Select All</span>
                    {isAllGroupSelected(group.members) ? (
                      <MdCheckBox className="text-xl" />
                    ) : (
                      <MdCheckBoxOutlineBlank className="text-xl" />
                    )}
                    
                  </button>
                </div>

                  <p className="text-xs text-gray-500 mb-3">Group ID: {group.groupId}</p>

                  <div className="border-t border-gray-200 pt-2">
                    <p className="text-sm font-semibold text-[#128C7E] mb-2">Members:</p>
                    <ul className="max-h-40 overflow-y-auto space-y-2">
                      {group.members.map((member, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between border p-2 rounded bg-[#F0FDF4]"
                        >
                          <div>
                            <p className="font-medium text-[#075E54]">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.number}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {member.isAdmin && (
                              <span className="text-xs text-yellow-600 flex items-center gap-1">
                                <FaUserShield /> Admin
                              </span>
                            )}
                            <button onClick={() => toggleSelectMember(member)} title="Select/Unselect">
                              <IoCheckmarkCircleSharp
                                className={`text-2xl ${
                                  isMemberSelected(member)
                                    ? 'text-green-600'
                                    : 'text-gray-300 hover:text-green-500'
                                }`}
                              />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Members and Send Message section */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Selected Members */}
                <div className="flex-1 bg-white p-5 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-[#075E54]">Selected Members</h3>
                    <button
                      onClick={clearAllSelectedMembers}
                      className="text-sm text-red-600 border border-red-600 px-2 py-1 rounded hover:bg-red-100"
                    >
                      Clear All
                    </button>
                  </div>
                  <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedMembers.map((member, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between border p-2 rounded bg-[#E0F7FA]"
                      >
                        <div>
                          <p className="font-medium text-[#075E54]">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.isAdmin && (
                            <span className="text-xs text-yellow-600 flex items-center gap-1">
                              <FaUserShield /> Admin
                            </span>
                          )}
                          <button onClick={() => removeMember(member.number)} title="Remove">
                            <IoCloseCircle className="text-2xl text-red-500 hover:text-red-700" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Send Message */}
                <div className="flex-1 bg-white p-5 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4 text-[#075E54]">Send Message</h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData();
                      formData.append('message', e.target.message.value);

                      const fileInput = e.target.file;
                      if (fileInput.files.length > 0) {
                        formData.append('file', fileInput.files[0]);
                      }

                      formData.append(
                        'recipients',
                        JSON.stringify(selectedMembers.map((m) => m.number))
                      );

                      try {
                        await axios.post('http://localhost:5000/api/groups/send-to-members', formData, {
                          headers: {
                            'Content-Type': 'multipart/form-data',
                          },
                        });
                        alert('Message sent!');
                        e.target.reset();
                      } catch (err) {
                        console.error('Send error:', err);
                        alert('Failed to send message.');
                      }
                    }}
                  >
                    <textarea
                      name="message"
                      rows="10"
                      placeholder="Type your message"
                      className="w-full p-2 border border-gray-300 rounded mb-3"
                    ></textarea>

                    <input
                      type="file"
                      name="file"
                      accept="application/pdf,image/*,video/*,audio/*"
                      className="block mb-4"
                    />

                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Send to Selected Members
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
