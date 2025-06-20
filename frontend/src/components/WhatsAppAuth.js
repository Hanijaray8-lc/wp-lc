import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import tick from '../assets/tick.png';

const WhatsAppAuth = ({ onAuthenticated }) => {
  const [qrCode, setQrCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(null);
  const sessionIdRef = useRef(null);

  if (!sessionIdRef.current) {
    let storedId = localStorage.getItem('whatsapp-session-id');
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem('whatsapp-session-id', storedId);
    }
    sessionIdRef.current = storedId;
    localStorage.setItem('sessionId', storedId);
  }

  useEffect(() => {
    const isStoredAuthenticated = localStorage.getItem('whatsapp-authenticated') === 'true';
    if (isStoredAuthenticated) {
      setIsAuthenticated(true);
      setIsLoading(false);
      onAuthenticated(true);
    }
  }, [onAuthenticated]);

  useEffect(() => {
    socketRef.current = io('https://wp-lc.onrender.com', {
      query: { sessionId: sessionIdRef.current }
    });

    const socket = socketRef.current;

    socket.on('qr', (qrString) => {
      setQrCode(qrString);
      setIsAuthenticated(false);
      setIsLoading(false);
    });

    socket.on('authenticated', () => {
      localStorage.setItem('whatsapp-authenticated', 'true');
      setIsAuthenticated(true);
      setIsLoading(false);
      onAuthenticated(true);
    });

    socket.on('ready', () => {
      localStorage.setItem('whatsapp-authenticated', 'true');
      setIsAuthenticated(true);
      setIsLoading(false);
      onAuthenticated(true);
    });

    socket.on('disconnected', (reason) => {
      console.warn('WhatsApp disconnected:', reason);
      localStorage.removeItem('whatsapp-authenticated');
      setIsAuthenticated(false);
      setQrCode('');
      setIsLoading(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [onAuthenticated]);

  const handleLogout = async () => {
    const sessionId = sessionIdRef.current;

    try {
      await fetch('https://wp-lc.onrender.com/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      localStorage.removeItem('whatsapp-authenticated');
      setIsAuthenticated(false);
      setQrCode('');
      setIsLoading(true);
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">WhatsApp Authentication</h2>

      {!isAuthenticated ? (
        <>
          <div className="flex justify-center mb-4">
            {qrCode && (
              qrCode.startsWith('data:image') ? (
                <img src={qrCode} alt="WhatsApp QR" width={256} height={256} />
              ) : (
                <QRCodeSVG value={qrCode} size={256} />
              )
            )}
          </div>
          <p className="text-center text-gray-600">
            Scan this QR code with WhatsApp on your phone to authenticate.
          </p>
        </>
      ) : (
        <div className="text-center p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 font-medium">WhatsApp authenticated successfully!</p>
          <img src={tick} alt="Success" className="mx-auto mt-4" width={200} height={200} />
          {/* <button
            onClick={handleLogout}
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button> */}
        </div>
      )}
    </div>
  );
};

export default WhatsAppAuth;
