import React from 'react';

const Header = () => (
  <header className="bg-green-700 text-white flex items-center justify-between px-6 py-3 shadow">
    <h1 className="text-lg font-semibold">LC WA Bulk Messenger</h1>
    <nav className="flex items-center gap-6">
      {/* These links seem to be placeholders. You might want to use React Router's <Link> component instead of <a> tags for client-side routing. */}
      <a href="/Homepage" className="hover:underline">Home</a> {/* Changed to actual path */}
      <a href="/dashboard" className="hover:underline">Dashboard</a> {/* Example path */}
      <a href="/send-message" className="hover:underline flex items-center"><span className="mr-1">▶</span>Send Message</a> {/* Example path */}
      <a href="/settings" className="hover:underline">Settings</a> {/* Example path */}
    </nav>
    <div>
      <span className="mr-2">🔔</span>
      {/* This should dynamically show the logged-in username */}
      <span>User Name ⌄</span>
    </div>
  </header>
);

export default Header;