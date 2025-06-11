import React from "react";
import logo from "../assets/icon.jpg"; // Update with your logo path

const Header = () => {
  return (
    <header className="bg-green-700 text-white shadow-md">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between px-6 py-4 space-y-4 lg:space-y-0">
        
        {/* Logo + Title */}
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="Logo"
            className="h-12 w-12 z-20 rounded-full object-cover bg-green-700 p-1 drop-shadow-[0_0_8px_white]"
          />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              WhatsApp Bulk Sender
            </h1>
            <p className="text-sm text-green-100">
              Send messages to multiple contacts efficiently
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="text-sm space-x-4">
          <a href="/homepage" className="hover:underline">
            Home
          </a>
          <a href="/manual" className="hover:underline">
            Manual
          </a>
          <a href="/group" className="hover:underline">
           Group
          </a>
          <a href="/history" className="hover:underline">
            History
          </a>
          <a href="/report" className="hover:underline">
            Report
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
