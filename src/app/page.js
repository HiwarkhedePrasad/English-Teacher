"use client";

import React, { useState, useEffect, useRef } from "react";

export default function VapiPhoneInterface() {
  const [callStatus, setCallStatus] = useState({ status: "idle" });
  const [isVapiLoaded, setIsVapiLoaded] = useState(false);
  const vapiClientRef = useRef(null);
  const durationIntervalRef = useRef(null);

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
      };

      // Register event listeners
      client.on("call-start", handleCallStart);
      client.on("speech-start", handleCallConnect);
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
        return "AI Assistant";
      case "ended":
        return "Call Ended";
      case "error":
        return "Connection Error";
      default:
        return "AI Assistant";
    }
  };

  const isCallActive =
    callStatus.status === "connected" || callStatus.status === "connecting";

  if (!isVapiLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-600 border-t-white mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center p-4 pt-8">
        <div className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
        </div>
        <div className="text-white text-sm font-medium">9:41</div>
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 17h20v2H2zm1.15-4.05L4 11l-.85 1.95L1 13l2.15-.05L4 11l.85 1.95L7 12l-1.15.05L4 15l-1.85-1.95L0 13l2.15-.05zm6.7-.4c-.4.4-.4 1 0 1.4l.4.4c.4.4 1 .4 1.4 0l5.5-5.5c.4-.4.4-1 0-1.4l-.4-.4c-.4-.4-1-.4-1.4 0l-5.5 5.5z" />
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V19c0 .73.6 1.33 1.33 1.33h8.34c.73 0 1.33-.6 1.33-1.33V5.33C18 4.6 17.4 4 16.67 4z" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Contact Info */}
        <div className="text-center mb-16">
          <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mb-6 mx-auto">
            <svg
              className="w-16 h-16 text-gray-400"
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
          </div>

          <h1 className="text-2xl font-light text-white mb-2">
            {getStatusText()}
          </h1>

          {/* Timer */}
          <div className="text-lg text-gray-400">
            {callStatus.status === "connected" && callStatus.duration
              ? formatDuration(callStatus.duration)
              : callStatus.status === "connecting"
              ? "00:00"
              : callStatus.status === "error"
              ? callStatus.error
              : "Touch to call"}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-16">
          {callStatus.status === "connecting" && (
            <div className="flex items-center justify-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}

          {callStatus.status === "connected" && (
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Call Controls */}
      <div className="pb-12 px-8">
        <div className="flex justify-center">
          {!isCallActive ? (
            <button
              onClick={startCall}
              className="w-20 h-20 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95"
              disabled={callStatus.status === "connecting"}
            >
              <svg
                className="w-10 h-10 text-white"
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
              className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95"
            >
              <svg
                className="w-8 h-8 text-white"
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
        <div className="absolute bottom-0 left-0 right-0 bg-yellow-900 bg-opacity-90 p-3">
          <p className="text-yellow-200 text-xs text-center">
            Configure VAPI_API_KEY and ASSISTANT_ID to enable calling
          </p>
        </div>
      )}
    </div>
  );
}
