import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import tick from '../../assets/tick.png';

const WhatsAppAuth = ({ onAuthenticated }) => {
  const [qrCode, setQrCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [justAuthenticated, setJustAuthenticated] = useState(false);
  const [countdown, setCountdown] = useState(10); // ⏱️ Countdown state
  const socketRef = useRef(null);
  const sessionIdRef = useRef(null); // Use a ref to store the sessionId

  // Effect to retrieve sessionId from localStorage and establish initial auth state
  useEffect(() => {
    // Attempt to get sessionId from localStorage. This should have been set by LoginForm.
    const storedSessionId = localStorage.getItem('sessionId');

    if (!storedSessionId) {
      console.warn("Session ID not found in localStorage. User might not be logged in or session ID not set correctly by LoginForm.");
      setIsLoading(false); // Stop loading if no session ID to prevent infinite spinner
      return; // Exit if no session ID, user needs to log in
    }

    sessionIdRef.current = storedSessionId; // Store the session ID in the ref

    const isStoredAuthenticated = localStorage.getItem('whatsapp-authenticated') === 'true';

    if (isStoredAuthenticated) {
      console.log('⚡ Already authenticated — start countdown');
      setIsAuthenticated(true);
      setIsLoading(false);
      setJustAuthenticated(true);
      startCountdown(); // Call startCountdown here if already authenticated
      onAuthenticated(true); // Inform parent component if already authenticated
    } else {
      setIsLoading(true); // Still loading if not authenticated but have a session ID
    }
  }, [onAuthenticated]); // Depend on onAuthenticated

  // Effect for Socket.IO connection and events
  useEffect(() => {
    if (!sessionIdRef.current) {
      // Do not proceed if sessionId is not available
      console.log("No session ID to connect with Socket.IO.");
      return;
    }

    // Connect with the retrieved sessionId
    const socket = io('${process.env.REACT_APP_API_URL}', {
      query: { sessionId: sessionIdRef.current }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`📡 Connected to backend with session ID: ${sessionIdRef.current}`);
    });

    socket.on('qr', (qrString) => {
      console.log('📸 QR code received');
      setQrCode(qrString);
      setIsLoading(false);
      setIsAuthenticated(false); // Reset authenticated state if QR is shown again
      setJustAuthenticated(false);
    });

    socket.on('authenticated', () => {
      console.log('✅ WhatsApp authenticated!');
      localStorage.setItem('whatsapp-authenticated', 'true');
      setIsAuthenticated(true);
      setIsLoading(false);
      setJustAuthenticated(true);
      startCountdown(); // Start countdown after new authentication
      onAuthenticated(true); // Inform parent component
    });

    socket.on('ready', () => {
      console.log('✅ WhatsApp client ready!');
      // 'ready' can also indicate authentication is complete or preserved
      localStorage.setItem('whatsapp-authenticated', 'true');
      setIsAuthenticated(true);
      setIsLoading(false);
      setJustAuthenticated(true);
      startCountdown();
      onAuthenticated(true);
    });

    socket.on('disconnected', (reason) => {
      console.warn('❌ WhatsApp disconnected:', reason);
      localStorage.removeItem('whatsapp-authenticated');
      setIsAuthenticated(false);
      setJustAuthenticated(false);
      setQrCode('');
      setCountdown(10); // Reset countdown
      // setIsLoading(true); // You might want to remove this if you don't want it to keep trying to reconnect indefinitely
      // If disconnected, it's likely a fresh QR will be needed.
      // The backend should handle re-initializing the client and sending a new QR.
    });

    socket.on('disconnect', () => {
      console.log('🔗 Socket disconnected from server');
    });

    // Cleanup function for useEffect
    return () => {
      console.log('🔌 Disconnecting socket...');
      socket.disconnect();
    };
  }, [sessionIdRef.current, onAuthenticated]); // Re-run effect if sessionId changes or onAuthenticated changes

  const startCountdown = () => {
    setCountdown(10); // Reset countdown
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setJustAuthenticated(false); // Hide the success message after countdown
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  const handleReset = async () => {
    console.log('🔄 Clearing WhatsApp session...');
    const sessionId = sessionIdRef.current; // Get session ID from ref

    if (!sessionId) {
      console.error("Cannot clear session: No session ID found.");
      return;
    }

    try {
      // Call backend API to destroy the WhatsApp client session
      await fetch('${process.env.REACT_APP_API_URL}/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }) // Send the specific sessionId to logout
      });

      // Clear frontend state
      localStorage.removeItem('whatsapp-authenticated');
      localStorage.removeItem('sessionId'); // Also clear the sessionId from localStorage
      setIsAuthenticated(false);
      setJustAuthenticated(false);
      setQrCode('');
      setCountdown(10);
      setIsLoading(true); // Go back to loading state to await new QR or session
      // Optionally, force a full page reload or navigate to login page
      window.location.reload();

    } catch (error) {
      console.error('❌ Failed to clear WhatsApp session:', error);
    }
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold mb-4">WhatsApp Authentication</h2>
        <p className="text-gray-500">Loading QR code...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">WhatsApp Authentication</h2>

      {!isAuthenticated && (
        <button
          onClick={handleReset}
          className="text-sm text-red-600 underline mb-4"
        >
          🔄 Clear WhatsApp Session
        </button>
      )}

      {/* 📸 QR code */}
      {!isLoading && !isAuthenticated && qrCode && (
        <>
          <div className="flex justify-center mb-4">
            {qrCode.startsWith('data:image') ? (
              <img src={qrCode} alt="WhatsApp QR" width={256} height={256} />
            ) : (
              <QRCodeSVG value={qrCode} size={256} />
            )}
          </div>
          <p className="text-gray-600">Scan this QR code with WhatsApp to authenticate.</p>
        </>
      )}

      {/* ✅ Auth success with countdown */}
      {justAuthenticated && (
        <div className="p-4 bg-green-100 rounded-lg text-center">
          <p className="text-green-800 font-medium text-lg mb-2">
            ✅ WhatsApp connected successfully!
          </p>
          <img src={tick} alt="Success" className="mx-auto" width={200} height={200} />
          <p className="text-gray-700 mt-2">
            Redirecting in {countdown} seconds...
          </p>
        </div>
      )}
    </div>
  );
};

export default WhatsAppAuth;