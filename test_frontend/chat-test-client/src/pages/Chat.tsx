import { useEffect, useState } from "react";

import { socket, connectSocket } from "../services/socket";
import { getToken, removeToken } from "../utils/auth.utils";

import type { ChatMessage } from "../types/chat.types";

interface ChatProps {
  onLogout: () => void;
}

const Chat = ({ onLogout }: ChatProps) => {

  const [sessionId, setSessionId] =
    useState("");

  const [joined, setJoined] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [connectionStatus, setConnectionStatus] =
    useState("Connecting...");

  useEffect(() => {

    const token = getToken();

    if (!token) {
      onLogout();
      return;
    }

    socket.auth = { token };
    connectSocket();

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      setConnectionStatus("Connected");
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setConnectionStatus("Disconnected");
    };

    const handleConnectError = (error: any) => {
      console.error("Socket connection error:", error.message);
      setConnectionStatus(`Connection failed: ${error.message}`);
    };

    const handleJoinedRoom = (data: any) => {
      console.log("Joined room:", data);
      setJoined(true);
    };

    const handleLeftRoom = (data: any) => {
      console.log("Left room:", data);
      setJoined(false);
    };

    const handleNewMessage = (chat: ChatMessage) => {
      console.log("New message:", chat);
      setMessages((previous) => [...previous, chat]);
    };

    const handleError = (error: any) => {
      console.error("Chat error:", error);
      alert(error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("joined-room", handleJoinedRoom);
    socket.on("left-room", handleLeftRoom);
    socket.on("new-message", handleNewMessage);
    socket.on("error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("joined-room", handleJoinedRoom);
      socket.off("left-room", handleLeftRoom);
      socket.off("new-message", handleNewMessage);
      socket.off("error", handleError);
      socket.disconnect();
    };

  }, [onLogout]);


  const handleJoinSession = () => {

    if (!sessionId.trim()) {
      alert("Enter session ID");
      return;
    }

    socket.emit(
      "join-session",
      sessionId
    );
  };


  const handleLeaveSession = () => {

    if (!sessionId) {
      return;
    }

    socket.emit(
      "leave-session",
      sessionId
    );
  };


  const handleSendMessage = () => {

    if (!message.trim()) {
      return;
    }

    if (!sessionId) {
      alert("Join a session first");
      return;
    }

    socket.emit(
      "send-message",
      {
        sessionId,
        message,
        type: "TEXT",
      }
    );

    setMessage("");
  };


  const handleLogout = () => {

    socket.disconnect();

    removeToken();

    onLogout();
  };


  return (
    <div className="chat-page">

      <div className="chat-container">

        <div className="chat-header">

          <div>
            <h1>Live Chat</h1>

            <p>
              Status:{" "}
              <strong>
                {connectionStatus}
              </strong>
            </p>
          </div>

          <button
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>


        <div className="session-controls">

          <input
            value={sessionId}
            onChange={(e) =>
              setSessionId(e.target.value)
            }
            placeholder="Enter Session ID"
            disabled={joined}
          />

          {!joined ? (
            <button
              onClick={handleJoinSession}
            >
              Join Session
            </button>
          ) : (
            <button
              onClick={handleLeaveSession}
            >
              Leave Session
            </button>
          )}

        </div>


        <div className="messages">

          {messages.length === 0 && (
            <p className="empty">
              No messages yet
            </p>
          )}

          {messages.map((chat) => (
            <div
              key={chat.id}
              className="message"
            >
              <strong>
                {chat.user?.name || chat.userId}
              </strong>

              <p>
                {chat.message}
              </p>

              <small>
                {new Date(
                  chat.createdAt
                ).toLocaleTimeString()}
              </small>
            </div>
          ))}

        </div>


        <div className="message-input">

          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            placeholder={
              joined
                ? "Type your message..."
                : "Join a session first"
            }
            disabled={!joined}
          />

          <button
            onClick={handleSendMessage}
            disabled={!joined}
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
};

export default Chat;