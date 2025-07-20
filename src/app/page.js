"use client";

import React, { useState, useEffect, useRef } from "react";

export default function VapiPhoneInterface() {
  const [callStatus, setCallStatus] = useState({ status: "idle" });
  const [isVapiLoaded, setIsVapiLoaded] = useState(false);
  const vapiClientRef = useRef(null);
  const durationIntervalRef = useRef(null);
  // Added for mute functionality, which is common in phone interfaces
  const [isMuted, setIsMuted] = useState(false);

  // Replace with your actual Vapi credentials
  const VAPI_API_KEY =
    process.env.NEXT_PUBLIC_VAPI_API_KEY || "your-vapi-api-key";
  const ASSISTANT_ID =
    process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "your-assistant-id";

  useEffect(() => {
    // Load Vapi SDK
    const loadVapiSDK = () => {
      if (typeof window !== "undefined" && !window.vapiSDK) {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
        script.onload = () => {
          setIsVapiLoaded(true);
        };
        script.onerror = () => {
          setCallStatus({ status: "error", error: "Failed to load Vapi SDK" });
        };
        document.head.appendChild(script);
      } else if (window.vapiSDK) {
        setIsVapiLoaded(true);
      }
    };

    loadVapiSDK();
  }, []);

  useEffect(() => {
    if (isVapiLoaded && window.vapiSDK) {
      // Initialize Vapi client
      vapiClientRef.current = window.vapiSDK.run({
        apiKey: VAPI_API_KEY,
        assistant: {
          id: ASSISTANT_ID,
        },
      });

      const client = vapiClientRef.current;

      // Set up event listeners
      const handleCallStart = () => {
        setCallStatus({ status: "connecting" });
      };

      const handleCallConnect = () => {
        setCallStatus((prev) => ({
          ...prev,
          status: "connected",
          duration: 0,
        }));
        // Start duration counter
        durationIntervalRef.current = setInterval(() => {
          setCallStatus((prev) => ({
            ...prev,
            duration: (prev.duration || 0) + 1,
          }));
        }, 1000);
      };

      const handleCallEnd = () => {
        setCallStatus({ status: "ended" });
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        setIsMuted(false); // Reset mute status on call end
      };

      const handleCallError = (error) => {
        setCallStatus({
          status: "error",
          error: error?.message || "Call failed",
        });
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        setIsMuted(false); // Reset mute status on error
      };

      // Register event listeners
      client.on("call-start", handleCallStart);
      client.on("speech-start", handleCallConnect); // 'speech-start' is often used to signal active connection
      client.on("call-end", handleCallEnd);
      client.on("error", handleCallError);

      // Cleanup
      return () => {
        client.off("call-start", handleCallStart);
        client.off("speech-start", handleCallConnect);
        client.off("call-end", handleCallEnd);
        client.off("error", handleCallError);

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      };
    }
  }, [isVapiLoaded, VAPI_API_KEY, ASSISTANT_ID]);

  const startCall = async () => {
    if (!vapiClientRef.current) return;
    setCallStatus({ status: "connecting" }); // Optimistic update
    try {
      await vapiClientRef.current.start(ASSISTANT_ID);
    } catch (error) {
      setCallStatus({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to start call",
      });
    }
  };

  const endCall = async () => {
    if (!vapiClientRef.current) return;
    try {
      await vapiClientRef.current.stop();
    } catch (error) {
      console.error("Error ending call:", error);
      setCallStatus({ status: "ended" }); // Force end state even if API call fails
    }
  };

  // Added toggleMute functionality for a phone interface
  const toggleMute = () => {
    if (!vapiClientRef.current) return;
    if (vapiClientRef.current.isMuted()) {
      vapiClientRef.current.unmute();
      setIsMuted(false);
    } else {
      vapiClientRef.current.mute();
      setIsMuted(true);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatusText = () => {
    switch (callStatus.status) {
      case "idle":
        return "AI Assistant";
      case "connecting":
        return "Connecting...";
      case "connected":
        return "AI Assistant"; // During connected, we show the name
      case "ended":
        return "Call Ended";
      case "error":
        return "Connection Error";
      default:
        return "AI Assistant";
    }
  };

  const getSubStatusText = () => {
    switch (callStatus.status) {
      case "idle":
        return "Touch to call";
      case "connecting":
        return "Calling...";
      case "connected":
        return callStatus.duration
          ? formatDuration(callStatus.duration)
          : "00:00";
      case "ended":
        return "Tap to restart";
      case "error":
        return callStatus.error || "Please try again";
      default:
        return "";
    }
  };

  const isCallActive =
    callStatus.status === "connected" || callStatus.status === "connecting";

  if (!isVapiLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center font-sans">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-white mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">Initializing AI system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Background Circles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-purple-600 opacity-10 rounded-full mix-blend-screen animate-blob animation-delay-200"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-80 h-80 bg-blue-600 opacity-10 rounded-full mix-blend-screen animate-blob animation-delay-400"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500 opacity-10 rounded-full mix-blend-screen animate-blob animation-delay-600"></div>
      </div>

      {/* Top Bar (Simulated Phone Status) */}
      <div className="relative z-10 flex justify-between items-center px-6 pt-8 pb-4 bg-gradient-to-b from-gray-950 to-transparent">
        <div className="flex items-center space-x-1 text-xs">
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="font-semibold">5G</span>
          <div className="w-0.5 h-3 bg-white mx-1"></div>{" "}
          {/* Signal separator */}
          <div className="flex items-center space-x-0.5">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          </div>
        </div>
        <div className="text-white text-sm font-medium">
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </div>
        <div className="flex items-center space-x-1 text-xs">
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V19c0 .73.6 1.33 1.33 1.33h8.34c.73 0 1.33-.6 1.33-1.33V5.33C18 4.6 17.4 4 16.67 4z" />
          </svg>
          <span className="font-semibold">98%</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">
        {/* Profile Avatar / Icon */}
        <div
          className={`relative w-40 h-40 rounded-full flex items-center justify-center mb-10 transition-all duration-500 ease-in-out ${
            isCallActive
              ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-xl scale-105 animate-pulse-fade"
              : "bg-gray-800 shadow-lg"
          }`}
        >
          {isCallActive ? (
            // Animated waves for active call
            <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden">
              <span className="absolute w-full h-full bg-white rounded-full opacity-10 animate-wave-1"></span>
              <span className="absolute w-full h-full bg-white rounded-full opacity-10 animate-wave-2"></span>
              <span className="absolute w-full h-full bg-white rounded-full opacity-10 animate-wave-3"></span>
              <svg
                className="w-20 h-20 text-white z-10"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                {/* Modern microphone icon */}
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.2-3c0 3.53-2.9 6.43-6.4 6.43S4.8 14.53 4.8 11H3c0 4.38 3.51 7.9 7.8 8.44V22h2.4v-2.56c4.29-.54 7.8-4.06 7.8-8.44h-1.8z" />
              </svg>
            </div>
          ) : (
            // Default AI Assistant icon
            <svg
              className="w-20 h-20 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>

        {/* Status Text and Sub-text */}
        <h1 className="text-4xl font-light text-white mb-2 animate-fadeInUp">
          {getStatusText()}
        </h1>
        <p
          className={`text-lg text-gray-400 font-light transition-opacity duration-300 ${
            isCallActive ? "opacity-100" : "opacity-75"
          }`}
        >
          {getSubStatusText()}
        </p>

        {callStatus.status === "error" && (
          <p className="text-red-400 text-sm mt-4 animate-fadeIn">
            {callStatus.error}
          </p>
        )}
      </div>

      {/* Call Controls Grid */}
      <div className="relative z-10 pb-12 px-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Mute Button (always visible when active, or for info when idle) */}
          <div className="flex flex-col items-center">
            <button
              onClick={toggleMute}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
                isCallActive
                  ? isMuted
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-800 opacity-50 cursor-not-allowed" // Disabled look when not active
              }`}
              disabled={!isCallActive}
            >
              {isMuted ? (
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.5 12c0-.52-.09-1.02-.27-1.48L19 7.96V10h2V6h-4V4h2V0h-2V2c-.7-.41-1.48-.7-2.3-1S12 0 12 0L9 3H7v4l2.25 2.25c-.15.42-.25.86-.25 1.3C9 14.04 10.96 16 13.4 16c.86 0 1.64-.25 2.3-.64L18.06 19.5 19.5 18.06 16.5 12zM12 17.5c-2.48 0-4.5-2.02-4.5-4.5V5c0-1.66 1.34-3 3-3s3 1.34 3 3v.5l4 4V13c0 2.48-2.02 4.5-4.5 4.5z" />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.2-3c0 3.53-2.9 6.43-6.4 6.43S4.8 14.53 4.8 11H3c0 4.38 3.51 7.9 7.8 8.44V22h2.4v-2.56c4.29-.54 7.8-4.06 7.8-8.44h-1.8z" />
                </svg>
              )}
            </button>
            <span className="text-xs text-gray-400 mt-2">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </div>

          {/* Spacer / Placeholder */}
          <div></div>

          {/* Placeholder for other features (e.g., Speaker, Keypad, Add Call, etc.) */}
          {/* You can add more buttons here if needed for a full phone interface simulation */}
          {/* Example: Speaker button */}
          <div className="flex flex-col items-center">
            <button
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
                isCallActive
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-800 opacity-50 cursor-not-allowed"
              }`}
              disabled={!isCallActive}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18 10v4h-2V10h2zm-2 0v4H8V10h8zm-8 0v4H6V10h2zm-2 0v4H4V10h2z" />
              </svg>
            </button>
            <span className="text-xs text-gray-400 mt-2">Speaker</span>
          </div>
        </div>

        {/* Main Call/End Button */}
        <div className="flex justify-center">
          {!isCallActive ? (
            <button
              onClick={startCall}
              className={`w-24 h-24 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl active:scale-95 ${
                callStatus.status === "connecting"
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
              disabled={callStatus.status === "connecting"}
            >
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={endCall}
              className="w-24 h-24 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl active:scale-95"
            >
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM8.5 16l3.5-2.5L15.5 16 12 18.5 8.5 16z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Configuration Notice */}
      {(VAPI_API_KEY === "your-vapi-api-key" ||
        ASSISTANT_ID === "your-assistant-id") && (
        <div className="absolute bottom-0 left-0 right-0 bg-yellow-900 bg-opacity-90 p-3 text-center">
          <p className="text-yellow-200 text-xs">
            Configure `NEXT_PUBLIC_VAPI_API_KEY` and
            `NEXT_PUBLIC_VAPI_ASSISTANT_ID`
          </p>
        </div>
      )}
    </div>
  );
}
