import React from "react";

const Header = () => {
  return (
    <header className="bg-green-700 text-white flex items-center justify-between px-6 py-4">
      <h1 className="text-xl font-semibold">LC WA Bulk Messenger</h1>
      <nav className="flex gap-8 text-lg">
        <a href="/Homepage" className="hover:underline">Home</a>
        <a href="#" className="hover:underline">About</a>
        <a href="/services" className="hover:underline">Services</a>
        <a href="#" className="hover:underline">Contact</a>
      </nav>
      <div className="flex items-center gap-4">
        {/* <select className="bg-white text-black px-2 py-1 rounded">
          <option>English</option>
          <option>தமிழ்</option>
          <option>हिंदी</option>
        </select>
        <span>0.09</span>
        <button className="text-white text-2xl">✕</button> */}


       <a
          href="/"
          onClick={(e) => {
            e.preventDefault(); 
            localStorage.removeItem("token"); 
            window.location.href = "/"; 
          }}
          className="bg-white ml-36 text-green-700 text-lg border border-white rounded px-2 py-1 hover:bg-gray-100 transition-all duration-300"
        >
          Logout
        </a>


      </div>
    </header>
  );
};

export default Header;
