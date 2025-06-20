import React from "react";
import {
  FaPaperPlane,
  FaFileCsv,
  FaAddressBook,
  FaUsersCog,
  FaLink,
  FaRobot,
  FaHistory,
  FaChartLine,
  FaCogs,
  FaLifeRing,
} from "react-icons/fa";
import Home from "./Navbar";

const Dashboard = () => {
 const tools = [
  {
    title: "Send Message",
    description: "Send messages instantly to selected contacts.",
    icon: <FaPaperPlane size={40} />,
    action: "Send Now",
    path: "/manual",
  },
  {
    title: "Contacts CSV Generator",
    description: "Upload and generate contact lists from CSV files",
    icon: <FaFileCsv size={40} />,
    action: "Generate CSV",
    path: "/xl",
  },
  {
    title: "Contact List Grabber",
    description: "Extract contacts automatically from sources.",
    icon: <FaAddressBook size={40} />,
    action: "Grab Contacts",
    path: "/contacts",
  },
  {
    title: "Group Management",
    description: "Organize contacts into custom groups.",
    icon: <FaUsersCog size={40} />,
    action: "Manage Groups",
    path: "/group",
  },
  {
    title: "Website Link Contact Number Extractor",
    description: "Extract mobile numbers directly from any website URL with ease.",
    icon: <FaLink size={40} />,
    action: "Extract Numbers",
    path: "/extractor",
  },
  {
    title: "Auto Responder Bot",
    description: "Auto-reply to WhatsApp messages with rules.",
    icon: <FaRobot size={40} />,
    action: "Set Rules",
    path: "/auto",
  },
  {
    title: "History",
    description: "View past messages and activity logs.",
    icon: <FaHistory size={40} />,
    action: "View History",
    path: "/history",
  },
  {
    title: "Delivery Reports",
    description: "Track delivery status and view performance reports.",
    icon: <FaChartLine size={40} />,
    action: "View Reports",
    path: "/Report",
  },
  {
    title: "Settings",
    description: "Manage system preferences and configurations.",
    icon: <FaCogs size={40} />,
    action: "Update Settings",
    path: "/settings",
  },
  {
    title: "Help & Support",
    description: "Get assistance and find answers to questions.",
    icon: <FaLifeRing size={40} />,
    action: "Get Support",
    path: "/help-support",
  },
];

  return (
    <div>
      <Home />
    <div className="min-h-screen bg-gray-100">
      {/* <header className="bg-green-700 text-white flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-semibold">LC WA Bulk Messenger</h1>
        <nav className="flex gap-6">
          <a href="/Homepage" className="hover:underline">Home</a>
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
      </header> */}

      <main className="p-6">
        <h2 className="text-2xl font-bold text-center mb-8">
          WA Bulk Message Interface Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {tools.map((tool, idx) => (
            <div key={idx} className="bg-white p-6 rounded shadow text-center">
              <div className="mb-4 flex justify-center">{tool.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
              <a
                href={tool.path}
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {tool.action}
              </a>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-green-700 text-white text-center py-4 mt-10">
        © 2025 LC WA Bulk Messenger. All rights reserved.
      </footer>
    </div>
    </div>
  );
};

export default Dashboard;
