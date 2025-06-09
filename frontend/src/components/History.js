import { useEffect, useState } from 'react';
import Header from './Header'; // Import the Header component
export default function CampaignHistory() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://wp-lc.onrender.com/api/whatsapp/campaign-history') // adjust if your route base path is different
      .then(res => res.json())
      .then(data => {
        setCampaigns(data.campaigns);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load campaign history.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-blue-500">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
           <Header />
    <div className="max-w-4xl mx-auto mt-6 p-4 bg-white rounded-xl  shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📜 Campaign History</h2>

      {campaigns.length === 0 ? (
        <p>No campaign history found.</p>
      ) : (
        <div className="space-y-4">
          {campaigns.map((camp, index) => (
            <div key={index} className="border p-4 rounded-md shadow-sm">
              <p><strong>Date:</strong> {new Date(camp.date).toLocaleString()}</p>
              <p><strong>Message:</strong> {camp.message}</p>
              <p><strong>Total:</strong> {camp.totalContacts}</p>
              <p><strong>Success:</strong> {camp.successful}</p>
              <p><strong>Failed:</strong> {camp.failed}</p>

              {camp.media && (
                <p>
                  <strong>Media:</strong> {camp.media.name} ({(camp.media.size / 1024).toFixed(2)} KB)
                </p>
              )}

              {camp.failedNumbers?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-600">View Failed Numbers</summary>
                  <ul className="list-disc list-inside text-sm mt-1">
                    {camp.failedNumbers.map((num, idx) => (
                      <li key={idx}>{num}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
