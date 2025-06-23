import React from 'react';
import { FaBars, FaUsers, FaRobot, FaMapMarkedAlt, FaListUl, FaPlusSquare } from 'react-icons/fa';
import { MdOutlineContactPage, MdOutlineGroupAdd, MdOutlineGroups, MdOutlinePoll } from 'react-icons/md';
import { AiOutlineWhatsApp, AiOutlineSearch, AiOutlineFilter, AiOutlineFileText } from 'react-icons/ai';
import { IoMdChatboxes } from 'react-icons/io';
import { RiGlobalLine } from 'react-icons/ri';
import { BiSpreadsheet } from 'react-icons/bi';

const tools = [
  { title: 'Get Group Member', button: 'GRAB NOW', icon: <FaUsers size={32} className="text-green-600" /> },
  { title: 'Grab WhatsApp Group Links from web page', button: 'GRAB NOW', icon: <AiOutlineWhatsApp size={32} className="text-green-600" /> },
  { title: 'WhatsApp Auto Responder Bot', button: 'START NOW', icon: <FaRobot size={32} className="text-green-600" /> },
  { title: 'Contact List Grabber', button: 'GRAB NOW', icon: <MdOutlineContactPage size={32} className="text-green-600" /> },
  { title: 'Google Map Data Extractor', button: 'GRAB NOW', icon: <FaMapMarkedAlt size={32} className="text-green-600" /> },
  { title: 'Auto Group Joiner', button: 'START NOW', icon: <MdOutlineGroupAdd size={32} className="text-green-600" /> },
  { title: 'WhatsApp Number Filter', button: 'START NOW', icon: <AiOutlineFilter size={32} className="text-green-600" /> },
  { title: 'Grab Active Group Members', button: 'GRAB NOW', icon: <MdOutlineGroups size={32} className="text-green-600" /> },
  { title: 'Grab Chat List', button: 'GRAB NOW', icon: <IoMdChatboxes size={32} className="text-green-600" /> },
  { title: 'Bulk Add Group Members', button: 'START NOW', icon: <FaPlusSquare size={32} className="text-green-600" /> },
  { title: 'Group Finder', button: 'START NOW', icon: <AiOutlineSearch size={32} className="text-green-600" /> },
  { title: 'Bulk Group Generator', button: 'START NOW', icon: <AiOutlineFileText size={32} className="text-green-600" /> },
  { title: 'Google Contacts CSV Generator', button: 'START NOW', icon: <BiSpreadsheet size={32} className="text-green-600" /> },
  { title: 'Website E-Mail Mobile Extractor', button: 'START NOW', icon: <RiGlobalLine size={32} className="text-green-600" /> },
  { title: 'Get Poll Results', button: 'START NOW', icon: <MdOutlinePoll size={32} className="text-green-600" /> },
  { title: 'Social Media Data Extractor', button: 'START NOW', icon: <AiOutlineWhatsApp size={32} className="text-green-600" /> },
];

const ToolCard = ({ title, button, icon }) => (
  <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between text-center hover:shadow-md transition">
    <div className="mb-4 h-20 flex flex-col items-center justify-center gap-2">
      {icon}
      <div className="text-gray-700 text-sm font-semibold">{title}</div>
    </div>
    <button className="bg-green-600 text-white font-semibold py-1 rounded hover:bg-green-700 text-sm">
      ▶ {button}
    </button>
  </div>
);

export default function ToolDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <header className="bg-green-700 text-white py-3 shadow">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaBars className="text-xl" />
            <h1 className="text-lg font-bold">LC WA Bulk Messenger</h1>
          </div>
          <nav className="hidden md:flex space-x-4">
            <a href="#" className="hover:underline">Home</a>
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Services</a>
            <a href="#" className="hover:underline">Contact</a>
          </nav>
          <div className="bg-white text-green-600 text-sm px-3 py-1 rounded">
            English ▾ 0.09
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="text-center py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Lot more tools to make your life easy
        </h2>
      </div>

      {/* Grid of Tools */}
      <div className="max-w-7xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tools.map((tool, index) => (
          <ToolCard key={index} {...tool} />
        ))}
      </div>
    </div>
  );
}
