"use client";

import React, { useState, useEffect, useRef } from "react";

export default function AIConversationPartner() {
  const [callStatus, setCallStatus] = useState({ status: "idle" });
  const [isVapiLoaded, setIsVapiLoaded] = useState(false);
  const [isListening, setIsListening] = useState(false);

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
      vapiClientRef.current = window.vapiSDK.run({
        apiKey: VAPI_API_KEY,
        assistant: {
          id: ASSISTANT_ID,
          systemPrompt: `You are a friendly and engaging conversation partner who loves to talk and listen. 
          
          Your role is to:
          1. Start conversations naturally and warmly
          2. Listen carefully to what the user wants to talk about
          3. Ask interesting follow-up questions to keep the conversation flowing
          4. Share your thoughts and opinions when appropriate
          5. Be genuinely interested in the user's stories and experiences
          6. Speak naturally and conversationally
          7. Encourage the user to share more about whatever topic they choose
          
          Just be yourself and have a natural conversation. Don't follow any script - just talk about whatever comes up naturally!`,
        },
        realTimeTranscription: {
          enabled: true,
          language: "en-US",
        },
      });

      const client = vapiClientRef.current;

      const handleCallStart = () => {
        setCallStatus({ status: "connecting" });
      };

      const handleCallConnect = () => {
        setCallStatus((prev) => ({
          ...prev,
          status: "connected",
          duration: 0,
        }));

        durationIntervalRef.current = setInterval(() => {
          setCallStatus((prev) => ({
            ...prev,
            duration: (prev.duration || 0) + 1,
          }));
        }, 1000);
      };

      const handleCallEnd = () => {
        setCallStatus({ status: "ended" });
        setIsListening(false);
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
        setIsListening(false);
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      };

      const handleSpeechStart = () => {
        setIsListening(true);
      };

      const handleSpeechEnd = () => {
        setIsListening(false);
      };

      client.on("call-start", handleCallStart);
      client.on("speech-start", handleSpeechStart);
      client.on("speech-end", handleSpeechEnd);
      client.on("call-end", handleCallEnd);
      client.on("error", handleCallError);

      return () => {
        client.off("call-start", handleCallStart);
        client.off("speech-start", handleSpeechStart);
        client.off("speech-end", handleSpeechEnd);
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
    setCallStatus({ status: "connecting" });

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
      setCallStatus({ status: "ended" });
      setIsListening(false);
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
        return "AI Conversation Partner";
      case "connecting":
        return "Connecting...";
      case "connected":
        return isListening ? "Listening..." : "In Conversation";
      case "ended":
        return "Call Ended";
      case "error":
        return "Connection Error";
      default:
        return "AI Conversation Partner";
    }
  };

  const getSubStatusText = () => {
    switch (callStatus.status) {
      case "idle":
        return "Tap to start a natural conversation";
      case "connecting":
        return "Getting ready to chat...";
      case "connected":
        return isListening
          ? "I'm listening to you speak"
          : "We're having a conversation";
      case "ended":
        return "Thanks for the great conversation!";
      case "error":
        return "Something went wrong. Try again.";
      default:
        return "";
    }
  };

  const isCallActive =
    callStatus.status === "connected" || callStatus.status === "connecting";

  if (!isVapiLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-800 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">
            Loading AI Assistant...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 flex flex-col font-sans relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-blue-100 opacity-30 rounded-full mix-blend-multiply animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-80 h-80 bg-purple-100 opacity-30 rounded-full mix-blend-multiply animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-50 opacity-40 rounded-full mix-blend-multiply animate-pulse animation-delay-2000"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">
        {/* Status Indicator */}
        <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm p-6 rounded-2xl mb-8 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                callStatus.status === "idle"
                  ? "bg-gray-400"
                  : callStatus.status === "connecting"
                  ? "bg-yellow-400 animate-pulse"
                  : callStatus.status === "connected"
                  ? isListening
                    ? "bg-green-400 animate-pulse"
                    : "bg-blue-400"
                  : callStatus.status === "error"
                  ? "bg-red-400"
                  : "bg-gray-400"
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-600">
              {callStatus.status === "idle"
                ? "Ready"
                : callStatus.status === "connecting"
                ? "Connecting"
                : callStatus.status === "connected"
                ? isListening
                  ? "You're Speaking"
                  : "AI is Listening"
                : callStatus.status === "error"
                ? "Error"
                : "Disconnected"}
            </span>
          </div>

          {/* Call Duration */}
          {isCallActive && callStatus.duration && (
            <div className="text-2xl font-mono text-gray-700 mb-2">
              {formatDuration(callStatus.duration)}
            </div>
          )}
        </div>

        {/* Main Call Interface */}
        <div
          className={`relative w-48 h-48 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ease-in-out shadow-xl ${
            isCallActive
              ? "bg-gradient-to-br from-blue-500 to-purple-600 scale-105"
              : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300"
          }`}
        >
          {isCallActive ? (
            <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden">
              {/* Animated rings for active call */}
              <div className="absolute inset-4 rounded-full border-2 border-white/30 animate-ping"></div>
              <div className="absolute inset-8 rounded-full border-2 border-white/20 animate-ping animation-delay-300"></div>
              <div className="absolute inset-12 rounded-full border-2 border-white/10 animate-ping animation-delay-600"></div>

              {/* Dynamic icon based on listening state */}
              {isListening ? (
                <svg
                  className="w-16 h-16 text-white z-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.2-3c0 3.53-2.9 6.43-6.4 6.43S4.8 14.53 4.8 11H3c0 4.38 3.51 7.9 7.8 8.44V22h2.4v-2.56c4.29-.54 7.8-4.06 7.8-8.44h-1.8z" />
                </svg>
              ) : (
                <svg
                  className="w-16 h-16 text-white z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              )}
            </div>
          ) : (
            <svg
              className="w-16 h-16 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          )}
        </div>

        {/* Status Text */}
        <h1 className="text-4xl font-light text-gray-800 mb-3">
          {getStatusText()}
        </h1>
        <p className="text-lg text-gray-600 font-light max-w-md mx-auto leading-relaxed">
          {getSubStatusText()}
        </p>

        {/* Error Display */}
        {callStatus.status === "error" && (
          <div className="w-full max-w-md mx-auto bg-red-50 border border-red-200 p-4 rounded-xl mt-6">
            <p className="text-red-600 text-sm font-medium">
              {callStatus.error}
            </p>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="relative z-10 pb-12 px-8">
        <div className="flex justify-center">
          {!isCallActive ? (
            <button
              onClick={startCall}
              className={`w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 group ${
                callStatus.status === "connecting"
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
              disabled={callStatus.status === "connecting"}
            >
              {callStatus.status === "connecting" ? (
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-200"
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
              )}
            </button>
          ) : (
            <button
              onClick={endCall}
              className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 group"
            >
              <svg
                className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Call action text */}
        <p className="text-center text-gray-500 text-sm mt-4 font-medium">
          {!isCallActive ? "Tap to start conversation" : "Tap to end call"}
        </p>
      </div>

      {/* Configuration Notice */}
      {(VAPI_API_KEY === "your-vapi-api-key" ||
        ASSISTANT_ID === "your-assistant-id") && (
        <div className="absolute bottom-0 left-0 right-0 bg-amber-50 border-t border-amber-200 p-4 text-center">
          <p className="text-amber-700 text-xs font-medium">
            Configure `NEXT_PUBLIC_VAPI_API_KEY` and
            `NEXT_PUBLIC_VAPI_ASSISTANT_ID` in your environment variables
          </p>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse-fade {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-pulse-fade {
          animation: pulse-fade 2s ease-in-out infinite;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
