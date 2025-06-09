import { useEffect, useState } from 'react';
import React from 'react';
import Header from './Header'; // Import the Header component

export default function CampaignReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/api/whatsapp/latest-campaign') // adjust URL as needed
      .then(res => res.json())
      .then(data => {
        setReport(data.report);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load campaign report.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-blue-500">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div> 
       <Header /> 
  
    <div className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Latest Campaign Report</h2>
      <ul className="space-y-2">
        <li><strong>Total Contacts:</strong> {report.total}</li>
        <li><strong>Successful:</strong> {report.success}</li>
        <li><strong>Failed:</strong> {report.failed}</li>
      </ul>

      {report.failed > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-red-600">Failed Numbers:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 max-h-40 overflow-y-auto">
            {report.failedNumbers.map((num, idx) => (
              <li key={idx}>{num}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
      </div>
  );
}
