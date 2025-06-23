import React, { useEffect, useState } from 'react';

const MessageProgress = ({ totalMessages = 50 }) => {
  const [sent, setSent] = useState(0);
  const [failed, setFailed] = useState(0);
  const [pending, setPending] = useState(totalMessages);
  const [statusText, setStatusText] = useState('Starting to send messages...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sent + failed < totalMessages) {
        const isSuccess = Math.random() > 0.1;
        if (isSuccess) setSent((prev) => prev + 1);
        else setFailed((prev) => prev + 1);
        setPending((prev) => prev - 1);
        setProgress(((sent + failed + 1) / totalMessages) * 100);
        setStatusText(`Sending messages... ${sent + failed + 1} of ${totalMessages}`);
      } else {
        clearInterval(interval);
        setStatusText('Message sending completed.');
      }
    }, 200);

    return () => clearInterval(interval);
  }, [sent, failed, totalMessages]);

  return (
    <div className="bg-white shadow rounded p-4 m-4">
      <h2 className="font-semibold text-lg mb-4">Message Sending Progress</h2>
      <div className="w-full bg-gray-200 rounded h-4 mb-4">
        <div
          className="bg-green-500 h-4 rounded transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-center mb-4">
        <div>
          <p className="text-green-600 font-bold">{sent}</p>
          <p>Messages Sent</p>
        </div>
        <div>
          <p className="text-yellow-600 font-bold">{pending}</p>
          <p>Messages Pending</p>
        </div>
        <div>
          <p className="text-red-600 font-bold">{failed}</p>
          <p>Messages Failed</p>
        </div>
      </div>
      <div className="border rounded p-2 text-sm text-gray-600">
        <p>{statusText}</p>
      </div>
    </div>
  );
};

export default MessageProgress; 