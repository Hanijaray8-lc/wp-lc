import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import tick from '../assets/tick.png'; // Adjust the path as necessary

const WhatsAppAuth = ({ onAuthenticated }) => {
  const [qrCode, setQrCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(null);

  // ✅ Check localStorage on initial render
  useEffect(() => {
    const isStoredAuthenticated = localStorage.getItem('whatsapp-authenticated') === 'true';
    if (isStoredAuthenticated) {
      setIsAuthenticated(true);
      setIsLoading(false);
      onAuthenticated(true);
    }
  }, [onAuthenticated]);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    const socket = socketRef.current;

    // 📤 Received QR code from backend
    socket.on('qr', (qrString) => {
      console.log('Received QR string:', qrString);
      setQrCode(qrString);
      setIsAuthenticated(false);
    });

    // ✅ Authenticated
    socket.on('authenticated', () => {
      localStorage.setItem('whatsapp-authenticated', 'true');
      setIsAuthenticated(true);
      onAuthenticated(true);
    });

    // ✅ Ready
    socket.on('ready', () => {
      localStorage.setItem('whatsapp-authenticated', 'true');
      setIsAuthenticated(true);
      onAuthenticated(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [onAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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
        </div>
      )}
    </div>
  );
};

export default WhatsAppAuth;
