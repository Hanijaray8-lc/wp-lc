import React from "react";
import { FaPaperPlane, FaUpload, FaCog, FaUserCircle, FaClock, FaChartBar, FaTags, FaImages, FaCogs, FaLifeRing } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";

const tools = [
  {
    title: "Send Message",
    description: "Broadcast messages to multiple contacts or groups.",
    icon: <FaPaperPlane size={40} />,
    action: "LAUNCH",
  },
  {
    title: "Upload CSV",
    description: "Import contact lists from CSV files for bulk messaging.",
    icon: <FaUpload size={40} />,
    action: "UPLOAD",
  },
  {
    title: "Message Templates",
    description: "Create and manage pre-defined message templates.",
    icon: <MdManageAccounts size={40} />,
    action: "MANAGE",
  },
  {
    title: "Schedule Broadcast",
    description: "Set date and time for automated message delivery.",
    icon: <FaClock size={40} />,
    action: "SET UP",
  },
  {
    title: "Delivery Reports",
    description: "Track the status of your sent messages.",
    icon: <FaChartBar size={40} />,
    action: "VIEW",
  },
  {
    title: "Contact Management",
    description: "Organize and manage your contact lists.",
    icon: <FaUserCircle size={40} />,
    action: "MANAGE",
  },
  {
    title: "Personalization Tags",
    description: "Customize messages with dynamic content.",
    icon: <FaTags size={40} />,
    action: "USE TAGS",
  },
  {
    title: "Multimedia Support",
    description: "Send images, videos, and documents in bulk.",
    icon: <FaImages size={40} />,
    action: "ADD MEDIA",
  },
  {
    title: "Settings",
    description: "Configure application preferences and options.",
    icon: <FaCogs size={40} />,
    action: "CONFIGURE",
  },
  {
    title: "Help & Support",
    description: "Access documentation and support channels.",
    icon: <FaLifeRing size={40} />,
    action: "GET HELP",
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-700 text-white flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-semibold">LC WA Bulk Messenger</h1>
        <nav className="flex gap-6">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Services</a>
          <a href="#" className="hover:underline">Contact</a>
        </nav>
        <div className="flex items-center gap-4">
          <select className="bg-white text-black px-2 py-1 rounded">
            <option>English</option>
            <option>தமிழ்</option>
            <option>हिंदी</option>
          </select>
          <span>0.09</span>
          <button className="text-white text-2xl">✕</button>
        </div>
      </header>

      <main className="p-6">
        <h2 className="text-2xl font-bold text-center mb-8">WA Bulk Message Interface Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {tools.map((tool, idx) => (
            <div key={idx} className="bg-white p-6 rounded shadow text-center">
              <div className="mb-4 flex justify-center">{tool.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                {tool.action}
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-green-700 text-white text-center py-4 mt-10">
        © 2025 LC WA Bulk Messenger. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;
